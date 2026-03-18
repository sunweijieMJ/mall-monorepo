import { ElMessage, ElMessageBox } from 'element-plus';
import { ref } from 'vue';

/**
 * 批量操作通用逻辑
 */
export function useBatchOperate<T extends { id?: number }>(
  getListFn: () => void,
) {
  const multipleSelection = ref<T[]>([]);
  const operateType = ref('');

  const handleSelectionChange = (val: T[]) => {
    multipleSelection.value = val;
  };

  const executeBatchOperate = async (
    operateMap: Record<string, () => Promise<any>>,
  ) => {
    if (!operateType.value) {
      ElMessage.warning('请选择操作类型');
      return;
    }
    if (multipleSelection.value.length < 1) {
      ElMessage.warning('请选择要操作的记录');
      return;
    }

    try {
      await ElMessageBox.confirm('是否要进行该批量操作?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      });

      const operation = operateMap[operateType.value];
      if (!operation) {
        ElMessage.error('未知的操作类型');
        return;
      }

      await operation();
      ElMessage.success('操作成功');
      multipleSelection.value = [];
      operateType.value = '';
      await getListFn();
    } catch (error) {
      if (error !== 'cancel') {
        console.error('批量操作失败:', error);
        ElMessage.error('操作失败');
      }
    }
  };

  return {
    multipleSelection,
    operateType,
    handleSelectionChange,
    executeBatchOperate,
  };
}
