import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  Max,
} from 'class-validator';

/** 创建公司收发货地址 DTO */
export class CreateCompanyAddressDto {
  @ApiProperty({ description: '地址名称', example: '深圳仓库' })
  @IsString()
  @IsNotEmpty()
  addressName: string;

  @ApiPropertyOptional({
    description: '默认发货地址：0->否；1->是',
    example: 0,
  })
  @IsInt()
  @Min(0)
  @Max(1)
  @IsOptional()
  sendStatus?: number;

  @ApiPropertyOptional({
    description: '默认收货地址：0->否；1->是',
    example: 0,
  })
  @IsInt()
  @Min(0)
  @Max(1)
  @IsOptional()
  receiveStatus?: number;

  @ApiProperty({ description: '收发货人姓名' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: '手机号' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ description: '省/直辖市' })
  @IsString()
  @IsNotEmpty()
  province: string;

  @ApiProperty({ description: '市' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ description: '区' })
  @IsString()
  @IsNotEmpty()
  region: string;

  @ApiProperty({ description: '详细地址' })
  @IsString()
  @IsNotEmpty()
  detailAddress: string;
}
