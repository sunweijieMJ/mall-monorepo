import { themeTokens } from './theme-tokens';
import type { ThemeStyleKey } from '@/interface/system';

export interface ColorCategory {
  key: string;
  label: string;
  vars: string[];
}

export interface PaletteSubGroup {
  key: string;
  label: string;
  prefix: string;
}

export type ThemeVars = Record<string, string>;

export interface ThemeData {
  light: ThemeVars;
  dark: ThemeVars;
}

/**
 * 获取指定主题的默认 token
 */
export function getDefaultThemeVars(theme: ThemeStyleKey): ThemeVars {
  return { ...themeTokens[theme] };
}

/**
 * 获取所有 CSS 变量名列表（以 light 主题为基准）
 */
export function getAllVarNames(): string[] {
  return Object.keys(themeTokens.light);
}

/**
 * camelCase 变量名 → CSS 变量名 (--colorPrimary)
 */
export function toCSSVarName(name: string): string {
  return `--${name}`;
}

/** 调色板色系子分组 */
export const paletteSubGroups: PaletteSubGroup[] = [
  { key: 'cyan', label: 'Cyan', prefix: 'cyan-' },
  { key: 'blue', label: 'Blue', prefix: 'blue-' },
  { key: 'purple', label: 'Purple', prefix: 'purple-' },
  { key: 'green', label: 'Green', prefix: 'green-' },
  { key: 'magenta', label: 'Magenta', prefix: 'magenta-' },
  { key: 'red', label: 'Red', prefix: 'red-' },
  { key: 'orange', label: 'Orange', prefix: 'orange-' },
  { key: 'yellow', label: 'Yellow', prefix: 'yellow-' },
  { key: 'volcano', label: 'Volcano', prefix: 'volcano-' },
  { key: 'geekblue', label: 'GeekBlue', prefix: 'geekblue-' },
  { key: 'lime', label: 'Lime', prefix: 'lime-' },
  { key: 'gold', label: 'Gold', prefix: 'gold-' },
];

/** 调色板前缀列表 */
const paletteColorPrefixes = paletteSubGroups.map((g) => g.prefix);

/** 功能色分类定义 */
const filterCategories: {
  key: string;
  label: string;
  filter: (name: string) => boolean;
}[] = [
  {
    key: 'primary',
    label: '主色',
    filter: (n) => n.toLowerCase().includes('primary'),
  },
  {
    key: 'success',
    label: '成功色',
    filter: (n) => n.toLowerCase().includes('success'),
  },
  {
    key: 'warning',
    label: '警告色',
    filter: (n) => n.toLowerCase().includes('warning'),
  },
  {
    key: 'error',
    label: '错误色',
    filter: (n) => n.toLowerCase().includes('error'),
  },
  {
    key: 'text',
    label: '文本颜色',
    filter: (n) => n.toLowerCase().includes('text'),
  },
  {
    key: 'bg',
    label: '背景颜色',
    filter: (n) => n.toLowerCase().includes('bg'),
  },
  {
    key: 'border',
    label: '边框颜色',
    filter: (n) => {
      const l = n.toLowerCase();
      return l.includes('border') || l.includes('split');
    },
  },
  {
    key: 'fill',
    label: '填充颜色',
    filter: (n) => n.toLowerCase().includes('fill'),
  },
  {
    key: 'control',
    label: '控件颜色',
    filter: (n) => n.toLowerCase().includes('controlitem'),
  },
  {
    key: 'link',
    label: '链接颜色',
    filter: (n) => n.toLowerCase().includes('link'),
  },
  {
    key: 'icon',
    label: '图标颜色',
    filter: (n) => n.toLowerCase().includes('icon'),
  },
  {
    key: 'palette',
    label: '调色板',
    filter: (n) =>
      paletteColorPrefixes.some((p) => n.toLowerCase().startsWith(p)),
  },
];

/**
 * 将变量按分类归组
 */
export function getColorCategories(): ColorCategory[] {
  const allVars = getAllVarNames();
  const usedVars = new Set<string>();
  const categories: ColorCategory[] = [];

  for (const category of filterCategories) {
    const vars = allVars.filter((v) => {
      if (usedVars.has(v)) return false;
      return category.filter(v);
    });
    vars.forEach((v) => usedVars.add(v));
    if (vars.length > 0) {
      categories.push({ key: category.key, label: category.label, vars });
    }
  }

  // 未分类的放入"其他"
  const otherVars = allVars.filter((v) => !usedVars.has(v));
  if (otherVars.length > 0) {
    categories.push({ key: 'others', label: '其他', vars: otherVars });
  }

  return categories;
}

/**
 * 判断字符串是否为颜色值
 */
export function isColorValue(value: string): boolean {
  const trimmed = value.trim();
  if (/^#([0-9a-f]{3,8})$/i.test(trimmed)) return true;
  if (/^(rgb|rgba|hsl|hsla)\s*\(/.test(trimmed)) return true;
  return false;
}

/**
 * rgb(r g b / a) 转 hex，用于 ColorPicker 显示
 */
export function rgbToHex(rgb: string): string {
  const match = rgb.match(
    /rgb\(\s*(\d+)\s+(\d+)\s+(\d+)(?:\s*\/\s*([\d.]+))?\s*\)/,
  );
  if (!match) return rgb;

  const r = parseInt(match[1]);
  const g = parseInt(match[2]);
  const b = parseInt(match[3]);
  const a = match[4] !== undefined ? parseFloat(match[4]) : 1;

  const toHex = (n: number) => n.toString(16).padStart(2, '0');

  if (a < 1) {
    const alpha = Math.round(a * 255);
    return `#${toHex(r)}${toHex(g)}${toHex(b)}${toHex(alpha)}`;
  }

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * hex 转 rgb(r g b / a) 格式
 */
export function hexToRgb(hex: string): string {
  const cleaned = hex.replace('#', '');
  let r: number,
    g: number,
    b: number,
    a = 1;

  if (cleaned.length === 3) {
    r = parseInt(cleaned[0] + cleaned[0], 16);
    g = parseInt(cleaned[1] + cleaned[1], 16);
    b = parseInt(cleaned[2] + cleaned[2], 16);
  } else if (cleaned.length === 6) {
    r = parseInt(cleaned.slice(0, 2), 16);
    g = parseInt(cleaned.slice(2, 4), 16);
    b = parseInt(cleaned.slice(4, 6), 16);
  } else if (cleaned.length === 8) {
    r = parseInt(cleaned.slice(0, 2), 16);
    g = parseInt(cleaned.slice(2, 4), 16);
    b = parseInt(cleaned.slice(4, 6), 16);
    a = parseInt(cleaned.slice(6, 8), 16) / 255;
  } else {
    return hex;
  }

  if (a < 1) {
    return `rgb(${r} ${g} ${b} / ${parseFloat(a.toFixed(2))})`;
  }
  return `rgb(${r} ${g} ${b} / 1)`;
}

/**
 * 生成格式化的 CSS 字符串
 */
export function generateThemeCSS(
  vars: ThemeVars,
  theme: ThemeStyleKey,
): string {
  const selector = theme === 'dark' ? ":root[theme='dark']" : ':root';
  const categories = getColorCategories();
  const lines: string[] = [`${selector} {`];

  for (const category of categories) {
    lines.push(`  /* ${category.label} */`);
    for (const varName of category.vars) {
      if (vars[varName] !== undefined) {
        lines.push(`  --${varName}: ${vars[varName]};`);
      }
    }
    lines.push('');
  }

  lines.push('}');
  return lines.join('\n');
}

/**
 * 从 CSS 文本中反解析变量
 */
export function extractVarsFromCSS(cssText: string): ThemeVars {
  const vars: ThemeVars = {};
  const regex = /--([a-zA-Z0-9-]+)\s*:\s*([^;]+);/g;
  let match;
  while ((match = regex.exec(cssText)) !== null) {
    vars[match[1]] = match[2].trim();
  }
  return vars;
}

/**
 * 将自定义主题变量应用到 DOM
 */
export function applyThemeVarsToDOM(vars: ThemeVars): void {
  const root = document.documentElement;
  for (const [name, value] of Object.entries(vars)) {
    root.style.setProperty(toCSSVarName(name), value);
  }
}

/**
 * 清除所有自定义主题变量
 */
export function clearCustomThemeVars(vars: ThemeVars): void {
  const root = document.documentElement;
  for (const name of Object.keys(vars)) {
    root.style.removeProperty(toCSSVarName(name));
  }
}

export { themeTokens } from './theme-tokens';
