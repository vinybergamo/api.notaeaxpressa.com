import { ApiProperty } from '@nestjs/swagger';

export class Token {
  @ApiProperty({
    name: 'type',
    description: 'Type of the token',
    default: 'Bearer',
    example: 'Bearer',
  })
  type: string;

  @ApiProperty({
    name: 'value',
    description: 'The token value',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
  })
  value: string;

  @ApiProperty({
    name: 'expiresAt',
    description: 'Expiration date of the token',
    example: new Date(),
  })
  expiresAt: Date;

  @ApiProperty({
    name: 'expiresIn',
    description: 'Expiration time of the token in milliseconds',
    example: 3600000,
  })
  expiresIn: number;

  @ApiProperty({
    name: 'expiresInSeconds',
    description: 'Expiration time of the token in seconds',
    example: 3600,
  })
  expiresInSeconds: number;

  @ApiProperty({
    name: 'generatedAt',
    description: 'Date when the token was generated',
    example: new Date(),
  })
  generatedAt: Date;

  @ApiProperty({
    name: 'generatedIn',
    description: 'Time taken to generate the token in milliseconds',
    example: new Date().getTime(),
  })
  generatedIn: number;
}
