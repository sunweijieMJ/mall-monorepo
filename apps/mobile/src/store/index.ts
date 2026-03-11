import { createPersistedPinia } from './plugins/persist';

export { createPersistedPinia };

export * from './modules/global';
export * from './modules/user';
export * from './modules/cart';
export * from './modules/home';
export * from './modules/brand';
export * from './modules/product';
export * from './modules/order';
export * from './modules/coupon';
export * from './modules/address';
export * from './modules/member';
export * from './modules/attention';
export * from './modules/collection';
export * from './modules/history';
export * from './modules/returnApply';
export * from './modules/payment';

export default createPersistedPinia();
