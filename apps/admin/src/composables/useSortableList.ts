import { ElMessage } from 'element-plus';
import Sortable from 'sortablejs';
import { ref, onBeforeUnmount, type Ref } from 'vue';

/**
 * 拖拽排序 Composable
 */
export function useSortableList<T extends { id: number }>(
  listRef: Ref<T[]>,
  updateSortFn: (id: number, sort: number) => Promise<void>,
) {
  const sortableInstance = ref<Sortable | null>(null);

  const initSortable = (el: HTMLElement) => {
    if (sortableInstance.value) {
      sortableInstance.value.destroy();
      sortableInstance.value = null;
    }

    sortableInstance.value = Sortable.create(el, {
      handle: '.drag-handle',
      animation: 200,
      onEnd: async (evt) => {
        if (evt.oldIndex === evt.newIndex) return;

        const oldIndex = evt.oldIndex!;
        const newIndex = evt.newIndex!;

        // 更新本地列表顺序
        const movedItem = listRef.value.splice(oldIndex, 1)[0];
        listRef.value.splice(newIndex, 0, movedItem);

        // 只更新受影响区间内的 sort 值
        const start = Math.min(oldIndex, newIndex);
        const end = Math.max(oldIndex, newIndex);
        try {
          const promises = listRef.value
            .slice(start, end + 1)
            .map((item, i) => updateSortFn(item.id, start + i));
          await Promise.all(promises);
          ElMessage.success('排序已更新');
        } catch (error) {
          console.error('排序更新失败:', error);
          ElMessage.error('排序更新失败');
        }
      },
    });
  };

  const destroy = () => {
    if (sortableInstance.value) {
      sortableInstance.value.destroy();
      sortableInstance.value = null;
    }
  };

  onBeforeUnmount(() => {
    destroy();
  });

  return { initSortable, destroy };
}
