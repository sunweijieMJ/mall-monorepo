import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsInt } from 'class-validator';

/** 批量删除 DTO */
export class BatchDeleteDto {
  @ApiProperty({
    description: 'ID 数组',
    type: 'array',
    items: { type: 'integer' },
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  ids: number[];
}
