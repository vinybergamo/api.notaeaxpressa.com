import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Invoice } from './entities/invoice.entity';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { format, milliseconds, parseISO } from 'date-fns';
import { convertObjectKeys } from '@/utils/convert-object-keys';
import * as math from 'mathjs';
import { InvoicesRepository } from './invoices.repository';
import { format as formatTz, toZonedTime } from 'date-fns-tz';

const TIME_ZONE = 'America/Sao_Paulo';

@Processor('invoices')
export class InvoicesProcessor extends WorkerHost {
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
    private readonly configService: ConfigService,
    private readonly invoicesRepository: InvoicesRepository,
  ) {
    super();
  }

  process(job: Job): Promise<any> {
    switch (job.name) {
      case 'proccess':
        return this.processInvoice(job);
      case 'authorized':
        return this.processAuthorizedInvoice(job);
      default:
        return job.retry();
    }
  }

  async processInvoice(job: Job<Invoice>): Promise<any> {
    const { data: invoice } = job;

    try {
      const payload = convertObjectKeys(
        invoice,
        {
          issueDate: 'data_emissao',
          operationType: 'natureza_operacao',
          simpleNationalOptIn: 'optante_simples_nacional',
          providerDocument: `prestador.${invoice.providerDocumentType.toLowerCase()}`,
          providerCityCode: 'prestador.codigo_municipio',
          providerMunicipalRegistration: 'prestador.inscricao_municipal',
          amount: 'servico.valor_servicos',
          serviceListItem: 'servico.item_lista_servico',
          taxCode: 'servico.codigo_tributario_municipio',
          description: 'servico.discriminacao',
          withheldISS: 'servico.iss_retido',
          rate: 'servico.aliquota',
          customer: 'tomador',
          'customer.document': `${invoice?.customer?.documentType?.split(':')[1]?.toLowerCase()}`,
          'customer.name': 'razao_social',
        },
        {
          deleteNotMapped: true,
          deleteNullValues: true,
          parser: {
            issueDate: (value: Date) => {
              if (!value) {
                return undefined;
              }

              const date = parseISO(value.toString());
              const formattedDate = formatTz(
                toZonedTime(date, TIME_ZONE),
                'yyyy-MM-dd',
                {
                  timeZone: TIME_ZONE,
                },
              );

              console.log('Formatted issue date:', formattedDate);
              return formattedDate;
            },
            amount: (value: number) => math.divide(value, 100),
            description: (value?: string) => {
              if (!value) {
                return 'Serviço prestado';
              }

              return value.length > 255 ? value.substring(0, 255) : value;
            },
          },
        },
      );

      console.log(payload);

      const { data } = await this.httpService.post('/v2/nfse', payload, {
        params: {
          ref: invoice.correlationId,
        },
      });

      await this.invoicesRepository.update(invoice.id, {
        status: 'AUTHORIZING',
        rpsNumber: data.numero_rps,
        rpsSeries: data.serie_rps,
        rpsType: data.tipo_rps,
        metadata: data,
      });

      console.log('Invoice processing started:', data);

      return data;
    } catch (error) {
      console.error('Error processing invoice:', error);
      if (error.status === 429) {
        return job.retry();
      }

      await this.invoicesRepository.update(invoice.id, {
        status: 'ERROR',
        metadata: error?.response?.data || error.message,
      });
    }
  }

  async processAuthorizedInvoice(job: Job<Invoice>): Promise<any> {
    console.log('Processing authorized invoice:', job.id);
  }
}
