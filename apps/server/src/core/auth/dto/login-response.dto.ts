import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty({ description: 'JWT Token' })
  token: string;

  @ApiProperty({ description: 'Token 前缀', example: 'Bearer' })
  tokenHead: string;
}
