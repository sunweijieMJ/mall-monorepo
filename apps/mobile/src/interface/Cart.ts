import { BaseEntity } from './Common';

/**
 * 购物车商品项接口
 */
export interface CartItem extends BaseEntity {
  /** 商品ID */
  productId: number;
  /** 商品SKU ID */
  productSkuId?: number;
  /** 会员ID */
  memberId: number;
  /** 购买数量 */
  quantity: number;
  /** 商品价格 */
  price: number;
  /** 商品图片 */
  productPic: string;
  /** 商品名称 */
  productName: string;
  /** 商品副标题 */
  productSubTitle?: string;
  /** 商品SKU编码 */
  productSkuCode?: string;
  /** 会员昵称 */
  memberNickname?: string;
  /** 创建日期 */
  createDate?: string;
  /** 修改日期 */
  modifyDate?: string;
  /** 删除状态 0-未删除 1-已删除 */
  deleteStatus?: number;
  /** 商品分类ID */
  productCategoryId?: number;
  /** 商品品牌 */
  productBrand?: string;
  /** 商品货号 */
  productSn?: string;
  /** 商品规格属性 */
  productAttr: string;
}

/**
 * 添加购物车商品参数接口
 */
export interface AddCartItemParams {
  /** 商品ID */
  productId: number;
  /** 商品SKU ID */
  productSkuId?: number;
  /** 购买数量 */
  quantity: number;
}

/**
 * 更新购物车商品数量参数接口
 */
export interface UpdateQuantityParams {
  /** 购物车项ID */
  id: number;
  /** 新的购买数量 */
  quantity: number;
}

/**
 * 删除购物车商品参数接口
 */
export interface DeleteCartItemParams {
  /** 要删除的购物车项ID数组 */
  ids: number[];
}
