import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

/** 移动端手机号+密码登录 DTO（对应前端 POST /sso/login） */
export class PortalLoginDto {
  @ApiProperty({ example: '13800138000', description: '手机号' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^1[3-9]\d{9}$/, { message: '手机号格式不正确' })
  username: string;

  @ApiProperty({ example: 'User@123', description: '登录密码' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

/** 移动端手机号注册 DTO（对应前端 POST /sso/register） */
export class PortalRegisterDto {
  @ApiProperty({ example: '13800138000' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^1[3-9]\d{9}$/, { message: '手机号格式不正确' })
  username: string;

  @ApiProperty({ example: 'User@123' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

/** 短信验证码登录 DTO */
export class PortalSmsLoginDto {
  @ApiProperty({ example: '13800138000' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @IsNotEmpty()
  code: string;
}
