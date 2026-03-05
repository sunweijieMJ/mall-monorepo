/**
 * Mall API 统一导出
 * 从 mall-admin-web 迁移
 */

// 登录和管理员
export { default as AdminService } from './admin';

// 商品管理 (PMS)
export { default as ProductService } from './product';
export { default as BrandService } from './brand';
export { default as ProductCateService } from './productCate';
export { default as ProductAttrService } from './productAttr';
export { default as ProductAttrCateService } from './productAttrCate';
export { default as SkuStockService } from './skuStock';

// 订单管理 (OMS)
export { default as OrderService } from './order';
export { default as OrderSettingService } from './orderSetting';
export { default as ReturnApplyService } from './returnApply';
export { default as ReturnReasonService } from './returnReason';
export { default as CompanyAddressService } from './companyAddress';

// 营销管理 (SMS)
export { default as CouponService } from './coupon';
export { default as CouponHistoryService } from './couponHistory';
export { default as FlashService } from './flash';
export { default as FlashPromotionService } from './flash'; // 别名，兼容原命名
export { default as FlashSessionService } from './flashSession';
export { default as FlashProductRelationService } from './flashProductRelation';
export { default as HomeAdvertiseService } from './homeAdvertise';
export { default as HomeBrandService } from './homeBrand';
export { default as HomeSubjectService } from './homeSubject';
export { default as HotProductService } from './hotProduct';
export { default as NewProductService } from './newProduct';

// 权限管理 (UMS)
export { default as RoleService } from './role';
export { default as MenuService } from './menu';
export { default as ResourceService } from './resource';
export { default as ResourceCategoryService } from './resourceCategory';

// 其他服务
export { default as OssService } from './oss';
export { default as MemberLevelService } from './memberLevel';
export { default as PrefrenceAreaService } from './prefrenceArea';
export { default as SubjectService } from './subject';
