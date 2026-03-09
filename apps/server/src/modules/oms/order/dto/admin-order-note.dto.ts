import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsNotEmpty, IsString } from 'class-validator';

/** 修改订单备注 DTO */
export class AdminOrderNoteDto {
  @ApiProperty({ description: '备注内容' })
  @IsString()
  @IsNotEmpty()
  note: string;

  @ApiProperty({
    type: 'integer',
    description:
      '订单当前状态：0-待付款 1-待发货 2-已发货 3-已完成 4-已关闭 5-无效订单',
    enum: [0, 1, 2, 3, 4, 5],
  })
  @IsInt()
  @IsIn([0, 1, 2, 3, 4, 5])
  status: number;
}
