<template>
  <div style="margin-top: 50px">
    <el-form
      ref="productAttrFormRef"
      :model="localValue"
      label-width="120px"
      class="form-inner-container"
    >
      <el-form-item label="属性类型：">
        <el-select
          v-model="localValue.productAttributeCategoryId"
          placeholder="请选择属性类型"
          @change="handleProductAttrChange"
        >
          <el-option
            v-for="item in productAttributeCategoryOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="商品规格：">
        <el-card shadow="never" class="card-bg">
          <div
            v-for="(productAttr, idx) in selectProductAttr"
            :key="productAttr.id"
          >
            {{ productAttr.name }}：
            <el-checkbox-group
              v-if="productAttr.handAddStatus === 0"
              v-model="selectProductAttr[idx].values"
            >
              <el-checkbox
                v-for="item in getInputListArr(productAttr.inputList)"
                :key="item"
                :label="item"
                class="little-margin-left"
              />
            </el-checkbox-group>
            <div v-else>
              <el-checkbox-group v-model="selectProductAttr[idx].values">
                <div
                  v-for="(item, index) in selectProductAttr[idx].options"
                  :key="item"
                  style="display: inline-block"
                  class="little-margin-left"
                >
                  <el-checkbox :label="item" />
                  <el-button
                    type="text"
                    class="little-margin-left"
                    @click="handleRemoveProductAttrValue(idx, index)"
                  >
                    删除
                  </el-button>
                </div>
              </el-checkbox-group>
              <el-input
                v-model="addProductAttrValue"
                style="width: 160px; margin-left: 10px"
                clearable
              />
              <el-button
                class="little-margin-left"
                @click="handleAddProductAttrValue(idx)"
              >
                增加
              </el-button>
            </div>
          </div>
        </el-card>
        <el-table
          style="width: 100%; margin-top: 20px"
          :data="modelValue.skuStockList"
          border
        >
          <el-table-column
            v-for="(item, index) in selectProductAttr"
            :key="item.id"
            :label="item.name"
            align="center"
          >
            <template #default="{ row }">
              {{ getProductSkuSp(row, index) }}
            </template>
          </el-table-column>
          <el-table-column label="销售价格" width="100" align="center">
            <template #default="{ row }">
              <el-input v-model.number="row.price" type="number" />
            </template>
          </el-table-column>
          <el-table-column label="促销价格" width="100" align="center">
            <template #default="{ row }">
              <el-input v-model.number="row.promotionPrice" type="number" />
            </template>
          </el-table-column>
          <el-table-column label="商品库存" width="80" align="center">
            <template #default="{ row }">
              <el-input v-model.number="row.stock" type="number" />
            </template>
          </el-table-column>
          <el-table-column label="库存预警值" width="80" align="center">
            <template #default="{ row }">
              <el-input v-model.number="row.lowStock" type="number" />
            </template>
          </el-table-column>
          <el-table-column label="SKU编号" width="160" align="center">
            <template #default="{ row }">
              <el-input v-model="row.skuCode" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="80" align="center">
            <template #default="{ $index, row }">
              <el-button
                type="text"
                @click="handleRemoveProductSku($index, row)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-button
          type="primary"
          style="margin-top: 20px"
          @click="handleRefreshProductSkuList"
        >
          刷新列表
        </el-button>
        <el-button
          type="primary"
          style="margin-top: 20px"
          @click="handleSyncProductSkuPrice"
        >
          同步价格
        </el-button>
        <el-button
          type="primary"
          style="margin-top: 20px"
          @click="handleSyncProductSkuStock"
        >
          同步库存
        </el-button>
      </el-form-item>
      <el-form-item v-if="hasAttrPic" label="属性图片：">
        <el-card shadow="never" class="card-bg">
          <div v-for="(item, index) in selectProductAttrPics" :key="index">
            <span>{{ item.name }}:</span>
            <SingleUpload
              v-model="item.pic"
              style="display: inline-block; width: 300px; margin-left: 10px"
            />
          </div>
        </el-card>
      </el-form-item>
      <el-form-item label="商品参数：">
        <el-card shadow="never" class="card-bg">
          <div
            v-for="(item, index) in selectProductParam"
            :key="item.id"
            :class="{ 'little-margin-top': index !== 0 }"
          >
            <div class="param-input-label">{{ item.name }}:</div>
            <el-select
              v-if="item.inputType === 1"
              v-model="selectProductParam[index].value"
              class="param-input"
            >
              <el-option
                v-for="option in getParamInputList(item.inputList)"
                :key="option"
                :label="option"
                :value="option"
              />
            </el-select>
            <el-input
              v-else
              v-model="selectProductParam[index].value"
              class="param-input"
            />
          </div>
        </el-card>
      </el-form-item>
      <el-form-item label="商品相册：">
        <MultiUpload v-model="selectProductPics" />
      </el-form-item>
      <el-form-item label="商品详情：">
        <el-tabs v-model="activeHtmlName" type="card">
          <el-tab-pane label="电脑端详情" name="pc">
            <Tinymce
              v-model="localValue.detailHtml"
              :width="595"
              :height="300"
            />
          </el-tab-pane>
          <el-tab-pane label="移动端详情" name="mobile">
            <Tinymce
              v-model="localValue.detailMobileHtml"
              :width="595"
              :height="300"
            />
          </el-tab-pane>
        </el-tabs>
      </el-form-item>
      <el-form-item style="text-align: center">
        <el-button size="default" @click="handlePrev"
          >上一步，填写商品促销</el-button
        >
        <el-button type="primary" size="default" @click="handleNext">
          下一步，选择商品关联
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus';
import { ref, computed, watch, onMounted } from 'vue';
import { ProductAttrCateService, ProductAttrService } from '@/api/modules';
import Tinymce from '@/components/Tinymce/index.vue';
import MultiUpload from '@/components/Upload/MultiUpload.vue';
import SingleUpload from '@/components/Upload/SingleUpload.vue';
import type {
  ProductParam,
  ProductAttributeCategory,
  ProductAttribute,
  ProductAttributeValue,
  SkuStock,
} from '@/interface';

interface Props {
  modelValue: ProductParam;
  isEdit?: boolean;
}

interface SelectOption {
  label: string;
  value: number;
}

interface SelectProductAttr {
  id: number;
  name: string;
  handAddStatus: number;
  inputList: string | null;
  values: string[];
  options: string[];
}

interface SelectProductParam {
  id: number;
  name: string;
  value?: string;
  inputType: number;
  inputList: string | null;
}

interface AttrPic {
  name: string;
  pic?: string | null;
}

const props = withDefaults(defineProps<Props>(), {
  isEdit: false,
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: ProductParam): void;
  (e: 'nextStep'): void;
  (e: 'prevStep'): void;
}>();

const productAttrFormRef = ref();
const hasEditCreated = ref(false);
const productAttributeCategoryOptions = ref<SelectOption[]>([]);
const selectProductAttr = ref<SelectProductAttr[]>([]);
const selectProductParam = ref<SelectProductParam[]>([]);
const selectProductAttrPics = ref<AttrPic[]>([]);
const addProductAttrValue = ref('');
const activeHtmlName = ref('pc');

// 是否有商品属性图片
const hasAttrPic = computed(() => {
  return selectProductAttrPics.value.length > 0;
});

// ==================== 本地数据副本 ====================
// 创建本地响应式副本，避免直接修改 props
const localValue = ref({ ...props.modelValue });

// Props → Local: 监听 props 变化，同步到本地副本
watch(
  () => props.modelValue,
  (newVal) => {
    localValue.value = { ...newVal };
  },
  { deep: true, immediate: false },
);

// Local → Parent: 监听本地副本变化，emit 更新到父组件
watch(
  localValue,
  (newVal) => {
    emit('update:modelValue', newVal);
  },
  { deep: true },
);
// ====================================================

// 商品ID
const productId = computed(() => localValue.value.id);

// 商品的主图和画册图片
const selectProductPics = computed<string[]>({
  get() {
    const pics: string[] = [];
    if (localValue.value.pic) {
      pics.push(localValue.value.pic);
    }
    if (localValue.value.albumPics) {
      const albumPics = localValue.value.albumPics.split(',');
      pics.push(...albumPics);
    }
    return pics;
  },
  set(newValue) {
    if (!newValue || newValue.length === 0) {
      localValue.value.pic = '';
      localValue.value.albumPics = '';
    } else {
      localValue.value.pic = newValue[0];
      if (newValue.length > 1) {
        localValue.value.albumPics = newValue.slice(1).join(',');
      } else {
        localValue.value.albumPics = '';
      }
    }
  },
});

// 监听商品ID变化（编辑模式）
watch(productId, (newValue) => {
  if (!props.isEdit) return;
  if (hasEditCreated.value) return;
  if (newValue === undefined || newValue == null || newValue === 0) return;
  handleEditCreated();
});

// 处理编辑模式初始化
const handleEditCreated = () => {
  if (localValue.value.productAttributeCategoryId != null) {
    handleProductAttrChange(localValue.value.productAttributeCategoryId);
  }
  hasEditCreated.value = true;
};
// 获取商品属性分类列表
const getProductAttrCateList = async () => {
  try {
    const response = await ProductAttrCateService.fetchList({
      pageNum: 1,
      pageSize: 100,
    });
    productAttributeCategoryOptions.value = response.data.list.map((item) => ({
      label: item.name,
      value: item.id,
    }));
  } catch (error) {
    console.error('获取属性分类失败:', error);
  }
};

// 获取商品属性列表
const getProductAttrList = async (type: number, cid: number) => {
  try {
    const response = await ProductAttrService.fetchList(cid, {
      pageNum: 1,
      pageSize: 100,
      type,
    });
    const list = response.data.list;

    if (type === 0) {
      // 规格属性
      selectProductAttr.value = [];
      for (const item of list) {
        let options: string[] = [];
        let values: string[] = [];
        if (props.isEdit) {
          if (item.handAddStatus === 1) {
            options = getEditAttrOptions(item.id);
          }
          values = getEditAttrValues(selectProductAttr.value.length);
        }
        selectProductAttr.value.push({
          id: item.id,
          name: item.name,
          handAddStatus: item.handAddStatus,
          inputList: item.inputList,
          values,
          options,
        });
      }
      if (props.isEdit) {
        refreshProductAttrPics();
      }
    } else {
      // 参数属性
      selectProductParam.value = [];
      for (const item of list) {
        let value: string | undefined;
        if (props.isEdit) {
          value = getEditParamValue(item.id);
        }
        selectProductParam.value.push({
          id: item.id,
          name: item.name,
          value,
          inputType: item.inputType,
          inputList: item.inputList,
        });
      }
    }
  } catch (error) {
    console.error('获取属性列表失败:', error);
  }
};

// 获取设置的可手动添加属性值
const getEditAttrOptions = (id: number): string[] => {
  const options: string[] = [];
  const list = localValue.value.productAttributeValueList || [];
  for (const attrValue of list) {
    if (attrValue.productAttributeId === id && attrValue.value) {
      options.push(...attrValue.value.split(','));
      break;
    }
  }
  return options;
};

// 获取选中的属性值
const getEditAttrValues = (index: number): string[] => {
  const values = new Set<string>();
  const skuList = localValue.value.skuStockList || [];

  for (const sku of skuList) {
    if (!sku.spData) continue;
    try {
      const spData = JSON.parse(sku.spData);
      if (spData && spData.length > index) {
        values.add(spData[index].value);
      }
    } catch (error) {
      console.error('解析SKU数据失败:', error, sku.spData);
    }
  }
  return Array.from(values);
};

// 获取属性的值
const getEditParamValue = (id: number): string | undefined => {
  const list = localValue.value.productAttributeValueList || [];
  for (const item of list) {
    if (id === item.productAttributeId) {
      return item.value;
    }
  }
  return undefined;
};

// 属性类型变化
const handleProductAttrChange = (value: number) => {
  getProductAttrList(0, value);
  getProductAttrList(1, value);
};

// 获取输入列表数组
const getInputListArr = (inputList: string | null): string[] => {
  if (!inputList) return [];
  return inputList.split(',');
};

// 添加属性值
const handleAddProductAttrValue = (idx: number) => {
  const options = selectProductAttr.value[idx].options;
  if (!addProductAttrValue.value) {
    ElMessage.warning('属性值不能为空');
    return;
  }
  if (options.includes(addProductAttrValue.value)) {
    ElMessage.warning('属性值不能重复');
    return;
  }
  selectProductAttr.value[idx].options.push(addProductAttrValue.value);
  addProductAttrValue.value = '';
};

// 删除属性值
const handleRemoveProductAttrValue = (idx: number, index: number) => {
  selectProductAttr.value[idx].options.splice(index, 1);
};

// 获取产品SKU规格数据
const getProductSkuSp = (row: SkuStock, index: number): string => {
  if (!row.spData) return '';
  try {
    const spData = JSON.parse(row.spData);
    if (spData && index < spData.length) {
      return spData[index].value;
    }
  } catch (error) {
    console.error('解析SKU规格数据失败:', error, row.spData);
  }
  return '';
};

// 刷新产品SKU列表
const handleRefreshProductSkuList = async () => {
  try {
    await ElMessageBox.confirm(
      '刷新列表将导致sku信息重新生成，是否要刷新',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      },
    );
    refreshProductAttrPics();
    refreshProductSkuList();
  } catch (error) {
    // 用户取消
  }
};

// 同步SKU价格
const handleSyncProductSkuPrice = async () => {
  try {
    await ElMessageBox.confirm(
      '将同步第一个sku的价格到所有sku,是否继续',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      },
    );
    const skuList = localValue.value.skuStockList || [];
    if (skuList.length > 0) {
      const price = skuList[0].price;
      skuList.forEach((sku) => {
        sku.price = price;
      });
    }
  } catch (error) {
    // 用户取消
  }
};

// 同步SKU库存
const handleSyncProductSkuStock = async () => {
  try {
    await ElMessageBox.confirm(
      '将同步第一个sku的库存到所有sku,是否继续',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      },
    );
    const skuList = localValue.value.skuStockList || [];
    if (skuList.length > 0) {
      const stock = skuList[0].stock;
      const lowStock = skuList[0].lowStock;
      skuList.forEach((sku) => {
        sku.stock = stock;
        sku.lowStock = lowStock;
      });
    }
  } catch (error) {
    // 用户取消
  }
};

// 刷新SKU列表
const refreshProductSkuList = () => {
  localValue.value.skuStockList = [];
  const skuList = localValue.value.skuStockList;

  if (selectProductAttr.value.length === 1) {
    const attr = selectProductAttr.value[0];
    for (const value of attr.values) {
      skuList.push({
        spData: JSON.stringify([{ key: attr.name, value }]),
      });
    }
  } else if (selectProductAttr.value.length === 2) {
    const attr0 = selectProductAttr.value[0];
    const attr1 = selectProductAttr.value[1];
    for (const value0 of attr0.values) {
      if (attr1.values.length === 0) {
        skuList.push({
          spData: JSON.stringify([{ key: attr0.name, value: value0 }]),
        });
        continue;
      }
      for (const value1 of attr1.values) {
        skuList.push({
          spData: JSON.stringify([
            { key: attr0.name, value: value0 },
            { key: attr1.name, value: value1 },
          ]),
        });
      }
    }
  } else if (selectProductAttr.value.length >= 3) {
    const attr0 = selectProductAttr.value[0];
    const attr1 = selectProductAttr.value[1];
    const attr2 = selectProductAttr.value[2];
    for (const value0 of attr0.values) {
      if (attr1.values.length === 0) {
        skuList.push({
          spData: JSON.stringify([{ key: attr0.name, value: value0 }]),
        });
        continue;
      }
      for (const value1 of attr1.values) {
        if (attr2.values.length === 0) {
          skuList.push({
            spData: JSON.stringify([
              { key: attr0.name, value: value0 },
              { key: attr1.name, value: value1 },
            ]),
          });
          continue;
        }
        for (const value2 of attr2.values) {
          skuList.push({
            spData: JSON.stringify([
              { key: attr0.name, value: value0 },
              { key: attr1.name, value: value1 },
              { key: attr2.name, value: value2 },
            ]),
          });
        }
      }
    }
  }
};

// 刷新属性图片
const refreshProductAttrPics = () => {
  selectProductAttrPics.value = [];
  if (selectProductAttr.value.length >= 1) {
    const values = selectProductAttr.value[0].values;
    for (const value of values) {
      let pic: string | undefined;
      if (props.isEdit) {
        pic = getProductSkuPic(value);
      }
      selectProductAttrPics.value.push({ name: value, pic });
    }
  }
};

// 获取商品相关属性的图片
const getProductSkuPic = (name: string): string | undefined => {
  const skuList = localValue.value.skuStockList || [];
  for (const sku of skuList) {
    if (!sku.spData) continue;
    try {
      const spData = JSON.parse(sku.spData);
      if (spData[0]?.value === name) {
        return sku.pic || undefined;
      }
    } catch (error) {
      console.error('解析SKU图片数据失败:', error, sku.spData);
    }
  }
  return undefined;
};

// 合并商品属性
const mergeProductAttrValue = () => {
  localValue.value.productAttributeValueList = [];

  for (const attr of selectProductAttr.value) {
    if (attr.handAddStatus === 1 && attr.options.length > 0) {
      localValue.value.productAttributeValueList.push({
        productAttributeId: attr.id,
        value: attr.options.join(','),
      });
    }
  }

  for (const param of selectProductParam.value) {
    if (param.value) {
      localValue.value.productAttributeValueList.push({
        productAttributeId: param.id,
        value: param.value,
      });
    }
  }
};

// 合并商品属性图片
const mergeProductAttrPics = () => {
  const skuList = localValue.value.skuStockList || [];
  for (const attrPic of selectProductAttrPics.value) {
    for (const sku of skuList) {
      if (!sku.spData) continue;
      try {
        const spData = JSON.parse(sku.spData);
        if (spData[0]?.value === attrPic.name) {
          sku.pic = attrPic.pic || null;
        }
      } catch (error) {
        console.error('解析SKU属性图片数据失败:', error, sku.spData);
      }
    }
  }
};

// 删除SKU
const handleRemoveProductSku = (index: number, row: SkuStock) => {
  const list = localValue.value.skuStockList || [];
  if (list.length === 1) {
    list.splice(0, 1);
  } else {
    list.splice(index, 1);
  }
};

// 获取参数输入列表
const getParamInputList = (inputList: string | null): string[] => {
  if (!inputList) return [];
  return inputList.split(',');
};

// 上一步
const handlePrev = () => {
  emit('prevStep');
};

// 下一步
const handleNext = () => {
  mergeProductAttrValue();
  mergeProductAttrPics();
  emit('nextStep');
};

onMounted(() => {
  getProductAttrCateList();
});
</script>
<style scoped>
.form-inner-container {
  max-width: 1200px;
}

.little-margin-left {
  margin-left: 10px;
}

.little-margin-top {
  margin-top: 10px;
}

.param-input {
  width: 250px;
}

.param-input-label {
  display: inline-block;
  width: 100px;
  padding-right: 10px;
  text-align: right;
}

.card-bg {
  background: #f8f9fc;
}
</style>
