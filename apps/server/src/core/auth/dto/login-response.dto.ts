import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty({ description: 'JWT Access Token' })
  token: string;

  @ApiProperty({ description: 'Refresh Token（用于无感刷新）' })
  refreshToken: string;

  @ApiProperty({ description: 'Token 过期时间戳（ms）' })
  tokenExpires: number;
}
