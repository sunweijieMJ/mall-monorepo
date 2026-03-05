import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

/** 管理员登录 DTO（对应前端 POST /admin/login） */
export class AdminLoginDto {
  @ApiProperty({ example: 'admin@mall.com', description: '管理员账号（邮箱）' })
  @IsEmail()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'Admin@123', description: '登录密码' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
