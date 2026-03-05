import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

/** 确认收货 DTO */
export class ConfirmReceiveDto {
  @ApiPropertyOptional({ description: '收货人' })
  @IsString()
  @IsOptional()
  receiveMan?: string;

  @ApiPropertyOptional({ description: '收货备注' })
  @IsString()
  @IsOptional()
  receiveNote?: string;
}
