import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  Max,
} from 'class-validator';

/** 更新退货申请状态 DTO */
export class UpdateReturnStatusDto {
  @ApiProperty({ description: '退货申请ID' })
  @IsInt()
  @IsNotEmpty()
  id: number;

  @ApiProperty({
    description: '申请状态：0->待处理；1->退货中；2->已完成；3->已拒绝',
  })
  @IsInt()
  @Min(0)
  @Max(3)
  status: number;

  @ApiPropertyOptional({ description: '处理备注' })
  @IsString()
  @IsOptional()
  handleNote?: string;

  @ApiPropertyOptional({ description: '处理人' })
  @IsString()
  @IsOptional()
  handleMan?: string;

  @ApiPropertyOptional({ description: '收货人' })
  @IsString()
  @IsOptional()
  receiveMan?: string;

  @ApiPropertyOptional({ description: '退款金额' })
  @IsNumber()
  @IsOptional()
  refundAmount?: number;

  @ApiPropertyOptional({ description: '公司收货地址ID' })
  @IsInt()
  @IsOptional()
  companyAddressId?: number;

  @ApiPropertyOptional({ description: '收货备注' })
  @IsString()
  @IsOptional()
  receiveNote?: string;
}
