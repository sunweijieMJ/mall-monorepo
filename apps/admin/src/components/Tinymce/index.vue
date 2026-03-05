<!--
  Mall Tinymce 富文本编辑器组件
  从 mall-admin-web 迁移并转换为 Vue 3 + TypeScript

  注意：需要先安装 tinymce
  pnpm add tinymce @tinymce/tinymce-vue

  并在 public 目录下放置 tinymce 资源文件
-->
<template>
  <div class="tinymce-container editor-container">
    <textarea :id="tinymceId" class="tinymce-textarea"></textarea>
    <div class="editor-custom-btn-container">
      <editor-image
        :color="'#1890ff'"
        class="editor-upload-btn"
        @success-c-b-k="imageSuccessCBK"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  watch,
  onMounted,
  onActivated,
  onDeactivated,
  onBeforeUnmount,
  nextTick,
} from 'vue';
import editorImage from './components/editorImage.vue';

// 声明全局 tinymce
declare global {
  interface Window {
    tinymce: any;
  }
}

interface Props {
  id?: string;
  modelValue?: string;
  toolbar?: string[];
  menubar?: string;
  height?: number;
  width?: number;
}

interface UploadedFile {
  uid: string | number;
  url: string;
  hasSuccess: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  id: 'tinymce-editor',
  modelValue: '',
  toolbar: () => [],
  menubar: 'file edit insert view format table',
  height: 360,
  width: 720,
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const hasChange = ref(false);
const hasInit = ref(false);
const tinymceId = ref(props.id || `vue-tinymce-${Date.now()}`);

// 默认插件配置
const plugins = [
  'advlist anchor autolink autosave code codesample colorpicker',
  'contextmenu directionality emoticons fullscreen hr image imagetools',
  'importcss insertdatetime legacyoutput link lists media nonbreaking',
  'noneditable pagebreak paste preview print save searchreplace',
  'spellchecker tabfocus table template textcolor textpattern',
  'visualblocks visualchars wordcount',
];

// 默认工具栏配置
const defaultToolbar = [
  'bold italic underline strikethrough alignleft aligncenter',
  'alignright outdent indent blockquote undo redo removeformat code',
  'hr bullist numlist link image charmap preview anchor pagebreak',
  'fullscreen insertdatetime media table forecolor backcolor',
];

// 初始化 TinyMCE
const initTinymce = () => {
  if (!window.tinymce) {
    console.warn('TinyMCE 未加载，请先引入 tinymce 库');
    return;
  }

  const toolbar = props.toolbar.length > 0 ? props.toolbar : defaultToolbar;

  window.tinymce.init({
    selector: `#${tinymceId.value}`,
    width: props.width,
    height: props.height,
    language: 'zh_CN',
    body_class: 'panel-body',
    object_resizing: false,
    toolbar: toolbar.join(' '),
    menubar: false,
    plugins: plugins.join(' '),
    end_container_on_empty_block: true,
    powerpaste_word_import: 'clean',
    code_dialog_height: 450,
    code_dialog_width: 1000,
    advlist_bullet_styles: 'square',
    advlist_number_styles: 'default',
    imagetools_cors_hosts: ['www.tinymce.com', 'codepen.io'],
    default_link_target: '_blank',
    link_title: false,
    init_instance_callback: (editor: any) => {
      // 设置初始内容
      if (props.modelValue) {
        editor.setContent(props.modelValue);
      }

      hasInit.value = true;

      // 监听内容变化
      editor.on('NodeChange Change KeyUp SetContent', () => {
        hasChange.value = true;
        emit('update:modelValue', editor.getContent());
      });
    },
  });
};

// 销毁 TinyMCE
const destroyTinymce = () => {
  if (window.tinymce && window.tinymce.get(tinymceId.value)) {
    window.tinymce.get(tinymceId.value).destroy();
    hasInit.value = false;
  }
};

// 设置内容
const setContent = (value: string) => {
  if (window.tinymce && window.tinymce.get(tinymceId.value)) {
    window.tinymce.get(tinymceId.value).setContent(value);
  }
};

// 获取内容
const getContent = (): string => {
  if (window.tinymce && window.tinymce.get(tinymceId.value)) {
    return window.tinymce.get(tinymceId.value).getContent();
  }
  return '';
};

// 图片上传成功回调
const imageSuccessCBK = (arr: UploadedFile[]) => {
  arr.forEach((v) => {
    if (window.tinymce && window.tinymce.get(tinymceId.value)) {
      window.tinymce
        .get(tinymceId.value)
        .insertContent(`<img class="wscnph" src="${v.url}" />`);
    }
  });
};

// 监听外部值变化
watch(
  () => props.modelValue,
  (val) => {
    if (!hasChange.value && hasInit.value) {
      nextTick(() => {
        setContent(val || '');
      });
    }
  },
);

// 生命周期
onMounted(() => {
  initTinymce();
});

onActivated(() => {
  if (!hasInit.value) {
    initTinymce();
  }
});

onDeactivated(() => {
  destroyTinymce();
});

onBeforeUnmount(() => {
  destroyTinymce();
});

// 暴露方法给父组件
defineExpose({
  setContent,
  getContent,
});
</script>

<style scoped>
.tinymce-container {
  position: relative;
}

.tinymce-container :deep(.mce-fullscreen) {
  z-index: 10000;
}

.tinymce-textarea {
  visibility: hidden;
  z-index: -1;
}

.editor-custom-btn-container {
  position: absolute;
  top: 2px;
  right: 10px;
}

.editor-upload-btn {
  display: inline-block;
}
</style>
