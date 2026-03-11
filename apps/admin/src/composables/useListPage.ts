/**
 * 列表页通用逻辑 composable
 * 消除所有页面重复的分页/搜索/加载状态
 */
import { ElMessage } from 'element-plus';
import { reactive, ref, type Ref, type ComputedRef } from 'vue';

interface PageQuery {
  pageNum: number;
  pageSize: number;
  [key: string]: unknown;
}

export function useListPage<T, Q extends PageQuery>(
  defaultQuery: Q,
  fetchFn: (query: Q) => Promise<void>,
  listRef: Ref<T[]> | ComputedRef<T[]>,
  totalRef: Ref<number> | ComputedRef<number>,
) {
  // 使用扩展运算符深拷贝，避免 reactive 共享引用
  const listQuery = reactive<Q>({ ...defaultQuery }) as Q;
  const loading = ref(false);

  const getList = async () => {
    loading.value = true;
    try {
      await fetchFn(listQuery);
    } catch (error) {
      console.error('获取列表失败:', error);
      ElMessage.error('获取列表失败');
    } finally {
      loading.value = false;
    }
  };

  /** 点击查询按钮：重置页码并刷新 */
  const handleSearch = () => {
    listQuery.pageNum = 1;
    getList();
  };

  /** 点击重置按钮：恢复默认查询条件（不自动触发查询） */
  const handleReset = () => {
    Object.assign(listQuery, defaultQuery);
  };

  /** 每页条数变化 */
  const handleSizeChange = (val: number) => {
    listQuery.pageNum = 1;
    listQuery.pageSize = val;
    getList();
  };

  /** 页码变化 */
  const handlePageChange = (val: number) => {
    listQuery.pageNum = val;
    getList();
  };

  return {
    listQuery,
    loading,
    list: listRef,
    total: totalRef,
    getList,
    handleSearch,
    handleReset,
    handleSizeChange,
    handlePageChange,
  };
}
