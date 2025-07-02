import { Charge } from '@/charges/entities/charge.entity';
import {
  OnChargeCompleted,
  OnChargeCreate,
} from '@/helpers/decorators/charge.decorator';
import { Injectable, NotFoundException } from '@nestjs/common';
import axios from 'axios';
import { format, milliseconds } from 'date-fns';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { InvoicesRepository } from './invoices.repository';
import { CompaniesRepository } from '@/companies/companies.repository';
import { ChargesRepository } from '@/charges/charges.repository';
import { CustomersRepository } from '@/customers/customers.repository';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Invoice } from './entities/invoice.entity';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class InvoicesService {
  private readonly httpService = axios.create({
    baseURL: this.configService.getOrThrow<string>('INVOICE_API_URL'),
    auth: {
      username: this.configService.getOrThrow<string>('INVOICE_API_TOKEN'),
      password: '',
    },
    timeout: milliseconds({
      seconds: 10,
    }),
  });

  constructor(
    @InjectQueue('invoices')
    private readonly invoicesQueue: Queue<Invoice>,
    private readonly invoicesRepository: InvoicesRepository,
    private readonly companiesRepository: CompaniesRepository,
    private readonly chargesRepository: ChargesRepository,
    private readonly customersRepository: CustomersRepository,
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createInvoice(user: UserRequest, createInvoiceDto: CreateInvoiceDto) {
    const company = await this.companiesRepository.findByIdOrFail(
      createInvoiceDto.companyId,
      {
        relations: ['user'],
      },
    );

    if (company.user.id !== user.id) {
      throw new NotFoundException(
        'COMPANY_NOT_FOUND',
        'Company not found or does not belong to the user.',
      );
    }

    const countQuery = this.invoicesRepository.count({
      company: { id: company.id },
    });

    const chargeQuery = createInvoiceDto.chargeId
      ? this.chargesRepository.findById(createInvoiceDto.chargeId)
      : Promise.resolve(null);

    const customerQuery = createInvoiceDto.customerId
      ? this.customersRepository.findById(createInvoiceDto.customerId)
      : Promise.resolve(null);

    const [count, charge, customer] = await Promise.all([
      countQuery,
      chargeQuery,
      customerQuery,
    ]);

    const invoice = await this.invoicesRepository.create({
      ...createInvoiceDto,
      correlationId: format(new Date(), 'yyyyMMddHHmmssSSS'),
      issueDate: new Date(createInvoiceDto.issueDate),
      index: count + 1,
      company,
      charge,
      customer,
    });

    return invoice;
  }

  @OnChargeCreate()
  async onChargeCreate(charge: Charge): Promise<void> {
    if (charge.issueInvoice !== 'BEFORE_PAYMENT') {
      return;
    }

    this.sendToProcessingQueue(charge);
  }

  @OnChargeCompleted()
  async onChargeCompleted(charge: Charge): Promise<void> {
    if (charge.issueInvoice !== 'AFTER_PAYMENT') {
      return;
    }

    this.sendToProcessingQueue(charge);
  }

  @OnEvent('webhooks.invoice.nfse')
  async handleInvoiceWebhook(data: any) {
    const invoice = await this.invoicesRepository.findOne({
      correlationId: data.ref,
    });

    if (!invoice) {
      return;
    }

    if (invoice.status === 'AUTHORIZED') {
      return;
    }

    const status = this.convertStatus(data.status);

    const updatedInvoice = await this.invoicesRepository.update(
      invoice.id,
      {
        status,
        issueDate: new Date(data.data_emissao),
        rpsNumber: data.numero_rps,
        rpsSeries: data.serie_rps,
        rpsType: data.tipo_rps,
        danfseUlr: data.url_danfse,
        verificationCode: data.codigo_verificacao,
        nfseNumber: data.numero,
        xmlPath: data.caminho_xml_nota_fiscal,
        metadata: data,
        url: data.url,
      },
      {
        relations: ['company', 'charge', 'customer'],
      },
    );

    this.eventEmitter.emit(`invoices.${status.toLowerCase()}`, updatedInvoice);
  }

  private async sendToProcessingQueue(charge: Charge) {
    const invoice = await this.createInvoice(charge.user, {
      companyId: charge.company.uuid,
      amount: charge.amount,
      description: charge?.description,
      customerId: charge.customer?.uuid,
      chargeId: charge.uuid,
      issueDate: new Date(),
      serviceCode: charge.invoiceServiceCode,
    });

    await this.invoicesQueue.add('proccess', invoice, {
      jobId: invoice.uuid,
      attempts: 10,
      backoff: {
        type: 'exponential',
        delay: milliseconds({ seconds: 30 }),
      },
    });
  }

  private convertStatus(status: string) {
    switch (status) {
      case 'autorizado':
        return 'AUTHORIZED';
      default:
        return 'UNKNOWN';
    }
  }
}
