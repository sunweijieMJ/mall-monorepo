import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

/** 修改订单备注 DTO */
export class AdminOrderNoteDto {
  @ApiProperty({ description: '备注内容' })
  @IsString()
  @IsNotEmpty()
  note: string;

  @ApiProperty({ description: '订单当前状态' })
  @IsInt()
  status: number;
}
