import { Charge } from '@/charges/entities/charge.entity';
import { OnChargeCompleted } from '@/helpers/decorators/charge.decorator';
import { HttpService } from '@nestjs/axios';
import { HttpException, Injectable } from '@nestjs/common';
import { format } from 'date-fns';
import { catchError } from 'rxjs';

@Injectable()
export class InvoicesService {
  constructor(private readonly httpService: HttpService) {}

  async onChargeCreate(charge: Charge): Promise<void> {
    if (charge.issueInvoice !== 'BEFORE_PAYMENT') {
      return;
    }

    return;
    this.httpService
      .post(
        '/v2/nfse',
        {
          data_emissao: new Date(),
          prestador: {
            cnpj: '49219537000136',
            codigo_municipio: '3541000',
            inscricao_municipal: '705850001',
          },
          servico: {
            valor_servicos: charge.amount / 100,
            item_lista_servico: '1402',
            discriminacao: 'Serviço de teste',
            codigo_tributario_municipio: '9511800',
          },
        },
        {
          params: {
            ref: format(new Date(), 'yyyyMMddHHmmssSSS'),
          },
        },
      )
      .pipe(
        catchError((error) => {
          console.error('Error creating invoice:', error);
          throw new HttpException(
            error.response?.data?.message || 'Error creating invoice',
            error.response?.status || 500,
          );
        }),
      );
  }

  @OnChargeCompleted()
  async onChargeCompleted(charge: Charge): Promise<void> {
    if (charge.issueInvoice !== 'AFTER_PAYMENT') {
      return;
    }
  }
}
