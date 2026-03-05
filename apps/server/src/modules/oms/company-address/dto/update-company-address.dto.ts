import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min, Max } from 'class-validator';

/** 更新公司收发货地址 DTO */
export class UpdateCompanyAddressDto {
  @ApiPropertyOptional({ description: '地址名称' })
  @IsString()
  @IsOptional()
  addressName?: string;

  @ApiPropertyOptional({ description: '默认发货地址：0->否；1->是' })
  @IsInt()
  @Min(0)
  @Max(1)
  @IsOptional()
  sendStatus?: number;

  @ApiPropertyOptional({ description: '默认收货地址：0->否；1->是' })
  @IsInt()
  @Min(0)
  @Max(1)
  @IsOptional()
  receiveStatus?: number;

  @ApiPropertyOptional({ description: '收发货人姓名' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: '手机号' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ description: '省/直辖市' })
  @IsString()
  @IsOptional()
  province?: string;

  @ApiPropertyOptional({ description: '市' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({ description: '区' })
  @IsString()
  @IsOptional()
  region?: string;

  @ApiPropertyOptional({ description: '详细地址' })
  @IsString()
  @IsOptional()
  detailAddress?: string;
}
