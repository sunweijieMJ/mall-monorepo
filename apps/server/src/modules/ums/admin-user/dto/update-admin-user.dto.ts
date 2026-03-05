import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min, Max } from 'class-validator';

/** 更新管理员信息 DTO */
export class UpdateAdminUserDto {
  @ApiPropertyOptional({ description: '用户名' })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiPropertyOptional({ description: '密码' })
  @IsString()
  @IsOptional()
  password?: string;

  @ApiPropertyOptional({ description: '头像' })
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiPropertyOptional({ description: '邮箱' })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ description: '昵称' })
  @IsString()
  @IsOptional()
  nickName?: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsString()
  @IsOptional()
  note?: string;

  @ApiPropertyOptional({
    description: '帐号启用状态：0->禁用；1->启用',
    example: 1,
  })
  @IsInt()
  @Min(0)
  @Max(1)
  @IsOptional()
  status?: number;
}
