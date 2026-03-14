/**
 * 解析 public/theme.css 生成主题 token TypeScript 文件
 * 用法: pnpm theme:parse
 */
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const THEME_CSS_PATH = resolve(import.meta.dirname, '../public/theme.css');
const OUTPUT_PATH = resolve(
  import.meta.dirname,
  '../src/utils/theme/theme-tokens.ts',
);

function extractVars(
  cssText: string,
  selector: string,
): Record<string, string> {
  const selectorEscaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const blockRegex = new RegExp(
    `${selectorEscaped}\\s*\\{([^}]+(?:\\{[^}]*\\}[^}]*)*)\\}`,
    's',
  );

  const match = cssText.match(blockRegex);
  const blockContent = match ? match[1] : '';

  const vars: Record<string, string> = {};
  const varRegex = /--([a-zA-Z0-9-]+)\s*:\s*([^;]+);/g;
  let m;
  while ((m = varRegex.exec(blockContent)) !== null) {
    vars[m[1]] = m[2].trim();
  }

  return vars;
}

function main() {
  const cssText = readFileSync(THEME_CSS_PATH, 'utf-8');

  const lightVars = extractVars(cssText, ':root');
  const darkVars = extractVars(cssText, ":root[theme='dark']");

  const lightCount = Object.keys(lightVars).length;
  const darkCount = Object.keys(darkVars).length;

  const output = `/**
 * 此文件由 scripts/parse-theme.ts 自动生成，请勿手动修改
 * 运行 pnpm theme:parse 重新生成
 * @generated ${new Date().toISOString()}
 */

/** Light 主题默认 token */
export const themeLight: Record<string, string> = ${JSON.stringify(lightVars, null, 2)};

/** Dark 主题默认 token */
export const themeDark: Record<string, string> = ${JSON.stringify(darkVars, null, 2)};

/** 所有主题 token */
export const themeTokens = {
  light: themeLight,
  dark: themeDark,
} as const;
`;

  writeFileSync(OUTPUT_PATH, output, 'utf-8');
  console.log(`✅ 主题 token 生成完成`);
  console.log(`   Light: ${lightCount} 个变量`);
  console.log(`   Dark: ${darkCount} 个变量`);
  console.log(`   输出: ${OUTPUT_PATH}`);
}

main();
