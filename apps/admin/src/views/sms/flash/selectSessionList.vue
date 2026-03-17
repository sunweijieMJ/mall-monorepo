<!--
  秒杀时段选择页面
  从 mall-admin-web 迁移并转换为 Vue 3 + TypeScript
-->
<template>
  <div class="app-container">
    <el-card shadow="never" class="operate-container">
      <el-icon><Tickets /></el-icon>
      <span>数据列表</span>
    </el-card>
    <div class="table-container">
      <el-table
        ref="selectSessionTableRef"
        v-loading="listLoading"
        :data="list"
        border
        style="width: 100%"
      >
        <el-table-column label="编号" width="100" align="center">
          <template #default="{ row }">{{ row.id }}</template>
        </el-table-column>
        <el-table-column label="秒杀时间段名称" align="center">
          <template #default="{ row }">{{ row.name }}</template>
        </el-table-column>
        <el-table-column label="每日开始时间" align="center">
          <template #default="{ row }">
            {{ formatTime(row.startTime) }}
          </template>
        </el-table-column>
        <el-table-column label="每日结束时间" align="center">
          <template #default="{ row }">{{ formatTime(row.endTime) }}</template>
        </el-table-column>
        <el-table-column label="商品数量" align="center">
          <template #default="{ row }">{{ row.productCount || 0 }}</template>
        </el-table-column>
        <el-table-column label="操作" align="center">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleShowRelation(row)">
              商品列表
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Tickets } from '@element-plus/icons-vue';
import { type ElTable } from 'element-plus';
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { FlashSessionWithCountVo } from '@/api';
import { useFlashPromotionStore } from '@/store';
import { formatDate } from '@/utils/format';

const route = useRoute();
const router = useRouter();
const selectSessionTableRef = ref<InstanceType<typeof ElTable>>();
const flashPromotionStore = useFlashPromotionStore();

const list = ref<FlashSessionWithCountVo[]>([]);
const listLoading = ref(false);

// 格式化时间
const formatTime = (time?: string | null) => {
  if (!time) return 'N/A';
  const date = new Date(time);
  return formatDate(date, 'hh:mm:ss');
};

// 查看商品列表
const handleShowRelation = (row: FlashSessionWithCountVo) => {
  router.push({
    path: '/sms/flashProductRelation',
    query: {
      flashPromotionId: String(route.query.flashPromotionId),
      flashPromotionSessionId: String(row.id),
    },
  });
};

// 获取列表数据
const getList = async () => {
  listLoading.value = true;
  try {
    const flashPromotionId = Number(route.query.flashPromotionId);
    await flashPromotionStore.getSelectableSessions({ flashPromotionId });
    list.value = flashPromotionStore.sessionSelectList;
  } catch (error) {
    console.error('获取秒杀时段列表失败:', error);
  } finally {
    listLoading.value = false;
  }
};

onMounted(() => {
  getList();
});
</script>

<style scoped lang="scss">
.operate-container {
  margin-top: 0;
}
</style>
