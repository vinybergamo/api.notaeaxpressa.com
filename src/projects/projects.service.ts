import { Injectable, NotFoundException } from '@nestjs/common';
import { ProjectsRepository } from './projects.repository';
import { PaginateQuery } from 'nestjs-paginate';
import { CustomersRepository } from '@/customers/customers.repository';
import { CreateProjectDto } from './dto/create-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly projectsRepository: ProjectsRepository,
    private readonly customersRepository: CustomersRepository,
  ) {}

  async list(
    user: UserRequest,
    paginateQuery: PaginateQuery,
    relations?: string,
  ) {
    return this.projectsRepository.list(
      user.id,
      paginateQuery,
      relations.split(/[;,\s]+/).filter(Boolean) || [],
    );
  }

  async create(user: UserRequest, createProjectDto: CreateProjectDto) {
    const projects = await this.projectsRepository.find({
      user: { id: user.id },
    });

    const customer = createProjectDto.customerId
      ? await this.customersRepository.findByIdOrFail(
          createProjectDto.customerId,
          {
            relations: ['user'],
          },
        )
      : null;

    if (customer && customer.user.id !== user.id) {
      throw new NotFoundException(
        'CUSTOMER_NOT_FOUND',
        'Customer not found or does not belong to the user.',
      );
    }

    const project = await this.projectsRepository.create({
      ...createProjectDto,
      index: projects.length + 1,
      customer,
      user: { id: user.id },
    });

    return project;
  }
}
