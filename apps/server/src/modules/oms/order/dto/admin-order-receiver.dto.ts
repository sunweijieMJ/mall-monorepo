import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

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

  @ApiProperty({ description: '订单当前状态' })
  @IsInt()
  status: number;
}
