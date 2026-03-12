import { createPersistedPinia } from './plugins/persist';

export * from './modules/mallUser';
export * from './modules/global';
export * from './modules/tabView';
export * from './modules/mallPermission';
export * from './plugins/persist';

// PMS 模块
export * from './modules/brand';
export * from './modules/product';
export * from './modules/productAttr';
export * from './modules/productCate';
export * from './modules/memberLevel';
export * from './modules/subject';
export * from './modules/preferenceArea';

// OMS 模块
export * from './modules/order';
export * from './modules/returnApply';
export * from './modules/returnReason';
export * from './modules/orderSetting';

// UMS 模块
export * from './modules/adminUser';
export * from './modules/menu';
export * from './modules/role';
export * from './modules/resource';

// SMS 模块
export * from './modules/coupon';
export * from './modules/advertise';
export * from './modules/flashPromotion';
export * from './modules/homeBrand';
export * from './modules/homeProduct';
export * from './modules/homeSubject';

// 站点配置
export * from './modules/siteConfig';

// 注意：这里导出的是一个 Promise，需要在 main.ts 中 await
export default createPersistedPinia();
