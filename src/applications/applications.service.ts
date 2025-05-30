import { Injectable, NotFoundException } from '@nestjs/common';
import { ApplicationsRepository } from './applications.repository';
import { CreateApplicationDto } from './dto/create-application.dto';
import { JwtService } from '@nestjs/jwt';
import { mask } from '@/utils/mask';
import { ILike } from 'typeorm';
import { TokensBlackListsRepository } from '@/tokens/tokens.repository';
import { RegenerateTokenDto } from './dto/regenerate-token.dto';

@Injectable()
export class ApplicationsService {
  constructor(
    private readonly applicationsRepository: ApplicationsRepository,
    private readonly jwtService: JwtService,
    private readonly tokensBlackListsRepository: TokensBlackListsRepository,
  ) {}

  async create(user: UserRequest, createApplicationDto: CreateApplicationDto) {
    const applicationsCountPromisse = this.applicationsRepository.count({
      user: { id: user.id },
    });
    const applcationExistsPromisse = this.applicationsRepository.findOne({
      user: { id: user.id },
      name: ILike(`%${createApplicationDto.name}%`),
    });

    const [applicationsCount, applicationExists] = await Promise.all([
      applicationsCountPromisse,
      applcationExistsPromisse,
    ]);

    if (applicationExists) {
      throw new NotFoundException(
        'APPLICATION_EXISTS',
        'An application with this name already exists.',
      );
    }

    const application = await this.applicationsRepository.create({
      ...createApplicationDto,
      index: applicationsCount + 1,
      token: await this.generateJwtToken(user.id, 1),
      maskedToken: '',
      user,
    });

    const token = await this.generateJwtToken(
      application.id,
      createApplicationDto.tokenExpiresIn,
    );

    const updatedApplication = await this.applicationsRepository.update(
      application.id,
      {
        token,
        maskedToken: mask(token, 4),
      },
    );

    return {
      ...updatedApplication,
      token,
    };
  }

  async regenerateToken(
    user: UserRequest,
    applicationId: Id,
    regenerateTokenDto: RegenerateTokenDto,
  ) {
    const application = await this.applicationsRepository.findByIdOrFail(
      applicationId,
      {
        relations: ['user'],
      },
    );

    if (application.user.id !== user.id) {
      throw new NotFoundException(
        'APPLICATION_NOT_FOUND',
        'Application not found or does not belong to the user.',
      );
    }

    await this.tokensBlackListsRepository.create({
      token: application.token,
      reason: 'REGENERATE',
    });

    const token = await this.generateJwtToken(
      application.id,
      regenerateTokenDto.tokenExpiresIn,
    );

    const updatedApplication = await this.applicationsRepository.update(
      application.id,
      {
        token,
        maskedToken: mask(token, 4),
      },
    );

    return {
      ...updatedApplication,
      token,
    };
  }

  private async generateJwtToken(applicationId: number, expiresIn?: number) {
    const payload = { sub: applicationId, isApplication: true };
    const options = expiresIn ? { expiresIn } : undefined;

    return this.jwtService.sign(payload, options);
  }
}
