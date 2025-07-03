import { BadRequestException, Injectable } from '@nestjs/common';
import { CompaniesRepository } from './companies.repository';
import { CreateCompanyDto } from './dto/create-company.dto';
import { whereId } from '@/utils/where-id';

@Injectable()
export class CompaniesService {
  constructor(private readonly companiesRepository: CompaniesRepository) {}

  async create(user: UserRequest, createCompanyDto: CreateCompanyDto) {
    const exists = await this.companiesRepository.exists({
      user: { id: user.id },
      document: createCompanyDto.document,
    });

    if (exists) {
      throw new BadRequestException(
        'COMPANY_ALREADY_EXISTS',
        'A company with this document already exists.',
      );
    }

    const count = await this.companiesRepository.count({
      user: { id: user.id },
    });

    return this.companiesRepository.create({
      ...createCompanyDto,
      user: { id: user.id },
      index: count + 1,
      isDefault: count === 0,
    });
  }

  async setDefaultCompany(user: UserRequest, companyId: Id) {
    const company = await this.companiesRepository.findOneOrFail({
      ...whereId(companyId),
      user: { id: user.id },
    });

    const oldCompany = await this.companiesRepository.findOne({
      user: { id: user.id },
      isDefault: true,
    });

    if (oldCompany) {
      await this.companiesRepository.update(oldCompany.id, {
        isDefault: false,
      });
    }

    return this.companiesRepository.update(company.id, {
      isDefault: true,
    });
  }
}
