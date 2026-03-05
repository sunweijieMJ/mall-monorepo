import { createPersistedPinia } from './plugins/persist';

export * from './modules/mallUser';
export * from './modules/global';
export * from './modules/mallPermission';
export * from './plugins/persist';

// 注意：这里导出的是一个 Promise，需要在 main.ts 中 await
export default createPersistedPinia();
