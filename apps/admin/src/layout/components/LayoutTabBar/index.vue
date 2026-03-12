<template>
  <div class="layout-tab-bar">
    <el-scrollbar class="tab-scrollbar">
      <div ref="tabListRef" class="tab-list">
        <div
          v-for="tab in visitedViews"
          :key="tab.path"
          class="tab-item"
          :class="{ 'is-active': isActive(tab.path) }"
          @click="handleClickTab(tab)"
          @contextmenu.prevent="handleContextMenu($event, tab)"
        >
          <span class="tab-title">{{ tab.title }}</span>
          <el-icon
            v-if="!tab.affix"
            class="tab-close"
            @click.stop="handleCloseTab(tab)"
          >
            <Close />
          </el-icon>
        </div>
      </div>
    </el-scrollbar>

    <!-- 右键上下文菜单 -->
    <Teleport to="body">
      <ul
        v-show="contextMenu.visible"
        ref="contextMenuRef"
        class="tab-context-menu"
        :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
      >
        <li @click="handleRefresh">刷新当前</li>
        <li
          :class="{ 'is-disabled': contextMenu.tab?.affix }"
          @click="handleContextClose"
        >
          关闭当前
        </li>
        <li @click="handleCloseOthers">关闭其他</li>
        <li @click="handleCloseLeft">关闭左侧</li>
        <li @click="handleCloseRight">关闭右侧</li>
        <li @click="handleCloseAll">关闭全部</li>
      </ul>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { Close } from '@element-plus/icons-vue';
import { storeToRefs } from 'pinia';
import { nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTabViewStore } from '@/store';
import type { TabView } from '@/store/modules/tabView';

const route = useRoute();
const router = useRouter();
const tabViewStore = useTabViewStore();

const { visitedViews } = storeToRefs(tabViewStore);

const tabListRef = ref<HTMLElement>();

/** 判断 tab 是否激活 */
const isActive = (path: string) => route.path === path;

/** 点击 tab 跳转 */
const handleClickTab = (tab: TabView) => {
  if (!isActive(tab.path)) {
    router.push(tab.path);
  }
};

/** 关闭 tab */
const handleCloseTab = async (tab: TabView) => {
  const nextPath = tabViewStore.removeView(tab.path);
  // 关闭的是当前激活 tab，跳转到目标
  if (isActive(tab.path)) {
    router.push(nextPath);
  }
};

// ---- 右键菜单 ----
const contextMenuRef = ref<HTMLElement>();
const contextMenu = reactive({
  visible: false,
  x: 0,
  y: 0,
  tab: null as TabView | null,
});

const handleContextMenu = async (e: MouseEvent, tab: TabView) => {
  const { clientX, clientY } = e;
  // 先隐藏，设置 tab 和屏幕外坐标，让 DOM 渲染后读取菜单真实宽高
  contextMenu.visible = false;
  contextMenu.tab = tab;
  contextMenu.x = -9999;
  contextMenu.y = -9999;
  await nextTick();
  contextMenu.visible = true;
  await nextTick();
  if (!contextMenuRef.value) return;
  const { width, height } = contextMenuRef.value.getBoundingClientRect();
  contextMenu.x = Math.min(clientX, window.innerWidth - width - 4);
  contextMenu.y = Math.min(clientY, window.innerHeight - height - 4);
};

const closeContextMenu = () => {
  contextMenu.visible = false;
};

const handleRefresh = async () => {
  closeContextMenu();
  await tabViewStore.refreshView(route);
};

const handleContextClose = () => {
  const tab = contextMenu.tab;
  closeContextMenu();
  if (!tab || tab.affix) return;
  handleCloseTab(tab);
};

const handleCloseOthers = () => {
  const tab = contextMenu.tab;
  closeContextMenu();
  if (!tab) return;
  tabViewStore.removeOthers(tab.path);
  if (!isActive(tab.path)) {
    router.push(tab.path);
  }
};

const handleCloseLeft = () => {
  const tab = contextMenu.tab;
  closeContextMenu();
  if (!tab) return;
  tabViewStore.removeLeft(tab.path);
  if (
    !isActive(tab.path) &&
    !visitedViews.value.find((v) => v.path === route.path)
  ) {
    router.push(tab.path);
  }
};

const handleCloseRight = () => {
  const tab = contextMenu.tab;
  closeContextMenu();
  if (!tab) return;
  tabViewStore.removeRight(tab.path);
  if (
    !isActive(tab.path) &&
    !visitedViews.value.find((v) => v.path === route.path)
  ) {
    router.push(tab.path);
  }
};

const handleCloseAll = () => {
  closeContextMenu();
  const nextPath = tabViewStore.removeAll();
  if (route.path !== nextPath) {
    router.push(nextPath);
  }
};

/** 点击 contextMenu 外部关闭 */
const handleClickOutside = (e: MouseEvent) => {
  if (
    contextMenuRef.value &&
    !contextMenuRef.value.contains(e.target as Node)
  ) {
    closeContextMenu();
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

// ---- 激活 tab 滚动到视口（居中） ----
const scrollToActive = () => {
  nextTick(() => {
    if (!tabListRef.value) return;
    const activeEl = tabListRef.value.querySelector(
      '.tab-item.is-active',
    ) as HTMLElement;
    activeEl?.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    });
  });
};

watch(() => route.path, scrollToActive);
</script>

<style scoped lang="scss">
// TabBar 整体用 colorBgLayout（比 colorBgContainer 深一级），
// 激活 tab 用 colorBgContainer（白色/亮色），形成明显对比
.layout-tab-bar {
  display: flex;
  flex-shrink: 0;
  align-items: flex-end; // tab 底部对齐，让顶部线更突出
  height: 36px;
  padding: 0 4px;
  border-bottom: 1px solid var(--colorBorderSecondary);
  background-color: var(--colorBgLayout);
}

.tab-scrollbar {
  flex: 1;
  height: 36px;

  :deep(.el-scrollbar__wrap) {
    display: flex;
    align-items: flex-end;
  }

  :deep(.el-scrollbar__bar.is-horizontal) {
    height: 2px;
  }
}

.tab-list {
  display: flex;
  align-items: flex-end;
  height: 36px;
  gap: 2px;
  white-space: nowrap;
}

.tab-item {
  display: inline-flex;
  align-items: center;
  height: 28px;
  padding: 0 12px;
  transition:
    background-color 0.15s,
    color 0.15s,
    border-color 0.15s;
  border-top: 2px solid transparent;
  border-right: 1px solid transparent;
  border-left: 1px solid transparent;
  border-radius: 4px 4px 0 0; // 顶部圆角，底部贴边
  background-color: transparent;
  color: var(--colorTextTertiary);
  font-size: 13px;
  cursor: pointer;
  user-select: none;
  gap: 5px;

  &:hover {
    background-color: var(--colorFillSecondary);
    color: var(--colorText);

    .tab-close {
      opacity: 1;
    }
  }

  &.is-active {
    border-top-color: var(--colorPrimary);
    border-right-color: var(--colorBorderSecondary);
    border-left-color: var(--colorBorderSecondary);
    background-color: var(--colorBgContainer);
    color: var(--colorPrimary);
    font-weight: 500;

    .tab-close {
      opacity: 1;
    }
  }
}

.tab-close {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  transition:
    opacity 0.15s,
    background-color 0.15s;
  border-radius: 50%;
  opacity: 0;
  font-size: 12px;

  &:hover {
    background-color: var(--colorFill);
    color: var(--colorTextSecondary);
  }
}

// 右键菜单
.tab-context-menu {
  position: fixed;
  z-index: 9999;
  min-width: 130px;
  margin: 0;
  padding: 4px 0;
  border: 1px solid var(--colorBorderSecondary);
  border-radius: 6px;
  background-color: var(--colorBgElevated);
  box-shadow: var(--boxShadow);
  list-style: none;

  li {
    padding: 7px 16px;
    transition: background-color 0.15s;
    color: var(--colorText);
    font-size: 13px;
    cursor: pointer;

    &:hover {
      background-color: var(--colorBgTextHover);
    }

    &.is-disabled {
      color: var(--colorTextDisabled);
      cursor: not-allowed;
      pointer-events: none;
    }
  }
}
</style>
