import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';

/** 更新会员基本信息 DTO */
export class UpdateMemberInfoDto {
  @ApiPropertyOptional({ description: '昵称' })
  @IsOptional()
  @IsString()
  nickname?: string;

  @ApiPropertyOptional({ description: '头像' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({
    type: 'integer',
    description: '性别：0→未知 1→男 2→女',
  })
  @IsOptional()
  @IsInt()
  gender?: number;

  @ApiPropertyOptional({ description: '生日' })
  @IsOptional()
  @IsString()
  birthday?: string;

  @ApiPropertyOptional({ description: '城市' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: '职业' })
  @IsOptional()
  @IsString()
  job?: string;

  @ApiPropertyOptional({ description: '个性签名' })
  @IsOptional()
  @IsString()
  personalSign?: string;

  @ApiPropertyOptional({ description: '手机号' })
  @IsOptional()
  @IsString()
  phone?: string;
}
