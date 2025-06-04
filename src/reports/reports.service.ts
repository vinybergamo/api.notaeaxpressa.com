import { ChargesRepository } from '@/charges/charges.repository';
import { Injectable } from '@nestjs/common';
import { GetChargesReportDto } from './dto/charges-report.dto';
import { Between } from 'typeorm';
import * as math from 'mathjs';

@Injectable()
export class ReportsService {
  constructor(private readonly chargesRepository: ChargesRepository) {}

  async getChargesReport(
    user: UserRequest,
    chargesReportDto: GetChargesReportDto,
  ) {
    const { start, end, includeCharges } = chargesReportDto;
    const charges = await this.chargesRepository.find(
      {
        user: { id: user.id },
        createdAt: Between(start, end ? end : new Date()),
      },
      {
        order: { createdAt: 'DESC' },
      },
    );

    const groupedByStatus = charges.reduce((acc, charge) => {
      const status = charge.status.toLowerCase();
      if (!acc[status]) {
        acc[status] = {
          count: 0,
          totalAmount: 0,
          totalFee: 0,
          totalLiqAmount: 0,
          charges: includeCharges ? [] : undefined,
        };
      }

      acc[status].count += 1;
      acc[status].totalAmount += math.number(charge.totalAmount);
      acc[status].totalFee += math.number(charge.fee ?? 0);
      acc[status].totalLiqAmount += math.number(charge.liqAmount ?? 0);
      if (includeCharges) {
        acc[status].charges.push(charge);
      }

      return acc;
    }, {});

    const summary = {
      totalCharges: charges.length,
      totalAmount: charges.reduce(
        (sum, charge) => sum + math.number(charge.amount),
        0,
      ),
      totalFee: charges.reduce(
        (sum, charge) => sum + math.number(charge.fee ?? 0),
        0,
      ),
      totalLiqAmount: charges.reduce(
        (sum, charge) => sum + math.number(charge.liqAmount ?? 0),
        0,
      ),
      byStatus: groupedByStatus,
      atp: {
        total: math.number(
          charges.reduce((sum, charge) => sum + charge.amount, 0),
        ),
        average: math.number(
          charges.reduce((sum, charge) => sum + charge.amount, 0) /
            charges.length,
        ),
      },
      period: {
        start: start,
        end: end || new Date(),
      },
    };

    return summary;
  }
}
