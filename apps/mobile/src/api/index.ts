/**
 * ==================== API 模块统一导出 ====================
 *
 * 本文件仅导出公共 API，内部实现细节不对外暴露
 *
 * 导出内容：
 * - API 调用函数：postAuthLogin, getAuthUserInfo 等
 * - 自定义工具函数：uploadWithProgress, downloadFile 等
 * - 公共类型定义：LoginRequest, LoginResponse, UserInfo
 *
 * 使用指南：
 * - API 函数：import { postAuthLogin } from '@/api'
 * - 类型定义：import type { LoginRequest } from '@/api'
 */

/**
 * ==================== 导出策略 ====================
 *
 * 1. 优先导出 model 中的类型定义 (接口、枚举等)
 * 2. 导出各模块的 API 函数 (只导出函数,不导出 *Result 类型别名)
 * 3. 导出自定义扩展和工具函数
 *
 * 为什么这样做：
 * - model 中的接口 (如 UploadCertificateResult) 是后端返回的数据结构
 * - API 模块中的类型别名 (如 UploadCertificateResult) 是整个响应的类型
 * - 两者同名但不同,会导致 TypeScript 报错,因此只导出函数
 */

// 1. 从 model 目录导出所有类型定义 (优先导出)
export * from './generated/model';

// 2. 自动生成的 API 函数 (只导出函数,不导出类型)
export {
  attentionControllerCreateV1,
  attentionControllerListV1,
  attentionControllerClearV1,
  attentionControllerDeleteV1,
} from './generated/portal-attention/portal-attention';

export {
  portalAuthControllerLoginV1,
  portalAuthControllerRegisterV1,
  portalAuthControllerGetAuthCodeV1,
  portalAuthControllerSmsLoginV1,
  portalAuthControllerRefreshV1,
  portalAuthControllerUpdatePasswordV1,
  portalAuthControllerLogoutV1,
} from './generated/portal-auth/portal-auth';

export {
  portalBrandControllerRecommendListV1,
  portalBrandControllerProductListV1,
  portalBrandControllerGetItemV1,
} from './generated/portal-brand/portal-brand';

export {
  cartControllerCreateV1,
  cartControllerListV1,
  cartControllerDeleteV1,
  cartControllerCountV1,
  cartControllerPromotionListV1,
  cartControllerCartProductV1,
  cartControllerClearV1,
  cartControllerUpdateQuantityV1,
  cartControllerUpdateAttrV1,
} from './generated/portal-cart/portal-cart';

export {
  collectionControllerCreateV1,
  collectionControllerListV1,
  collectionControllerClearV1,
  collectionControllerDeleteV1,
  collectionControllerGetItemV1,
} from './generated/portal-collection/portal-collection';

export {
  memberCouponControllerCreateV1,
  memberCouponControllerListCouponObjectsV1,
  memberCouponControllerListMemberCouponsV1,
  memberCouponControllerListCouponsByProductV1,
  memberCouponControllerListCartCouponsV1,
  portalCouponControllerListAvailableCouponsV1,
} from './generated/portal-coupon/portal-coupon';

export { homeControllerGetHomeContentV1 } from './generated/portal-home/portal-home';

export {
  memberAddressControllerListV1,
  memberAddressControllerCreateV1,
  memberAddressControllerGetItemV1,
  memberAddressControllerUpdateV1,
  memberAddressControllerDeleteV1,
} from './generated/portal-member-address/portal-member-address';

export {
  memberInfoControllerGetInfoV1,
  memberInfoControllerUpdateInfoV1,
} from './generated/portal-member-profile/portal-member-profile';

export {
  portalOrderControllerConfirmV1,
  portalOrderControllerGenerateV1,
  portalOrderControllerListV1,
  portalOrderControllerGetItemV1,
  portalOrderControllerDeleteV1,
  portalOrderControllerPaySuccessV1,
  portalOrderControllerCancelV1,
  portalOrderControllerConfirmReceiveV1,
} from './generated/portal-order/portal-order';

export {
  paymentControllerCreateAlipayPaymentV1,
  paymentControllerAlipayNotifyV1,
} from './generated/portal-payment/portal-payment';

export {
  portalProductControllerSearchV1,
  portalProductControllerCategoryTreeListV1,
  portalProductControllerGetItemV1,
} from './generated/portal-product/portal-product';

export {
  readHistoryControllerCreateV1,
  readHistoryControllerListV1,
  readHistoryControllerBatchDeleteV1,
  readHistoryControllerClearV1,
} from './generated/portal-read-history/portal-read-history';

export {
  portalReturnApplyControllerCreateV1,
  portalReturnApplyControllerListV1,
  portalReturnApplyControllerGetItemV1,
} from './generated/portal-return-apply/portal-return-apply';

// 3. 自定义工具函数 (自动扫描 custom 目录)
export * from './custom/external';
export * from './custom/override';
