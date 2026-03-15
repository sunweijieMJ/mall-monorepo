/**
 * 图标名称 → 组件映射表
 * 后端菜单返回 icon 字符串（如 "Goods"），通过此映射转为 Element Plus 图标组件
 * 使用 markRaw 包裹避免 Vue 将组件转为响应式代理导致警告
 */

import {
  Avatar,
  ChatDotRound,
  CirclePlus,
  Collection,
  DataAnalysis,
  Discount,
  Document,
  Goods,
  Grid,
  HomeFilled,
  Lightning,
  List,
  Lock,
  MagicStick,
  Medal,
  Menu,
  Notebook,
  PictureFilled,
  RefreshLeft,
  SetUp,
  Setting,
  Star,
  TrendCharts,
  UserFilled,
} from '@element-plus/icons-vue';
import { markRaw, type Component } from 'vue';

const iconMap: Record<string, Component> = {
  Avatar: markRaw(Avatar),
  ChatDotRound: markRaw(ChatDotRound),
  CirclePlus: markRaw(CirclePlus),
  Collection: markRaw(Collection),
  DataAnalysis: markRaw(DataAnalysis),
  Discount: markRaw(Discount),
  Document: markRaw(Document),
  Goods: markRaw(Goods),
  Grid: markRaw(Grid),
  HomeFilled: markRaw(HomeFilled),
  Lightning: markRaw(Lightning),
  List: markRaw(List),
  Lock: markRaw(Lock),
  MagicStick: markRaw(MagicStick),
  Medal: markRaw(Medal),
  Menu: markRaw(Menu),
  Notebook: markRaw(Notebook),
  PictureFilled: markRaw(PictureFilled),
  RefreshLeft: markRaw(RefreshLeft),
  SetUp: markRaw(SetUp),
  Setting: markRaw(Setting),
  Star: markRaw(Star),
  TrendCharts: markRaw(TrendCharts),
  UserFilled: markRaw(UserFilled),
};

/**
 * 根据图标名称获取对应的组件
 */
export function resolveIcon(name?: string | null): Component | undefined {
  if (!name) return undefined;
  return iconMap[name];
}

export default iconMap;
