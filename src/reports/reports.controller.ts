import { Controller, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { Endpoint } from '@/helpers/decorators/endpoint.decorator';
import { Me } from '@/helpers/decorators/me.decorator';
import { GetChargesReportDto } from './dto/charges-report.dto';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Endpoint({
    method: 'GET',
    path: 'charges',
  })
  async getChargesReport(
    @Me() user: UserRequest,
    @Query() chargesReportDto: GetChargesReportDto,
  ) {
    return this.reportsService.getChargesReport(user, chargesReportDto);
  }
}
