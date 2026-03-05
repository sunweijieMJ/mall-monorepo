import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { IsStrongPassword } from '@/common/validators/password-strength.validator';

/** 管理员注册 DTO */
export class RegisterAdminDto {
  @ApiProperty({ example: 'admin', description: '用户名' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    example: 'Admin@123',
    description: '密码（至少 8 位，包含大小写字母和数字）',
  })
  @IsString()
  @IsNotEmpty()
  @IsStrongPassword()
  password: string;

  @ApiProperty({
    example: 'admin@mall.com',
    description: '邮箱',
    required: false,
  })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: '管理员', description: '昵称', required: false })
  @IsString()
  @IsOptional()
  nickName?: string;

  @ApiProperty({ description: '备注', required: false })
  @IsString()
  @IsOptional()
  note?: string;

  @ApiProperty({ description: '头像', required: false })
  @IsString()
  @IsOptional()
  icon?: string;
}
