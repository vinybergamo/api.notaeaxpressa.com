import { Injectable } from '@nestjs/common';
import { PlansRepository } from './plans.repository';
import { Plan } from './entities/plan.entity';
import { CreatePlanDto } from './dto/create-plan.dto';
import { PaginateQuery } from 'nestjs-paginate';

@Injectable()
export class PlansService {
  constructor(private readonly plansRepository: PlansRepository) {}

  async list(
    user: UserRequest,
    paginateQuery: PaginateQuery,
    relations?: string,
  ) {
    return this.plansRepository.list(
      user.id,
      paginateQuery,
      relations.split(/[;,\s]+/).filter(Boolean) || [],
    );
  }

  async create(user: UserRequest, createPlanDto: CreatePlanDto): Promise<Plan> {
    const plansCount = await this.plansRepository.count({
      user: { id: user.id },
    });

    const index = plansCount + 1;

    const plan = this.plansRepository.create({
      ...createPlanDto,
      isActive: true,
      user,
      index,
    });

    return plan;
  }
}
