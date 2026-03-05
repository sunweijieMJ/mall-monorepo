import { BaseEntity } from './Common';

/**
 * 会员品牌关注接口
 */
export interface BrandAttention extends BaseEntity {
  /** 会员ID */
  memberId: number;
  /** 会员昵称 */
  memberNickname: string;
  /** 会员头像 */
  memberIcon: string;
  /** 品牌ID */
  brandId: number;
  /** 品牌名称 */
  brandName: string;
  /** 品牌logo */
  brandLogo: string;
  /** 关注时间 */
  createTime: string;
}

/**
 * 创建品牌关注数据接口
 */
export interface CreateBrandAttentionData {
  /** 品牌ID */
  brandId: number;
}

/**
 * 品牌关注参数接口
 */
export interface BrandAttentionParams {
  /** 品牌ID */
  brandId: number;
}

/**
 * 会员商品收藏接口
 */
export interface ProductCollection extends BaseEntity {
  /** 会员ID */
  memberId: number;
  /** 会员昵称 */
  memberNickname: string;
  /** 会员头像 */
  memberIcon: string;
  /** 商品ID */
  productId: number;
  /** 商品名称 */
  productName: string;
  /** 商品图片 */
  productPic: string;
  /** 商品副标题 */
  productSubTitle: string;
  /** 商品价格 */
  productPrice: number;
  /** 收藏时间 */
  createTime: string;
}

/**
 * 创建商品收藏数据接口
 */
export interface CreateProductCollectionData {
  /** 商品ID */
  productId: number;
}

/**
 * 商品收藏参数接口
 */
export interface ProductCollectionParams {
  /** 商品ID */
  productId: number;
}

/**
 * 会员浏览历史接口
 */
export interface ReadHistory extends BaseEntity {
  /** 会员ID */
  memberId: number;
  /** 会员昵称 */
  memberNickname: string;
  /** 会员头像 */
  memberIcon: string;
  /** 商品ID */
  productId: number;
  /** 商品名称 */
  productName: string;
  /** 商品图片 */
  productPic: string;
  /** 商品副标题 */
  productSubTitle: string;
  /** 商品价格 */
  productPrice: number;
  /** 创建时间 */
  createTime: string;
  /** 浏览时间 */
  readTime: string;
}

/**
 * 创建浏览历史数据接口
 */
export interface CreateReadHistoryData {
  /** 商品ID */
  productId: number;
}
