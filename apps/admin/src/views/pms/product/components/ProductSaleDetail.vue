<template>
  <div style="margin-top: 50px">
    <el-form
      ref="productSaleFormRef"
      :model="localValue"
      label-width="120px"
      class="form-inner-container"
    >
      <el-form-item label="赠送积分：">
        <el-input v-model.number="localValue.giftPoint" type="number" />
      </el-form-item>
      <el-form-item label="赠送成长值：">
        <el-input v-model.number="localValue.giftGrowth" type="number" />
      </el-form-item>
      <el-form-item label="积分购买限制：">
        <el-input v-model.number="localValue.usePointLimit" type="number" />
      </el-form-item>
      <el-form-item label="预告商品：">
        <el-switch
          v-model="localValue.previewStatus"
          :active-value="1"
          :inactive-value="0"
        />
      </el-form-item>
      <el-form-item label="商品上架：">
        <el-switch
          v-model="localValue.publishStatus"
          :active-value="1"
          :inactive-value="0"
        />
      </el-form-item>
      <el-form-item label="商品推荐：">
        <span style="margin-right: 10px">新品</span>
        <el-switch
          v-model="localValue.newStatus"
          :active-value="1"
          :inactive-value="0"
        />
        <span style="margin-right: 10px; margin-left: 10px">推荐</span>
        <el-switch
          v-model="localValue.recommendStatus"
          :active-value="1"
          :inactive-value="0"
        />
      </el-form-item>
      <el-form-item label="服务保证：">
        <el-checkbox-group v-model="selectServiceList">
          <el-checkbox :label="1">无忧退货</el-checkbox>
          <el-checkbox :label="2">快速退款</el-checkbox>
          <el-checkbox :label="3">免费包邮</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item label="详细页标题：">
        <el-input v-model="localValue.detailTitle" />
      </el-form-item>
      <el-form-item label="详细页描述：">
        <el-input v-model="localValue.detailDesc" />
      </el-form-item>
      <el-form-item label="商品关键字：">
        <el-input v-model="localValue.keywords" />
      </el-form-item>
      <el-form-item label="商品备注：">
        <el-input
          v-model="localValue.note"
          type="textarea"
          :autosize="{ minRows: 2 }"
        />
      </el-form-item>
      <el-form-item label="选择优惠方式：">
        <el-radio-group v-model="localValue.promotionType">
          <el-radio-button :label="0">无优惠</el-radio-button>
          <el-radio-button :label="1">特惠促销</el-radio-button>
          <el-radio-button :label="2">会员价格</el-radio-button>
          <el-radio-button :label="3">阶梯价格</el-radio-button>
          <el-radio-button :label="4">满减价格</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <!-- 特惠促销 -->
      <el-form-item v-show="modelValue.promotionType === 1">
        <div>
          开始时间：
          <el-date-picker
            v-model="localValue.promotionStartTime"
            type="datetime"
            placeholder="选择开始时间"
          />
        </div>
        <div class="little-margin">
          结束时间：
          <el-date-picker
            v-model="localValue.promotionEndTime"
            type="datetime"
            placeholder="选择结束时间"
          />
        </div>
        <div class="little-margin">
          促销价格：
          <el-input
            v-model.number="localValue.promotionPrice"
            type="number"
            style="width: 220px"
            placeholder="输入促销价格"
          />
        </div>
      </el-form-item>
      <!-- 会员价格 -->
      <el-form-item v-show="modelValue.promotionType === 2">
        <div
          v-for="(item, index) in modelValue.memberPriceList"
          :key="index"
          :class="{ 'little-margin': index !== 0 }"
        >
          {{ item.memberLevelName }}：
          <el-input
            v-model.number="item.memberPrice"
            type="number"
            style="width: 200px"
          />
        </div>
      </el-form-item>
      <!-- 阶梯价格 -->
      <el-form-item v-show="modelValue.promotionType === 3">
        <el-table
          :data="modelValue.productLadderList"
          style="width: 80%"
          border
        >
          <el-table-column label="数量" align="center" width="120">
            <template #default="{ row }">
              <el-input v-model.number="row.count" type="number" />
            </template>
          </el-table-column>
          <el-table-column label="折扣" align="center" width="120">
            <template #default="{ row }">
              <el-input v-model.number="row.discount" type="number" />
            </template>
          </el-table-column>
          <el-table-column align="center" label="操作">
            <template #default="{ $index, row }">
              <el-button
                type="text"
                @click="handleRemoveProductLadder($index, row)"
              >
                删除
              </el-button>
              <el-button
                type="text"
                @click="handleAddProductLadder($index, row)"
              >
                添加
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
      <!-- 满减价格 -->
      <el-form-item v-show="modelValue.promotionType === 4">
        <el-table
          :data="modelValue.productFullReductionList"
          style="width: 80%"
          border
        >
          <el-table-column label="满" align="center" width="120">
            <template #default="{ row }">
              <el-input v-model.number="row.fullPrice" type="number" />
            </template>
          </el-table-column>
          <el-table-column label="立减" align="center" width="120">
            <template #default="{ row }">
              <el-input v-model.number="row.reducePrice" type="number" />
            </template>
          </el-table-column>
          <el-table-column align="center" label="操作">
            <template #default="{ $index, row }">
              <el-button
                type="text"
                @click="handleRemoveFullReduction($index, row)"
              >
                删除
              </el-button>
              <el-button
                type="text"
                @click="handleAddFullReduction($index, row)"
              >
                添加
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
      <el-form-item style="text-align: center">
        <el-button size="default" @click="handlePrev"
          >上一步，填写商品信息</el-button
        >
        <el-button type="primary" size="default" @click="handleNext">
          下一步，填写商品属性
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus';
import { computed, onMounted, ref, watch } from 'vue';
import { MemberLevelService } from '@/api/modules';
import type {
  ProductParam,
  MemberPrice,
  ProductLadder,
  ProductFullReduction,
} from '@/interface';

interface Props {
  modelValue: ProductParam;
  isEdit?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isEdit: false,
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: ProductParam): void;
  (e: 'nextStep'): void;
  (e: 'prevStep'): void;
}>();

// 选中的服务保证
const selectServiceList = computed<number[]>({
  get() {
    const list: number[] = [];
    if (!localValue.value.serviceIds) return list;
    const ids = localValue.value.serviceIds.split(',');
    for (const id of ids) {
      if (id) list.push(Number(id));
    }
    return list;
  },
  set(newValue) {
    if (newValue != null && newValue.length > 0) {
      localValue.value.serviceIds = newValue.join(',');
    } else {
      localValue.value.serviceIds = '';
    }
  },
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

// 删除阶梯价格
const handleRemoveProductLadder = (index: number, row: ProductLadder) => {
  const list = localValue.value.productLadderList || [];
  if (list.length === 1) {
    list.splice(0, 1);
    list.push({ count: 0, discount: 0, price: 0 });
  } else {
    list.splice(index, 1);
  }
};

// 添加阶梯价格
const handleAddProductLadder = (index: number, row: ProductLadder) => {
  const list = localValue.value.productLadderList || [];
  if (list.length < 3) {
    list.push({ count: 0, discount: 0, price: 0 });
  } else {
    ElMessage.warning('最多只能添加三条');
  }
};

// 删除满减价格
const handleRemoveFullReduction = (
  index: number,
  row: ProductFullReduction,
) => {
  const list = localValue.value.productFullReductionList || [];
  if (list.length === 1) {
    list.splice(0, 1);
    list.push({ fullPrice: 0, reducePrice: 0 });
  } else {
    list.splice(index, 1);
  }
};

// 添加满减价格
const handleAddFullReduction = (index: number, row: ProductFullReduction) => {
  const list = localValue.value.productFullReductionList || [];
  if (list.length < 3) {
    list.push({ fullPrice: 0, reducePrice: 0 });
  } else {
    ElMessage.warning('最多只能添加三条');
  }
};

// 上一步
const handlePrev = () => {
  emit('prevStep');
};

// 下一步
const handleNext = () => {
  emit('nextStep');
};

// 初始化
onMounted(async () => {
  if (!props.isEdit) {
    // 新增模式，获取会员等级列表
    try {
      const response = await MemberLevelService.fetchList({ defaultStatus: 0 });
      const memberPriceList: MemberPrice[] = response.data.map((item) => ({
        memberLevelId: item.id,
        memberLevelName: item.name,
        memberPrice: 0,
      }));
      if (localValue.value.memberPriceList) {
        localValue.value.memberPriceList = memberPriceList;
      }
    } catch (error) {
      console.error('获取会员等级失败:', error);
    }
  }
});
</script>

<style scoped>
.form-inner-container {
  max-width: 800px;
}

.little-margin {
  margin-top: 10px;
}
</style>
