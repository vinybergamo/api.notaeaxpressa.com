import { Body, Controller } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { Endpoint } from '@/helpers/decorators/endpoint.decorator';
import { Me } from '@/helpers/decorators/me.decorator';
import { CreateApplicationDto } from './dto/create-application.dto';

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Endpoint({
    method: 'POST',
  })
  async createApplication(
    @Me() user: UserRequest,
    @Body() createApplicationDto: CreateApplicationDto,
  ) {
    return this.applicationsService.create(user, createApplicationDto);
  }
}
