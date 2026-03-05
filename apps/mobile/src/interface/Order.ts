import { Address } from './Address';
import { CartItem } from './Cart';
import { BaseEntity, PaginationParams } from './Common';

/**
 * 订单信息接口
 */
export interface Order extends BaseEntity {
  /** 会员ID */
  memberId: number;
  /** 订单编号 */
  orderSn: string;
  /** 创建时间 */
  createTime: string;
  /** 会员用户名 */
  memberUsername: string;
  /** 订单总金额 */
  totalAmount: number;
  /** 实付金额 */
  payAmount: number;
  /** 运费金额 */
  freightAmount: number;
  /** 促销优惠金额 */
  promotionAmount?: number;
  /** 积分抵扣金额 */
  integrationAmount?: number;
  /** 优惠券抵扣金额 */
  couponAmount?: number;
  /** 管理员折扣金额 */
  discountAmount?: number;
  /** 支付方式 0-未支付 1-支付宝 2-微信 */
  payType: number;
  /** 订单来源 0-PC订单 1-app订单 */
  sourceType?: number;
  /** 订单状态 */
  status: number;
  /** 订单类型 0-正常订单 1-秒杀订单 */
  orderType?: number;
  /** 物流公司 */
  deliveryCompany?: string;
  /** 物流单号 */
  deliverySn?: string;
  /** 自动确认时间（天） */
  autoConfirmDay?: number;
  /** 可获得积分 */
  integration?: number;
  /** 可获得成长值 */
  growth?: number;
  /** 活动信息 */
  promotionInfo?: string;
  /** 发票类型 0-不开发票 1-电子发票 2-纸质发票 */
  billType?: number;
  /** 发票抬头 */
  billHeader?: string;
  /** 发票内容 */
  billContent?: string;
  /** 收票人电话 */
  billReceiverPhone?: string;
  /** 收票人邮箱 */
  billReceiverEmail?: string;
  /** 收货人姓名 */
  receiverName: string;
  /** 收货人电话 */
  receiverPhone: string;
  /** 收货人邮编 */
  receiverPostCode?: string;
  /** 省份/直辖市 */
  receiverProvince: string;
  /** 市 */
  receiverCity: string;
  /** 区 */
  receiverRegion: string;
  /** 详细地址 */
  receiverDetailAddress: string;
  /** 订单备注 */
  note?: string;
  /** 确认收货状态 0-未确认 1-已确认 */
  confirmStatus?: number;
  /** 删除状态 0-未删除 1-已删除 */
  deleteStatus?: number;
  /** 使用的积分 */
  useIntegration?: number;
  /** 支付时间 */
  paymentTime?: string;
  /** 发货时间 */
  deliveryTime?: string;
  /** 收货时间 */
  receiveTime?: string;
  /** 评价时间 */
  commentTime?: string;
  /** 修改时间 */
  modifyTime?: string;
  /** 订单商品列表 */
  orderItemList: OrderItem[];
}

/**
 * 订单商品项接口
 */
export interface OrderItem extends BaseEntity {
  /** 订单ID */
  orderId?: number;
  /** 订单编号 */
  orderSn?: string;
  /** 商品ID */
  productId: number;
  /** 商品图片 */
  productPic: string;
  /** 商品名称 */
  productName: string;
  /** 商品品牌 */
  productBrand?: string;
  /** 商品货号 */
  productSn?: string;
  /** 商品价格 */
  productPrice: number;
  /** 购买数量 */
  productQuantity: number;
  /** 商品sku ID */
  productSkuId?: number;
  /** 商品sku编码 */
  productSkuCode?: string;
  /** 商品分类ID */
  productCategoryId?: number;
  /** 促销活动名称 */
  promotionName?: string;
  /** 促销活动优惠金额 */
  promotionAmount?: number;
  /** 优惠券优惠金额 */
  couponAmount?: number;
  /** 积分优惠金额 */
  integrationAmount?: number;
  /** 该商品经优惠后的分解金额 */
  realAmount: number;
  /** 赠送积分 */
  giftIntegration?: number;
  /** 赠送成长值 */
  giftGrowth?: number;
  /** 商品属性 */
  productAttr: string;
}

/**
 * 确认订单数据接口
 */
export interface ConfirmOrderData {
  /** 购物车项ID数组 */
  cartIds: number[];
  /** 会员收货地址ID */
  memberReceiveAddressId?: number;
}

/**
 * 确认订单响应接口
 */
export interface ConfirmOrderResponse {
  /** 购物车促销商品列表 */
  cartPromotionItemList: Array<CartItem & { promotionMessage: string }>;
  /** 会员收货地址列表 */
  memberReceiveAddressList: Address[];
  /** 优惠券历史详情列表 */
  couponHistoryDetailList?: any[];
  /** 积分消费设定 */
  integrationConsumeSetting?: number;
  /** 会员积分 */
  memberIntegration?: number;
  /** 计算金额 */
  calcAmount: {
    /** 总金额 */
    totalAmount: number;
    /** 运费金额 */
    freightAmount: number;
    /** 实付金额 */
    payAmount: number;
    /** 促销金额 */
    promotionAmount: number;
    /** 积分金额 */
    integrationAmount: number;
    /** 优惠券金额 */
    couponAmount: number;
  };
}

/**
 * 生成订单数据接口
 */
export interface GenerateOrderData {
  /** 购物车项ID数组 */
  cartIds: number[];
  /** 会员收货地址ID */
  memberReceiveAddressId: number;
  /** 优惠券ID */
  couponId?: number | null;
  /** 使用积分 */
  useIntegration?: number;
  /** 支付方式 */
  payType: number;
}

/**
 * 订单列表查询参数接口
 */
export interface OrderListParams extends PaginationParams {
  /** 订单状态 */
  status?: number;
}

/**
 * 支付订单数据接口
 */
export interface PayOrderData {
  /** 订单ID */
  orderId: number;
  /** 支付方式 */
  payType: number;
}

/**
 * 取消订单数据接口
 */
export interface CancelOrderData {
  /** 订单ID */
  orderId: number;
}

/**
 * 确认收货订单数据接口
 */
export interface ConfirmReceiveOrderData {
  /** 订单ID */
  orderId: number;
}

/**
 * 删除订单数据接口
 */
export interface DeleteOrderData {
  /** 订单ID */
  orderId: number;
}

/**
 * 支付宝状态查询参数接口
 */
export interface AlipayStatusParams {
  /** 外部交易号 */
  outTradeNo: string;
}
