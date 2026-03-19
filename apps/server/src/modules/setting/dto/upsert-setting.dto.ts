import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsObject } from 'class-validator';

export class UpsertSettingDto {
  @ApiProperty({ description: '配置值（JSON）' })
  @IsObject()
  @IsNotEmpty()
  value: Record<string, any>;
}
