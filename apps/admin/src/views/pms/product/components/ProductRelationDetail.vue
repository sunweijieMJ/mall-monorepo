<template>
  <div style="margin-top: 50px">
    <el-form
      ref="productRelationFormRef"
      :model="modelValue"
      label-width="120px"
      class="form-inner-container"
    >
      <el-form-item label="关联专题：">
        <el-transfer
          v-model="selectSubject"
          style="display: inline-block"
          filterable
          :filter-method="filterMethod"
          filter-placeholder="请输入专题名称"
          :titles="subjectTitles"
          :data="subjectList"
        />
      </el-form-item>
      <el-form-item label="关联优选：">
        <el-transfer
          v-model="selectPrefrenceArea"
          style="display: inline-block"
          filterable
          :filter-method="filterMethod"
          filter-placeholder="请输入优选名称"
          :titles="prefrenceAreaTitles"
          :data="prefrenceAreaList"
        />
      </el-form-item>
      <el-form-item style="text-align: center">
        <el-button size="default" @click="handlePrev"
          >上一步，填写商品属性</el-button
        >
        <el-button type="primary" size="default" @click="handleFinishCommit">
          完成，提交商品
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { SubjectService, PrefrenceAreaService } from '@/api/modules';
import type { ProductParam, Subject, PrefrenceArea } from '@/interface';

interface Props {
  modelValue: ProductParam;
  isEdit?: boolean;
}

interface TransferData {
  key: number;
  label: string;
}

const props = withDefaults(defineProps<Props>(), {
  isEdit: false,
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: ProductParam): void;
  (e: 'prevStep'): void;
  (e: 'finishCommit', isEdit: boolean): void;
}>();

const productRelationFormRef = ref();
const subjectList = ref<TransferData[]>([]);
const subjectTitles = ref(['待选择', '已选择']);
const prefrenceAreaList = ref<TransferData[]>([]);
const prefrenceAreaTitles = ref(['待选择', '已选择']);

// 选中的专题
const selectSubject = computed<number[]>({
  get() {
    const subjects: number[] = [];
    const list = props.modelValue.subjectProductRelationList || [];
    for (const item of list) {
      subjects.push(item.subjectId);
    }
    return subjects;
  },
  set(newValue) {
    const updatedValue = { ...props.modelValue };
    updatedValue.subjectProductRelationList = [];
    for (const id of newValue) {
      updatedValue.subjectProductRelationList.push({ subjectId: id });
    }
    emit('update:modelValue', updatedValue);
  },
});

// 选中的优选
const selectPrefrenceArea = computed<number[]>({
  get() {
    const prefrenceAreas: number[] = [];
    const list = props.modelValue.prefrenceAreaProductRelationList || [];
    for (const item of list) {
      prefrenceAreas.push(item.prefrenceAreaId);
    }
    return prefrenceAreas;
  },
  set(newValue) {
    const updatedValue = { ...props.modelValue };
    updatedValue.prefrenceAreaProductRelationList = [];
    for (const id of newValue) {
      updatedValue.prefrenceAreaProductRelationList.push({
        prefrenceAreaId: id,
      });
    }
    emit('update:modelValue', updatedValue);
  },
});

// 过滤方法
const filterMethod = (query: string, item: TransferData): boolean => {
  return item.label.indexOf(query) > -1;
};

// 获取专题列表
const getSubjectList = async () => {
  try {
    const response = await SubjectService.fetchListAll();
    const list = response.data;
    subjectList.value = list.map((item: Subject) => ({
      label: item.title,
      key: item.id,
    }));
  } catch (error) {
    console.error('获取专题列表失败:', error);
  }
};

// 获取优选列表
const getPrefrenceAreaList = async () => {
  try {
    const response = await PrefrenceAreaService.fetchList();
    const list = response.data;
    prefrenceAreaList.value = list.map((item: PrefrenceArea) => ({
      label: item.name,
      key: item.id,
    }));
  } catch (error) {
    console.error('获取优选列表失败:', error);
  }
};

// 上一步
const handlePrev = () => {
  emit('prevStep');
};

// 完成提交
const handleFinishCommit = () => {
  emit('finishCommit', props.isEdit);
};

onMounted(() => {
  getSubjectList();
  getPrefrenceAreaList();
});
</script>

<style scoped>
.form-inner-container {
  max-width: 800px;
}
</style>
