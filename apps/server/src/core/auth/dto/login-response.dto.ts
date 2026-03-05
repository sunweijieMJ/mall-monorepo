import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty({ description: 'Access Token (短期)' })
  token: string;

  @ApiProperty({ description: 'Refresh Token (长期)' })
  refreshToken: string;

  @ApiProperty({ description: 'Token 前缀', example: 'Bearer' })
  tokenHead: string;
}
