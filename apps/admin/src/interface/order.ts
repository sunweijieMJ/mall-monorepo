/**
 * Mall 订单相关类型定义
 */

import type { PageParams } from './common';

// 订单信息
export interface Order {
  id: number;
  memberId: number;
  memberUsername: string;
  orderSn: string; // 订单编号
  createTime: string;
  totalAmount: number;
  payAmount: number;
  freightAmount: number;
  promotionAmount: number;
  integrationAmount: number;
  couponAmount: number;
  discountAmount: number;
  payType: number; // 支付方式：0->未支付；1->支付宝；2->微信
  sourceType: number; // 订单来源：0->PC订单；1->app订单
  status: number; // 订单状态：0->待付款；1->待发货；2->已发货；3->已完成；4->已关闭；5->无效订单
  orderType: number; // 订单类型：0->正常订单；1->秒杀订单
  deliveryCompany: string | null;
  deliverySn: string | null;
  autoConfirmDay: number | null;
  integration: number | null;
  growth: number | null;
  promotionInfo: string | null;
  billType: number | null;
  billHeader: string | null;
  billContent: string | null;
  billReceiverPhone: string | null;
  billReceiverEmail: string | null;
  receiverName: string;
  receiverPhone: string;
  receiverPostCode: string;
  receiverProvince: string;
  receiverCity: string;
  receiverRegion: string;
  receiverDetailAddress: string;
  note: string | null;
  confirmStatus: number;
  deleteStatus: number;
  useIntegration: number | null;
  paymentTime: string | null;
  deliveryTime: string | null;
  receiveTime: string | null;
  commentTime: string | null;
  modifyTime: string | null;
}

// 订单列表查询参数
export interface OrderListQuery extends PageParams {
  orderSn?: string;
  receiverKeyword?: string;
  status?: number;
  orderType?: number;
  sourceType?: number;
  createTime?: string;
}

// 订单详情
export interface OrderDetail extends Order {
  orderItemList: OrderItem[];
  historyList: OrderOperateHistory[];
}

// 订单商品
export interface OrderItem {
  id: number;
  orderId: number;
  orderSn: string;
  productId: number;
  productPic: string;
  productName: string;
  productBrand: string;
  productSn: string;
  productPrice: number;
  productQuantity: number;
  productSkuId: number;
  productSkuCode: string;
  productCategoryId: number;
  promotionName: string | null;
  promotionAmount: number | null;
  couponAmount: number | null;
  integrationAmount: number | null;
  realAmount: number;
  giftIntegration: number;
  giftGrowth: number;
  productAttr: string | null;
}

// 订单操作历史
export interface OrderOperateHistory {
  id: number;
  orderId: number;
  operateMan: string;
  createTime: string;
  orderStatus: number;
  note: string | null;
}

// 订单设置
export interface OrderSetting {
  id: number;
  flashOrderOvertime: number; // 秒杀订单超时关闭时间(分)
  normalOrderOvertime: number; // 正常订单超时时间(分)
  confirmOvertime: number; // 发货后自动确认收货时间（天）
  finishOvertime: number; // 自动完成交易时间，不能申请售后（天）
  commentOvertime: number; // 订单完成后自动好评时间（天）
}

// 退货申请
export interface OrderReturnApply {
  id: number;
  orderId: number;
  companyAddressId: number;
  productId: number;
  orderSn: string;
  createTime: string;
  memberUsername: string;
  returnAmount: number;
  returnName: string;
  returnPhone: string;
  status: number; // 申请状态：0->待处理；1->退货中；2->已完成；3->已拒绝
  handleTime: string | null;
  productPic: string;
  productName: string;
  productBrand: string;
  productAttr: string;
  productCount: number;
  productPrice: number;
  productRealPrice: number;
  reason: string;
  description: string | null;
  proofPics: string | null;
  handleNote: string | null;
  handleMan: string | null;
  receiveMan: string | null;
  receiveTime: string | null;
  receiveNote: string | null;
}

// 退货原因
export interface OrderReturnReason {
  id: number;
  name: string;
  sort: number;
  status: number;
  createTime: string;
}

// 公司收货地址
export interface CompanyAddress {
  id: number;
  addressName: string;
  sendStatus: number;
  receiveStatus: number;
  name: string;
  phone: string;
  province: string;
  city: string;
  region: string;
  detailAddress: string;
}
