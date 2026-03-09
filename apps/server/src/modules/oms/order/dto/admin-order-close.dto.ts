import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

/** 关闭订单 DTO */
export class AdminOrderCloseDto {
  @ApiProperty({
    description: '订单ID列表',
    type: 'array',
    items: { type: 'integer' },
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsNumber({}, { each: true })
  ids: number[];

  @ApiProperty({ description: '关闭备注' })
  @IsString()
  @IsNotEmpty()
  note: string;
}
