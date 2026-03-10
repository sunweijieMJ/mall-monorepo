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
  adminAuthControllerRegisterV1,
  adminAuthControllerLoginV1,
  adminAuthControllerGetInfoV1,
  adminAuthControllerLogoutV1,
  adminAuthControllerRefreshV1,
} from './generated/admin-auth/admin-auth';

export {
  brandControllerCreateV1,
  brandControllerListV1,
  brandControllerBatchDeleteV1,
  brandControllerListAllV1,
  brandControllerUpdateShowStatusV1,
  brandControllerUpdateFactoryStatusV1,
  brandControllerUpdateV1,
  brandControllerGetItemV1,
} from './generated/admin-brand/admin-brand';

export {
  companyAddressControllerCreateV1,
  companyAddressControllerListV1,
  companyAddressControllerUpdateV1,
  companyAddressControllerDeleteV1,
  companyAddressControllerGetItemV1,
} from './generated/admin-company-address/admin-company-address';

export {
  couponControllerCreateV1,
  couponControllerListV1,
  couponControllerUpdateV1,
  couponControllerDeleteV1,
  couponControllerGetItemV1,
  couponHistoryControllerListV1,
} from './generated/admin-coupon/admin-coupon';

export {
  flashProductRelationControllerBatchCreateV1,
  flashProductRelationControllerListV1,
  flashProductRelationControllerUpdateV1,
  flashProductRelationControllerDeleteV1,
  flashProductRelationControllerGetItemV1,
} from './generated/admin-flash-product-relation/admin-flash-product-relation';

export {
  flashPromotionControllerCreateV1,
  flashPromotionControllerListV1,
  flashPromotionControllerUpdateStatusV1,
  flashPromotionControllerUpdateV1,
  flashPromotionControllerDeleteV1,
  flashPromotionControllerGetItemV1,
} from './generated/admin-flash-promotion/admin-flash-promotion';

export {
  flashSessionControllerCreateV1,
  flashSessionControllerListV1,
  flashSessionControllerListSelectableV1,
  flashSessionControllerUpdateStatusV1,
  flashSessionControllerUpdateV1,
  flashSessionControllerDeleteV1,
  flashSessionControllerGetItemV1,
} from './generated/admin-flash-session/admin-flash-session';

export {
  homeAdvertiseControllerCreateV1,
  homeAdvertiseControllerListV1,
  homeAdvertiseControllerBatchDeleteV1,
  homeAdvertiseControllerUpdateStatusV1,
  homeAdvertiseControllerUpdateV1,
  homeAdvertiseControllerGetItemV1,
} from './generated/admin-home-ad/admin-home-ad';

export {
  homeBrandControllerBatchCreateV1,
  homeBrandControllerListV1,
  homeBrandControllerBatchDeleteV1,
  homeBrandControllerUpdateStatusV1,
  homeBrandControllerUpdateSortV1,
} from './generated/admin-home-brand/admin-home-brand';

export {
  homeNewProductControllerBatchCreateV1,
  homeNewProductControllerListV1,
  homeNewProductControllerBatchDeleteV1,
  homeNewProductControllerUpdateStatusV1,
  homeNewProductControllerUpdateSortV1,
} from './generated/admin-home-new-product/admin-home-new-product';

export {
  homeRecommendProductControllerBatchCreateV1,
  homeRecommendProductControllerListV1,
  homeRecommendProductControllerBatchDeleteV1,
  homeRecommendProductControllerUpdateStatusV1,
  homeRecommendProductControllerUpdateSortV1,
} from './generated/admin-home-recommend-product/admin-home-recommend-product';

export {
  homeSubjectControllerBatchCreateV1,
  homeSubjectControllerListV1,
  homeSubjectControllerBatchDeleteV1,
  homeSubjectControllerUpdateStatusV1,
  homeSubjectControllerUpdateSortV1,
} from './generated/admin-home-subject/admin-home-subject';

export {
  memberLevelControllerCreateV1,
  memberLevelControllerListV1,
  memberLevelControllerBatchDeleteV1,
  memberLevelControllerUpdateV1,
  memberLevelControllerGetItemV1,
} from './generated/admin-member-level/admin-member-level';

export {
  adminMenuControllerCreateV1,
  adminMenuControllerListV1,
  adminMenuControllerTreeListV1,
  adminMenuControllerUpdateV1,
  adminMenuControllerDeleteV1,
  adminMenuControllerGetItemV1,
  adminMenuControllerUpdateHiddenStatusV1,
} from './generated/admin-menu/admin-menu';

export {
  adminOrderControllerListV1,
  adminOrderControllerBatchDeleteV1,
  adminOrderControllerGetItemV1,
  adminOrderControllerDeliveryV1,
  adminOrderControllerCloseV1,
  adminOrderControllerUpdateReceiverInfoV1,
  adminOrderControllerUpdateMoneyInfoV1,
  adminOrderControllerUpdateNoteV1,
} from './generated/admin-order/admin-order';

export {
  orderSettingControllerUpdateV1,
  orderSettingControllerGetItemV1,
} from './generated/admin-order-setting/admin-order-setting';

export { ossControllerGetPolicyV1 } from './generated/admin-oss/admin-oss';

export {
  preferenceAreaControllerCreateV1,
  preferenceAreaControllerListV1,
  preferenceAreaControllerBatchDeleteV1,
  preferenceAreaControllerGetProductListV1,
  preferenceAreaControllerUpdateV1,
  preferenceAreaControllerGetItemV1,
} from './generated/admin-preference-area/admin-preference-area';

export {
  productControllerCreateV1,
  productControllerListV1,
  productControllerBatchDeleteV1,
  productControllerListSimpleV1,
  productControllerUpdateVerifyStatusV1,
  productControllerUpdatePublishStatusV1,
  productControllerUpdateNewStatusV1,
  productControllerUpdateRecommendStatusV1,
  productControllerUpdateV1,
  productControllerGetDetailV1,
} from './generated/admin-product/admin-product';

export {
  productAttrControllerCreateV1,
  productAttrControllerListV1,
  productAttrControllerBatchDeleteV1,
  productAttrControllerUpdateV1,
  productAttrControllerGetItemV1,
} from './generated/admin-product-attr/admin-product-attr';

export {
  productAttrCategoryControllerCreateV1,
  productAttrCategoryControllerListV1,
  productAttrCategoryControllerListWithAttrV1,
  productAttrCategoryControllerUpdateV1,
  productAttrCategoryControllerDeleteV1,
  productAttrCategoryControllerGetItemV1,
} from './generated/admin-product-attr-category/admin-product-attr-category';

export {
  productCategoryControllerCreateV1,
  productCategoryControllerListV1,
  productCategoryControllerListWithChildrenV1,
  productCategoryControllerUpdateNavStatusV1,
  productCategoryControllerUpdateShowStatusV1,
  productCategoryControllerUpdateV1,
  productCategoryControllerDeleteV1,
  productCategoryControllerGetItemV1,
} from './generated/admin-product-category/admin-product-category';

export {
  adminResourceControllerCreateV1,
  adminResourceControllerListV1,
  adminResourceControllerListAllV1,
  adminResourceControllerUpdateV1,
  adminResourceControllerDeleteV1,
  adminResourceControllerGetItemV1,
} from './generated/admin-resource/admin-resource';

export {
  adminResourceCategoryControllerCreateV1,
  adminResourceCategoryControllerListAllV1,
  adminResourceCategoryControllerUpdateV1,
  adminResourceCategoryControllerDeleteV1,
} from './generated/admin-resource-category/admin-resource-category';

export {
  returnApplyControllerListV1,
  returnApplyControllerBatchDeleteV1,
  returnApplyControllerUpdateStatusV1,
  returnApplyControllerUpdateV1,
  returnApplyControllerGetItemV1,
  returnApplyControllerConfirmReceiveV1,
} from './generated/admin-return-apply/admin-return-apply';

export {
  returnReasonControllerCreateV1,
  returnReasonControllerListV1,
  returnReasonControllerBatchDeleteV1,
  returnReasonControllerUpdateStatusV1,
  returnReasonControllerUpdateV1,
  returnReasonControllerGetItemV1,
} from './generated/admin-return-reason/admin-return-reason';

export {
  adminRoleControllerCreateV1,
  adminRoleControllerListV1,
  adminRoleControllerBatchDeleteV1,
  adminRoleControllerListAllV1,
  adminRoleControllerUpdateV1,
  adminRoleControllerGetItemV1,
  adminRoleControllerUpdateStatusV1,
  adminRoleControllerListMenuV1,
  adminRoleControllerAllocMenuV1,
  adminRoleControllerListResourceV1,
  adminRoleControllerAllocResourceV1,
} from './generated/admin-role/admin-role';

export {
  skuStockControllerListV1,
  skuStockControllerUpdateV1,
} from './generated/admin-sku-stock/admin-sku-stock';

export {
  subjectControllerCreateV1,
  subjectControllerListV1,
  subjectControllerBatchDeleteV1,
  subjectControllerGetProductListV1,
  subjectControllerUpdateV1,
  subjectControllerGetItemV1,
} from './generated/admin-subject/admin-subject';

export {
  adminUserControllerListV1,
  adminUserControllerUpdatePasswordV1,
  adminUserControllerUpdateV1,
  adminUserControllerDeleteV1,
  adminUserControllerGetItemV1,
  adminUserControllerUpdateStatusV1,
  adminUserControllerUpdateRoleV1,
  adminUserControllerGetRoleListV1,
  adminUserControllerResetPasswordV1,
} from './generated/admin-user/admin-user';

// 3. 自定义工具函数 (自动扫描 custom 目录)
export * from './custom/external';
export * from './custom/override';
