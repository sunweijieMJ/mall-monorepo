import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MaxLength,
  ValidateNested,
} from 'class-validator';

/** SKU 库存子项 DTO */
export class SkuStockItemDto {
  @ApiPropertyOptional({ description: 'SKU ID', type: 'integer' })
  @IsOptional()
  @IsNumber()
  id?: number;

  @ApiPropertyOptional({ description: 'SKU 编码' })
  @IsOptional()
  @IsString()
  skuCode?: string;

  @ApiPropertyOptional({ description: '价格' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ type: 'integer', description: '库存' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;

  @ApiPropertyOptional({ type: 'integer', description: '锁定库存' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  lockStock?: number;

  @ApiPropertyOptional({ description: '规格数据（JSON 格式）' })
  @IsOptional()
  @IsString()
  spData?: string;

  @ApiPropertyOptional({ description: 'SKU 图片' })
  @IsOptional()
  @IsString()
  pic?: string;

  @ApiPropertyOptional({ type: 'integer', description: '销量' })
  @IsOptional()
  @IsNumber()
  sale?: number;

  @ApiPropertyOptional({ description: '促销价格' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  promotionPrice?: number;
}

/** 商品属性值子项 DTO */
export class ProductAttrValueItemDto {
  @ApiPropertyOptional({ description: '属性值 ID', type: 'integer' })
  @IsOptional()
  @IsNumber()
  id?: number;

  @ApiPropertyOptional({ description: '商品属性 ID', type: 'integer' })
  @IsOptional()
  @IsNumber()
  productAttributeId?: number;

  @ApiPropertyOptional({ description: '属性值' })
  @IsOptional()
  @IsString()
  value?: string;
}

/** 阶梯价格子项 DTO */
export class ProductLadderItemDto {
  @ApiPropertyOptional({ description: '阶梯价 ID', type: 'integer' })
  @IsOptional()
  @IsNumber()
  id?: number;

  @ApiPropertyOptional({ type: 'integer', description: '满足数量' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  count?: number;

  @ApiPropertyOptional({ description: '折扣' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;

  @ApiPropertyOptional({ description: '折后价格' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;
}

/** 满减价格子项 DTO */
export class ProductFullReductionItemDto {
  @ApiPropertyOptional({ description: '满减 ID', type: 'integer' })
  @IsOptional()
  @IsNumber()
  id?: number;

  @ApiPropertyOptional({ description: '满足金额' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  fullPrice?: number;

  @ApiPropertyOptional({ description: '减免金额' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  reducePrice?: number;
}

/** 会员价格子项 DTO */
export class MemberPriceItemDto {
  @ApiPropertyOptional({ description: '会员价 ID', type: 'integer' })
  @IsOptional()
  @IsNumber()
  id?: number;

  @ApiPropertyOptional({ description: '会员等级 ID', type: 'integer' })
  @IsOptional()
  @IsNumber()
  memberLevelId?: number;

  @ApiPropertyOptional({ description: '会员等级名称' })
  @IsOptional()
  @IsString()
  memberLevelName?: string;

  @ApiPropertyOptional({ description: '会员价格' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  memberPrice?: number;
}

/** 专题关联子项 DTO */
export class SubjectProductRelationItemDto {
  @ApiPropertyOptional({ description: '专题 ID', type: 'integer' })
  @IsOptional()
  @IsNumber()
  subjectId?: number;

  @ApiPropertyOptional({ description: '商品 ID', type: 'integer' })
  @IsOptional()
  @IsNumber()
  productId?: number;
}

/** 优选专区关联子项 DTO */
export class PreferenceAreaProductRelationItemDto {
  @ApiPropertyOptional({ description: '优选专区 ID', type: 'integer' })
  @IsOptional()
  @IsNumber()
  preferenceAreaId?: number;

  @ApiPropertyOptional({ description: '商品 ID', type: 'integer' })
  @IsOptional()
  @IsNumber()
  productId?: number;
}

/**
 * 创建商品 DTO
 * 包含商品主体字段 + 各关联子表数组
 */
export class CreateProductDto {
  @ApiProperty({ description: '品牌 ID', type: 'integer' })
  @IsNumber()
  brandId: number;

  @ApiPropertyOptional({ description: '品牌名称' })
  @IsOptional()
  @IsString()
  brandName?: string;

  @ApiProperty({ description: '商品分类 ID', type: 'integer' })
  @IsNumber()
  productCategoryId: number;

  @ApiPropertyOptional({ description: '商品分类名称' })
  @IsOptional()
  @IsString()
  productCategoryName?: string;

  @ApiPropertyOptional({ description: '商品属性分类 ID', type: 'integer' })
  @IsOptional()
  @IsNumber()
  productAttributeCategoryId?: number;

  @ApiPropertyOptional({ description: '运费模板 ID', type: 'integer' })
  @IsOptional()
  @IsNumber()
  freightTemplateId?: number;

  @ApiProperty({ description: '商品名称' })
  @IsString()
  @MaxLength(64)
  name: string;

  @ApiPropertyOptional({ description: '商品图片' })
  @IsOptional()
  @IsString()
  pic?: string;

  @ApiPropertyOptional({ description: '货号' })
  @IsOptional()
  @IsString()
  productSn?: string;

  @ApiPropertyOptional({
    type: 'integer',
    description: '上架状态：0->下架；1->上架',
    enum: [0, 1],
  })
  @IsOptional()
  @IsIn([0, 1])
  publishStatus?: number;

  @ApiPropertyOptional({ type: 'integer', description: '新品状态' })
  @IsOptional()
  @IsNumber()
  newStatus?: number;

  @ApiPropertyOptional({ type: 'integer', description: '推荐状态' })
  @IsOptional()
  @IsNumber()
  recommendStatus?: number;

  @ApiPropertyOptional({ type: 'integer', description: '审核状态' })
  @IsOptional()
  @IsNumber()
  verifyStatus?: number;

  @ApiPropertyOptional({ type: 'integer', description: '排序' })
  @IsOptional()
  @IsNumber()
  sort?: number;

  @ApiProperty({ description: '价格' })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ description: '促销价格' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  promotionPrice?: number;

  @ApiPropertyOptional({ type: 'integer', description: '赠送积分' })
  @IsOptional()
  @IsNumber()
  giftPoint?: number;

  @ApiPropertyOptional({ type: 'integer', description: '赠送成长值' })
  @IsOptional()
  @IsNumber()
  giftGrowth?: number;

  @ApiPropertyOptional({ type: 'integer', description: '限制使用积分' })
  @IsOptional()
  @IsNumber()
  usePointLimit?: number;

  @ApiPropertyOptional({ description: '副标题' })
  @IsOptional()
  @IsString()
  subTitle?: string;

  @ApiPropertyOptional({ description: '商品描述' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: '市场价' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  originalPrice?: number;

  @ApiPropertyOptional({ type: 'integer', description: '库存' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;

  @ApiPropertyOptional({ type: 'integer', description: '预警库存' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  lowStock?: number;

  @ApiPropertyOptional({ description: '单位' })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiPropertyOptional({ description: '重量，默认为克' })
  @IsOptional()
  @IsNumber()
  weight?: number;

  @ApiPropertyOptional({ type: 'integer', description: '是否为预告商品' })
  @IsOptional()
  @IsNumber()
  previewStatus?: number;

  @ApiPropertyOptional({ description: '以逗号分隔的产品服务' })
  @IsOptional()
  @IsString()
  serviceIds?: string;

  @ApiPropertyOptional({ description: '关键词' })
  @IsOptional()
  @IsString()
  keywords?: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({
    description: '画册图片，连产品图片限制为5张，以逗号分隔',
  })
  @IsOptional()
  @IsString()
  albumPics?: string;

  @ApiPropertyOptional({ description: '详情标题' })
  @IsOptional()
  @IsString()
  detailTitle?: string;

  @ApiPropertyOptional({ description: '详情描述' })
  @IsOptional()
  @IsString()
  detailDesc?: string;

  @ApiPropertyOptional({ description: '产品详情网页内容' })
  @IsOptional()
  @IsString()
  detailHtml?: string;

  @ApiPropertyOptional({ description: '移动端网页详情' })
  @IsOptional()
  @IsString()
  detailMobileHtml?: string;

  @ApiPropertyOptional({ description: '促销开始时间' })
  @IsOptional()
  promotionStartTime?: Date;

  @ApiPropertyOptional({ description: '促销结束时间' })
  @IsOptional()
  promotionEndTime?: Date;

  @ApiPropertyOptional({ type: 'integer', description: '活动限购数量' })
  @IsOptional()
  @IsNumber()
  promotionPerLimit?: number;

  @ApiPropertyOptional({
    type: 'integer',
    description: '促销类型：0无优惠 1特惠 2会员价 3阶梯价 4满减',
    enum: [0, 1, 2, 3, 4],
  })
  @IsOptional()
  @IsIn([0, 1, 2, 3, 4])
  promotionType?: number;

  // ===== 关联子表 =====

  @ApiPropertyOptional({ description: 'SKU 库存列表', type: [SkuStockItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SkuStockItemDto)
  skuStockList?: SkuStockItemDto[];

  @ApiPropertyOptional({
    description: '商品属性值列表',
    type: [ProductAttrValueItemDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductAttrValueItemDto)
  productAttributeValueList?: ProductAttrValueItemDto[];

  @ApiPropertyOptional({
    description: '阶梯价格列表',
    type: [ProductLadderItemDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductLadderItemDto)
  productLadderList?: ProductLadderItemDto[];

  @ApiPropertyOptional({
    description: '满减价格列表',
    type: [ProductFullReductionItemDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductFullReductionItemDto)
  productFullReductionList?: ProductFullReductionItemDto[];

  @ApiPropertyOptional({
    description: '会员价格列表',
    type: [MemberPriceItemDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MemberPriceItemDto)
  memberPriceList?: MemberPriceItemDto[];

  @ApiPropertyOptional({
    description: '专题关联列表',
    type: [SubjectProductRelationItemDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubjectProductRelationItemDto)
  subjectProductRelationList?: SubjectProductRelationItemDto[];

  @ApiPropertyOptional({
    description: '优选专区关联列表',
    type: [PreferenceAreaProductRelationItemDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PreferenceAreaProductRelationItemDto)
  preferenceAreaProductRelationList?: PreferenceAreaProductRelationItemDto[];
}

/**
 * 更新商品 DTO，所有字段可选
 */
export class UpdateProductDto extends PartialType(CreateProductDto) {}
