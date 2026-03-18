import { ElMessage } from 'element-plus';
import { nextTick, ref } from 'vue';

/**
 * 状态切换通用逻辑
 * @param updateFn 更新状态的 API 函数
 * @param getListFn 可选的刷新列表函数
 */
export function useStatusToggle<T extends Record<string, any>>(
  updateFn: (ids: number[], status: number) => Promise<any>,
  getListFn?: () => void,
) {
  const updating = ref(false);

  return async (row: T) => {
    if (updating.value) return;
    updating.value = true;

    const statusFields = [
      'navStatus',
      'showStatus',
      'factoryStatus',
      'publishStatus',
      'newStatus',
      'recommendStatus',
    ];
    const field = statusFields.find((f) => f in row) as keyof T;
    const originalStatus = row[field];

    try {
      await updateFn([row.id!], row[field] as number);
      ElMessage.success('修改成功');
      getListFn?.();
    } catch (error) {
      console.error('修改失败:', error);
      await nextTick();
      row[field] = originalStatus;
      ElMessage.error('修改失败');
    } finally {
      updating.value = false;
    }
  };
}
