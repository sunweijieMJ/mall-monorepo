import { ElMessage, ElMessageBox } from 'element-plus';

/**
 * 删除确认 Composable
 */
export const useDeleteConfirm = (
  entityName: string,
  deleteApi: (id: number) => Promise<void>,
  onSuccess?: () => void,
) => {
  const handleDelete = async (id: number) => {
    try {
      await ElMessageBox.confirm(`是否要删除该${entityName}?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      });
      await deleteApi(id);
      ElMessage.success('删除成功');
      onSuccess?.();
    } catch (error: any) {
      if (error !== 'cancel') {
        console.error('删除失败:', error);
        ElMessage.error('删除失败');
      }
    }
  };

  return { handleDelete };
};
