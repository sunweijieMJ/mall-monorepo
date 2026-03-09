import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

/** 创建会员等级 DTO */
export class CreateMemberLevelDto {
  @ApiProperty({ description: '等级名称' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ type: 'integer', description: '成长值', default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  growthPoint?: number;

  @ApiPropertyOptional({
    type: 'integer',
    description: '是否为默认等级：0→否 1→是',
    default: 0,
  })
  @IsOptional()
  @IsInt()
  defaultStatus?: number;

  @ApiPropertyOptional({ type: 'integer', description: '免运费标准' })
  @IsOptional()
  @IsNumber()
  freeFreightPoint?: number;

  @ApiPropertyOptional({
    type: 'integer',
    description: '每次评价获取的成长值',
    default: 0,
  })
  @IsOptional()
  @IsInt()
  commentGrowthPoint?: number;

  @ApiPropertyOptional({
    type: 'integer',
    description: '是否有免邮特权',
    default: 0,
  })
  @IsOptional()
  @IsInt()
  privilegeFreeFreight?: number;

  @ApiPropertyOptional({
    type: 'integer',
    description: '是否有签到特权',
    default: 0,
  })
  @IsOptional()
  @IsInt()
  privilegeSignIn?: number;

  @ApiPropertyOptional({
    type: 'integer',
    description: '是否有评论获奖励特权',
    default: 0,
  })
  @IsOptional()
  @IsInt()
  privilegeComment?: number;

  @ApiPropertyOptional({
    type: 'integer',
    description: '是否有专享活动特权',
    default: 0,
  })
  @IsOptional()
  @IsInt()
  privilegePromotion?: number;

  @ApiPropertyOptional({
    type: 'integer',
    description: '是否有会员价格特权',
    default: 0,
  })
  @IsOptional()
  @IsInt()
  privilegeMemberPrice?: number;

  @ApiPropertyOptional({
    type: 'integer',
    description: '是否有生日特权',
    default: 0,
  })
  @IsOptional()
  @IsInt()
  privilegeBirthday?: number;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  note?: string;
}

/** 更新会员等级 DTO */
export class UpdateMemberLevelDto extends PartialType(CreateMemberLevelDto) {}
