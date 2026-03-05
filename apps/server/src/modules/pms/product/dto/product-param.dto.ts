import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

/**
 * 创建商品 DTO
 * 包含商品主体字段 + 各关联子表数组
 */
export class CreateProductDto {
  @ApiProperty({ description: '品牌 ID' })
  @IsNumber()
  brandId: number;

  @ApiPropertyOptional({ description: '品牌名称' })
  @IsOptional()
  @IsString()
  brandName?: string;

  @ApiProperty({ description: '商品分类 ID' })
  @IsNumber()
  productCategoryId: number;

  @ApiPropertyOptional({ description: '商品分类名称' })
  @IsOptional()
  @IsString()
  productCategoryName?: string;

  @ApiPropertyOptional({ description: '商品属性分类 ID' })
  @IsOptional()
  @IsNumber()
  productAttributeCategoryId?: number;

  @ApiPropertyOptional({ description: '运费模板 ID' })
  @IsOptional()
  @IsNumber()
  freightTemplateId?: number;

  @ApiProperty({ description: '商品名称' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: '商品图片' })
  @IsOptional()
  @IsString()
  pic?: string;

  @ApiPropertyOptional({ description: '货号' })
  @IsOptional()
  @IsString()
  productSn?: string;

  @ApiPropertyOptional({ description: '删除状态：0->未删除；1->已删除' })
  @IsOptional()
  @IsNumber()
  deleteStatus?: number;

  @ApiPropertyOptional({ description: '上架状态：0->下架；1->上架' })
  @IsOptional()
  @IsNumber()
  publishStatus?: number;

  @ApiPropertyOptional({ description: '新品状态' })
  @IsOptional()
  @IsNumber()
  newStatus?: number;

  @ApiPropertyOptional({ description: '推荐状态' })
  @IsOptional()
  @IsNumber()
  recommandStatus?: number;

  @ApiPropertyOptional({ description: '审核状态' })
  @IsOptional()
  @IsNumber()
  verifyStatus?: number;

  @ApiPropertyOptional({ description: '排序' })
  @IsOptional()
  @IsNumber()
  sort?: number;

  @ApiPropertyOptional({ description: '销量' })
  @IsOptional()
  @IsNumber()
  sale?: number;

  @ApiProperty({ description: '价格' })
  @IsNumber()
  price: number;

  @ApiPropertyOptional({ description: '促销价格' })
  @IsOptional()
  @IsNumber()
  promotionPrice?: number;

  @ApiPropertyOptional({ description: '赠送积分' })
  @IsOptional()
  @IsNumber()
  giftPoint?: number;

  @ApiPropertyOptional({ description: '赠送成长值' })
  @IsOptional()
  @IsNumber()
  giftGrowth?: number;

  @ApiPropertyOptional({ description: '限制使用积分' })
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
  originalPrice?: number;

  @ApiPropertyOptional({ description: '库存' })
  @IsOptional()
  @IsNumber()
  stock?: number;

  @ApiPropertyOptional({ description: '预警库存' })
  @IsOptional()
  @IsNumber()
  lowStock?: number;

  @ApiPropertyOptional({ description: '单位' })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiPropertyOptional({ description: '重量，默认为克' })
  @IsOptional()
  @IsNumber()
  weight?: number;

  @ApiPropertyOptional({ description: '是否为预告商品' })
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

  @ApiPropertyOptional({ description: '活动限购数量' })
  @IsOptional()
  @IsNumber()
  promotionPerLimit?: number;

  @ApiPropertyOptional({
    description: '促销类型：0无优惠 1特惠 2会员价 3阶梯价 4满减',
  })
  @IsOptional()
  @IsNumber()
  promotionType?: number;

  // ===== 关联子表 =====

  @ApiPropertyOptional({ description: 'SKU 库存列表', type: [Object] })
  @IsOptional()
  @IsArray()
  @Type(() => Object)
  skuStockList?: any[];

  @ApiPropertyOptional({ description: '商品属性值列表', type: [Object] })
  @IsOptional()
  @IsArray()
  @Type(() => Object)
  productAttributeValueList?: any[];

  @ApiPropertyOptional({ description: '阶梯价格列表', type: [Object] })
  @IsOptional()
  @IsArray()
  @Type(() => Object)
  productLadderList?: any[];

  @ApiPropertyOptional({ description: '满减价格列表', type: [Object] })
  @IsOptional()
  @IsArray()
  @Type(() => Object)
  productFullReductionList?: any[];

  @ApiPropertyOptional({ description: '会员价格列表', type: [Object] })
  @IsOptional()
  @IsArray()
  @Type(() => Object)
  memberPriceList?: any[];

  @ApiPropertyOptional({ description: '专题关联列表', type: [Object] })
  @IsOptional()
  @IsArray()
  @Type(() => Object)
  subjectProductRelationList?: any[];

  @ApiPropertyOptional({ description: '优选区域关联列表', type: [Object] })
  @IsOptional()
  @IsArray()
  @Type(() => Object)
  prefrenceAreaProductRelationList?: any[];
}

/**
 * 更新商品 DTO，所有字段可选
 */
export class UpdateProductDto extends CreateProductDto {}
