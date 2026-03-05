<!--
  订单设置页面
  配置订单相关的超时时间
-->
<template>
  <el-card class="form-container" shadow="never">
    <el-form
      ref="orderSettingFormRef"
      :model="orderSetting"
      :rules="rules"
      label-width="150px"
    >
      <el-form-item label="秒杀订单超过：" prop="flashOrderOvertime">
        <el-input-number
          v-model="orderSetting.flashOrderOvertime"
          class="input-width"
          :min="0"
          controls-position="right"
        />
        <span class="note-margin">分钟未付款，订单自动关闭</span>
      </el-form-item>

      <el-form-item label="正常订单超过：" prop="normalOrderOvertime">
        <el-input-number
          v-model="orderSetting.normalOrderOvertime"
          class="input-width"
          :min="0"
          controls-position="right"
        />
        <span class="note-margin">分钟未付款，订单自动关闭</span>
      </el-form-item>

      <el-form-item label="发货超过：" prop="confirmOvertime">
        <el-input-number
          v-model="orderSetting.confirmOvertime"
          class="input-width"
          :min="0"
          controls-position="right"
        />
        <span class="note-margin">天未收货，订单自动完成</span>
      </el-form-item>

      <el-form-item label="订单完成超过：" prop="finishOvertime">
        <el-input-number
          v-model="orderSetting.finishOvertime"
          class="input-width"
          :min="0"
          controls-position="right"
        />
        <span class="note-margin">天自动结束交易，不能申请售后</span>
      </el-form-item>

      <el-form-item label="订单完成超过：" prop="commentOvertime">
        <el-input-number
          v-model="orderSetting.commentOvertime"
          class="input-width"
          :min="0"
          controls-position="right"
        />
        <span class="note-margin">天自动五星好评</span>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="confirm">提交</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
import {
  ElMessage,
  ElMessageBox,
  type FormInstance,
  type FormRules,
} from 'element-plus';
import { ref, reactive, onMounted } from 'vue';
import { OrderSettingService } from '@/api/modules';
import type { OrderSetting } from '@/interface';

// 表单引用
const orderSettingFormRef = ref<FormInstance>();

// 默认订单设置
const defaultOrderSetting: Partial<OrderSetting> = {
  id: null,
  flashOrderOvertime: 0,
  normalOrderOvertime: 0,
  confirmOvertime: 0,
  finishOvertime: 0,
  commentOvertime: 0,
};

// 订单设置数据
const orderSetting = reactive<Partial<OrderSetting>>({
  ...defaultOrderSetting,
});

// 验证规则
const rules: FormRules = {
  flashOrderOvertime: [
    { required: true, message: '时间不能为空', trigger: 'blur' },
    { type: 'number', message: '请输入数字值', trigger: 'blur' },
  ],
  normalOrderOvertime: [
    { required: true, message: '时间不能为空', trigger: 'blur' },
    { type: 'number', message: '请输入数字值', trigger: 'blur' },
  ],
  confirmOvertime: [
    { required: true, message: '时间不能为空', trigger: 'blur' },
    { type: 'number', message: '请输入数字值', trigger: 'blur' },
  ],
  finishOvertime: [
    { required: true, message: '时间不能为空', trigger: 'blur' },
    { type: 'number', message: '请输入数字值', trigger: 'blur' },
  ],
  commentOvertime: [
    { required: true, message: '时间不能为空', trigger: 'blur' },
    { type: 'number', message: '请输入数字值', trigger: 'blur' },
  ],
};

// 提交确认
const confirm = async () => {
  if (!orderSettingFormRef.value) return;

  try {
    const valid = await orderSettingFormRef.value.validate();
    if (!valid) {
      ElMessage.warning('提交参数不合法');
      return false;
    }

    await ElMessageBox.confirm('是否要提交修改?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    await OrderSettingService.updateOrderSetting(
      1,
      orderSetting as OrderSetting,
    );
    ElMessage.success('提交成功!');
  } catch (error) {
    if (error !== 'cancel') {
      console.error('提交失败:', error);
      ElMessage.error('提交失败');
    }
  }
};

// 获取订单设置详情
const getDetail = async () => {
  try {
    const response = await OrderSettingService.getOrderSetting(1);
    Object.assign(orderSetting, response.data);
  } catch (error) {
    console.error('获取订单设置失败:', error);
  }
};

// 页面加载
onMounted(() => {
  getDetail();
});
</script>

<style scoped lang="scss">
.form-container {
  padding: 20px;
}

.input-width {
  width: 200px;
}

.note-margin {
  margin-left: 15px;
  color: #909399;
  font-size: 14px;
}
</style>
