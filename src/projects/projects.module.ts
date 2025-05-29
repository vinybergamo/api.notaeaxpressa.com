import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { ProjectsRepository } from './projects.repository';
import { Customer } from '@/customers/entities/customer.entity';
import { CustomersRepository } from '@/customers/customers.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Project, Customer])],
  controllers: [ProjectsController],
  providers: [ProjectsService, ProjectsRepository, CustomersRepository],
  exports: [ProjectsService, ProjectsRepository],
})
export class ProjectsModule {}
