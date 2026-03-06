import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { IsStrongPassword } from '@/common/validators/password-strength.validator';

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
  @ApiProperty({
    example: '13800138000',
    description: '手机号（同时作为登录用户名）',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^1[3-9]\d{9}$/, { message: '手机号格式不正确' })
  telephone: string;

  @ApiProperty({
    example: 'User@123',
    description: '密码（至少 8 位，包含大小写字母和数字）',
  })
  @IsString()
  @IsNotEmpty()
  @IsStrongPassword()
  password: string;

  @ApiProperty({ example: '123456', description: '短信验证码（6位数字）' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{6}$/, { message: '验证码必须为6位数字' })
  authCode: string;
}

/** 获取短信验证码查询参数 DTO */
export class GetAuthCodeDto {
  @ApiProperty({ example: '13800138000', description: '手机号' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^1[3-9]\d{9}$/, { message: '手机号格式不正确' })
  phone: string;
}

/** 移动端修改密码 DTO */
export class UpdateMemberPasswordDto {
  @ApiProperty({ example: '13800138000', description: '手机号' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^1[3-9]\d{9}$/, { message: '手机号格式不正确' })
  telephone: string;

  @ApiProperty({ example: 'NewPass@123', description: '新密码' })
  @IsString()
  @IsNotEmpty()
  @IsStrongPassword()
  password: string;

  @ApiProperty({ example: '123456', description: '短信验证码' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{6}$/, { message: '验证码必须为6位数字' })
  authCode: string;
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
