import { ElMessage } from 'element-plus';
import { ref } from 'vue';
import type { AdminMenuVo, AdminMenuTreeNodeVo } from '@/api';
import { useMenuStore } from '@/store';

/**
 * 菜单树 Composable（懒加载 + 搜索双模式）
 */
export function useMenuTree() {
  const menuStore = useMenuStore();
  const listLoading = ref(false);

  // 懒加载模式数据
  const rootList = ref<(AdminMenuVo & { hasChildren: boolean })[]>([]);

  // 搜索模式数据
  const isSearchMode = ref(false);
  const fullTreeList = ref<AdminMenuTreeNodeVo[]>([]);
  const filteredTreeList = ref<AdminMenuTreeNodeVo[]>([]);

  // 获取顶层菜单列表（懒加载根节点）
  const getRootList = async () => {
    listLoading.value = true;
    try {
      await menuStore.getList({ parentId: 0, pageSize: 100, pageNum: 1 });
      rootList.value = menuStore.list.map((item) => ({
        ...item,
        hasChildren: true, // 顶层菜单可能有子节点
      }));
    } catch (error) {
      console.error('获取列表失败:', error);
      ElMessage.error('获取列表失败');
    } finally {
      listLoading.value = false;
    }
  };

  // 懒加载子菜单
  const loadChildren = async (
    row: AdminMenuVo,
    _treeNode: any,
    resolve: (data: any[]) => void,
  ) => {
    try {
      await menuStore.getList({ parentId: row.id, pageSize: 100, pageNum: 1 });
      const children = menuStore.list.map((item) => ({
        ...item,
        hasChildren: item.level === 0, // level=0 的子节点可能还有子节点
      }));
      resolve(children);
    } catch (error) {
      console.error('加载子菜单失败:', error);
      resolve([]);
    }
  };

  // 树过滤：保留匹配节点及其父链
  const filterTree = (
    tree: AdminMenuTreeNodeVo[],
    keyword: string,
  ): AdminMenuTreeNodeVo[] => {
    const result: AdminMenuTreeNodeVo[] = [];
    for (const node of tree) {
      const matchedChildren = node.children
        ? filterTree(node.children, keyword)
        : [];
      const selfMatch =
        node.title?.toLowerCase().includes(keyword.toLowerCase()) ||
        node.name?.toLowerCase().includes(keyword.toLowerCase());

      if (selfMatch || matchedChildren.length > 0) {
        result.push({
          ...node,
          children:
            matchedChildren.length > 0 ? matchedChildren : node.children,
        });
      }
    }
    return result;
  };

  // 搜索：加载全量树并过滤
  const handleSearch = async (keyword: string) => {
    const trimmedKeyword = keyword?.trim();
    if (!trimmedKeyword) {
      isSearchMode.value = false;
      await getRootList();
      return;
    }

    isSearchMode.value = true;
    listLoading.value = true;
    try {
      await menuStore.getTreeList();
      fullTreeList.value = menuStore.treeList as AdminMenuTreeNodeVo[];
      filteredTreeList.value = filterTree(fullTreeList.value, trimmedKeyword);
    } catch (error) {
      console.error('搜索失败:', error);
      ElMessage.error('搜索失败');
    } finally {
      listLoading.value = false;
    }
  };

  const handleReset = () => {
    isSearchMode.value = false;
    getRootList();
  };

  return {
    listLoading,
    isSearchMode,
    rootList,
    filteredTreeList,
    getRootList,
    loadChildren,
    handleSearch,
    handleReset,
  };
}
