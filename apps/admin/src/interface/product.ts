/**
 * Mall 商品相关类型定义
 */

import type { PageParams } from './common';

// 商品信息
export interface Product {
  id: number;
  brandId: number;
  brandName: string;
  productCategoryId: number;
  productCategoryName: string;
  freightTemplateId: number;
  productAttributeCategoryId: number;
  name: string;
  pic: string;
  productSn: string; // 货号
  deleteStatus: number;
  publishStatus: number; // 上架状态：0->下架；1->上架
  newStatus: number; // 新品状态：0->不是新品；1->新品
  recommandStatus: number; // 推荐状态：0->不推荐；1->推荐
  verifyStatus: number; // 审核状态：0->未审核；1->审核通过
  sort: number; // 排序
  sale: number; // 销量
  price: number;
  promotionPrice: number | null;
  giftGrowth: number;
  giftPoint: number;
  usePointLimit: number | null;
  subTitle: string | null;
  description: string | null;
  originalPrice: number | null;
  stock: number;
  lowStock: number;
  unit: string | null;
  weight: number | null;
  previewStatus: number;
  serviceIds: string | null;
  keywords: string | null;
  note: string | null;
  albumPics: string | null;
  detailTitle: string | null;
  detailDesc: string | null;
  detailHtml: string | null;
  detailMobileHtml: string | null;
  promotionStartTime: string | null;
  promotionEndTime: string | null;
  promotionPerLimit: number | null;
  promotionType: number;
}

// 商品列表查询参数
export interface ProductListQuery extends PageParams {
  publishStatus?: number;
  verifyStatus?: number;
  keyword?: string;
  productSn?: string;
  productCategoryId?: number;
  brandId?: number;
}

// 商品分类
export interface ProductCategory {
  id: number;
  parentId: number;
  name: string;
  level: number;
  productCount: number;
  productUnit: string;
  navStatus: number;
  showStatus: number;
  sort: number;
  icon: string | null;
  keywords: string | null;
  description: string | null;
  children?: ProductCategory[];
}

// 商品属性分类
export interface ProductAttributeCategory {
  id: number;
  name: string;
  attributeCount: number;
  paramCount: number;
}

// 商品属性
export interface ProductAttribute {
  id: number;
  productAttributeCategoryId: number;
  name: string;
  selectType: number;
  inputType: number;
  inputList: string | null;
  sort: number;
  filterType: number;
  searchType: number;
  relatedStatus: number;
  handAddStatus: number;
  type: number;
}

// 品牌
export interface Brand {
  id: number;
  name: string;
  firstLetter: string;
  sort: number;
  factoryStatus: number;
  showStatus: number;
  productCount: number;
  productCommentCount: number;
  logo: string;
  bigPic: string;
  brandStory: string | null;
}

// SKU库存
export interface SkuStock {
  id?: number;
  productId?: number;
  skuCode?: string;
  price?: number;
  stock?: number;
  lowStock?: number;
  pic?: string | null;
  sale?: number;
  promotionPrice?: number | null;
  lockStock?: number;
  spData?: string | null;
}

// 会员价格
export interface MemberPrice {
  memberLevelId?: number;
  memberLevelName?: string;
  memberPrice?: number;
}

// 阶梯价格
export interface ProductLadder {
  count?: number;
  discount?: number;
  price?: number;
}

// 满减价格
export interface ProductFullReduction {
  fullPrice?: number;
  reducePrice?: number;
}

// 商品属性值
export interface ProductAttributeValue {
  productAttributeId?: number;
  value?: string;
}

// 专题商品关联
export interface SubjectProductRelation {
  subjectId: number;
}

// 优选区域商品关联
export interface PrefrenceAreaProductRelation {
  prefrenceAreaId: number;
}

// 专题
export interface Subject {
  id: number;
  title: string;
  categoryId?: number;
  pic?: string | null;
  productCount?: number;
  recommandStatus?: number;
  createTime?: string;
  collectCount?: number;
  readCount?: number;
  commentCount?: number;
  albumPics?: string | null;
  description?: string | null;
  showStatus?: number;
  content?: string | null;
  forwardCount?: number | null;
  categoryName?: string | null;
  sort?: number;
}

// 优选区域（兼容PreferenceArea拼写）
export interface PrefrenceArea {
  id: number;
  name: string;
  subTitle?: string | null;
  pic?: string | null;
  sort?: number;
  showStatus?: number;
}

// 商品参数（用于添加/编辑商品表单）
export interface ProductParam {
  id?: number;
  // 基础信息
  productCategoryId?: number | null;
  productCategoryName?: string | null;
  cateParentId?: number | null;
  brandId?: number | null;
  brandName?: string | null;
  name?: string;
  subTitle?: string | null;
  description?: string | null;
  productSn?: string;
  price?: number;
  originalPrice?: number | null;
  stock?: number;
  unit?: string | null;
  weight?: number | null;
  sort?: number;
  // 销售属性
  giftGrowth?: number;
  giftPoint?: number;
  usePointLimit?: number | null;
  previewStatus?: number;
  publishStatus?: number;
  newStatus?: number;
  recommandStatus?: number;
  verifyStatus?: number;
  serviceIds?: string | null;
  detailTitle?: string | null;
  detailDesc?: string | null;
  keywords?: string | null;
  note?: string | null;
  // 促销信息
  promotionType?: number; // 0=无优惠 1=特惠促销 2=会员价格 3=阶梯价格 4=满减价格
  promotionStartTime?: string | null;
  promotionEndTime?: string | null;
  promotionPrice?: number | null;
  promotionPerLimit?: number | null;
  // 图片信息
  pic?: string | null;
  albumPics?: string | null;
  detailHtml?: string | null;
  detailMobileHtml?: string | null;
  // 其他属性
  freightTemplateId?: number;
  productAttributeCategoryId?: number | null;
  deleteStatus?: number;
  sale?: number;
  lowStock?: number;
  // 关联数组
  memberPriceList?: MemberPrice[];
  productLadderList?: ProductLadder[];
  productFullReductionList?: ProductFullReduction[];
  productAttributeValueList?: ProductAttributeValue[];
  skuStockList?: SkuStock[];
  subjectProductRelationList?: SubjectProductRelation[];
  prefrenceAreaProductRelationList?: PrefrenceAreaProductRelation[];
}
