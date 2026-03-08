import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';

/** 创建收货地址 DTO */
export class CreateMemberAddressDto {
  @ApiProperty({ description: '收货人名称' })
  @IsString()
  name: string;

  @ApiProperty({ description: '手机号码' })
  @IsString()
  phoneNumber: string;

  @ApiPropertyOptional({ type: 'integer', description: '是否默认：0→否 1→是' })
  @IsOptional()
  @IsInt()
  defaultStatus?: number;

  @ApiPropertyOptional({ description: '邮政编码' })
  @IsOptional()
  @IsString()
  postCode?: string;

  @ApiProperty({ description: '省份/直辖市' })
  @IsString()
  province: string;

  @ApiProperty({ description: '城市' })
  @IsString()
  city: string;

  @ApiProperty({ description: '区' })
  @IsString()
  region: string;

  @ApiProperty({ description: '详细地址' })
  @IsString()
  detailAddress: string;
}

/** 更新收货地址 DTO */
export class UpdateMemberAddressDto extends PartialType(
  CreateMemberAddressDto,
) {}
