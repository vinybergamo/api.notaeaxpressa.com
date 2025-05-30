import { Body, Controller, Param } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { Endpoint } from '@/helpers/decorators/endpoint.decorator';
import { Me } from '@/helpers/decorators/me.decorator';
import { CreateApplicationDto } from './dto/create-application.dto';
import { RegenerateTokenDto } from './dto/regenerate-token.dto';

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

  @Endpoint({
    method: 'PATCH',
    path: ':id/regenerate-token',
  })
  async regenerateToken(
    @Me() user: UserRequest,
    @Param('id') id: string,
    @Body() regenerateTokenDto: RegenerateTokenDto,
  ) {
    return this.applicationsService.regenerateToken(
      user,
      id,
      regenerateTokenDto,
    );
  }
}
