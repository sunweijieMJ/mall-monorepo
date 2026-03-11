/**
 * Mall 组件统一导出
 * 从 mall-admin-web 迁移并转换为 Vue 3 + TypeScript
 */

// 上传组件
export { default as SingleUpload } from './Upload/SingleUpload.vue';
export { default as MultiUpload } from './Upload/MultiUpload.vue';

// 富文本编辑器
export { default as Tinymce } from './Tinymce/index.vue';
export { default as EditorImage } from './Tinymce/components/editorImage.vue';

// 列表页通用组件
export { default as FilterContainer } from './List/FilterContainer.vue';
export { default as OperateContainer } from './List/OperateContainer.vue';
export { default as AppPagination } from './List/AppPagination.vue';
export { default as AppTable } from './List/AppTable.vue';

// 弹窗组件
export { default as AppDialog } from './Dialog/AppDialog.vue';
