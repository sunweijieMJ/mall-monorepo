import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

/** 修改收货人信息 DTO */
export class AdminOrderReceiverDto {
  @ApiProperty({ description: '收货人姓名' })
  @IsString()
  @IsNotEmpty()
  receiverName: string;

  @ApiProperty({ description: '收货人手机号' })
  @IsString()
  @IsNotEmpty()
  receiverPhone: string;

  @ApiPropertyOptional({ description: '邮政编码' })
  @IsString()
  @IsOptional()
  receiverPostCode?: string;

  @ApiProperty({ description: '详细地址' })
  @IsString()
  @IsNotEmpty()
  receiverDetailAddress: string;

  @ApiProperty({ description: '省份' })
  @IsString()
  @IsNotEmpty()
  receiverProvince: string;

  @ApiProperty({ description: '城市' })
  @IsString()
  @IsNotEmpty()
  receiverCity: string;

  @ApiProperty({ description: '区' })
  @IsString()
  @IsNotEmpty()
  receiverRegion: string;

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
