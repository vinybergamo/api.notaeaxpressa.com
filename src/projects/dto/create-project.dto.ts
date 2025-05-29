import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({
    description: 'Customer ID associated with the project',
    example: '1',
    required: false,
    type: String,
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  customerId: string;

  @ApiProperty({
    description: 'Name of the project',
    example: 'Project Alpha',
    type: String,
    required: true,
  })
  @IsString()
  @Transform(({ value }) => value?.trim())
  name: string;

  @ApiProperty({
    description: 'Description of the project',
    example: 'This is a sample project description.',
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  description: string;

  @ApiProperty({
    description: 'Value of the project in cents',
    example: 1000,
    type: Number,
    required: false,
  })
  @IsInt()
  @IsOptional()
  @Transform(({ value }) => {
    if (value < 0) {
      return 0;
    }
    return value;
  })
  value: number;

  @ApiProperty({
    description: 'Logo of the project',
    example: 'https://example.com/logo.png',
    type: String,
    required: false,
  })
  @IsUrl()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  logo: string;

  @ApiProperty({
    description: 'Website of the project',
    example: 'https://example.com',
    type: String,
    required: false,
  })
  @IsUrl()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  website: string;

  @ApiProperty({
    description: 'Status of the project',
    example: 'ACTIVE',
    default: 'ACTIVE',
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  status: string;

  @ApiProperty({
    description: 'Type of the project',
    example: 'WEB',
    default: 'WEB',
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  type: string;

  @ApiProperty({
    description: 'GitHub repository of the project',
    example: 'https://github.com/user/project.git',
    type: String,
    required: false,
  })
  @IsUrl()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  git: string;
}
