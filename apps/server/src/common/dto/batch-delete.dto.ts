import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt } from 'class-validator';

/** 批量删除 DTO */
export class BatchDeleteDto {
  @ApiProperty({
    description: 'ID 数组',
    type: 'array',
    items: { type: 'integer' },
  })
  @IsArray()
  @IsInt({ each: true })
  ids: number[];
}
