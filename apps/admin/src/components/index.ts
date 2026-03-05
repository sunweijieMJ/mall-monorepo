/**
 * Mall 组件统一导出
 * 从 mall-admin-web 迁移并转换为 Vue 3 + TypeScript
 */

// 基础组件
export { default as SvgIcon } from './SvgIcon/index.vue';
export { default as Hamburger } from './Hamburger/index.vue';
export { default as Breadcrumb } from './Breadcrumb/index.vue';
export { default as ScrollBar } from './ScrollBar/index.vue';

// 上传组件
export { default as SingleUpload } from './Upload/SingleUpload.vue';
export { default as MultiUpload } from './Upload/MultiUpload.vue';

// 富文本编辑器
export { default as Tinymce } from './Tinymce/index.vue';
export { default as EditorImage } from './Tinymce/components/editorImage.vue';
