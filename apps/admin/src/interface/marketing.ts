/**
 * Mall 营销相关类型定义
 */

// 优惠券
export interface Coupon {
  id: number;
  type: number; // 优惠卷类型：0->全场赠券；1->会员赠券；2->购物赠券；3->注册赠券
  name: string;
  platform: number; // 使用平台：0->全部；1->移动；2->PC
  count: number | null; // 数量
  amount: number; // 金额
  perLimit: number | null; // 每人限领张数
  minPoint: number | null; // 使用门槛；0表示无门槛
  startTime: string | null;
  endTime: string | null;
  useType: number; // 使用类型：0->全场通用；1->指定分类；2->指定商品
  note: string | null;
  publishCount: number; // 发行数量
  useCount: number; // 已使用数量
  receiveCount: number; // 领取数量
  enableTime: string | null;
  code: string | null;
  memberLevel: number | null;
}

// 优惠券历史
export interface CouponHistory {
  id: number;
  couponId: number;
  memberId: number;
  couponCode: string;
  memberNickname: string;
  getType: number; // 获取类型：0->后台赠送；1->主动获取
  createTime: string;
  useStatus: number; // 使用状态：0->未使用；1->已使用；2->已过期
  useTime: string | null;
  orderId: number | null;
  orderSn: string | null;
}

// 秒杀活动
export interface FlashPromotion {
  id: number;
  title: string;
  startDate: string;
  endDate: string;
  status: number;
  createTime: string;
}

// 秒杀时间段
export interface FlashPromotionSession {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
  status: number;
  createTime: string;
}

// 秒杀商品关联
export interface FlashPromotionProductRelation {
  id: number;
  flashPromotionId: number;
  flashPromotionSessionId: number;
  productId: number;
  flashPromotionPrice: number;
  flashPromotionCount: number;
  flashPromotionLimit: number;
  sort: number;
}

// 首页广告
export interface HomeAdvertise {
  id: number;
  name: string;
  type: number; // 轮播位置：0->PC首页轮播；1->app首页轮播
  pic: string;
  startTime: string;
  endTime: string;
  status: number; // 上下线状态：0->下线；1->上线
  clickCount: number;
  orderCount: number;
  url: string | null;
  note: string | null;
  sort: number;
}

// 首页品牌推荐
export interface HomeBrand {
  id: number;
  brandId: number;
  brandName: string;
  recommendStatus: number;
  sort: number;
}

// 首页新品推荐
export interface HomeNewProduct {
  id: number;
  productId: number;
  productName: string;
  recommendStatus: number;
  sort: number;
}

// 首页人气推荐
export interface HomeHotProduct {
  id: number;
  productId: number;
  productName: string;
  recommendStatus: number;
  sort: number;
}

// 首页专题推荐
export interface HomeSubject {
  id: number;
  categoryId: number;
  title: string;
  pic: string | null;
  productCount: number;
  recommendStatus: number;
  createTime: string;
  collectCount: number;
  readCount: number;
  commentCount: number;
  albumPics: string | null;
  description: string | null;
  showStatus: number;
  content: string | null;
  forwardCount: number | null;
  categoryName: string | null;
  sort: number;
}

// 秒杀时间段别名（用于API兼容）
export type FlashSession = FlashPromotionSession;

// 秒杀商品关联别名（用于API兼容）
export type FlashProductRelation = FlashPromotionProductRelation;
