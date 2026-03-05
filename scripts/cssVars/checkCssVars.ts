import fs from 'fs';
import chalk from 'chalk';
import { globSync } from 'glob';

// 忽略的文件或目录
const ignorePatterns: string[] = [
  'node_modules/**',
  'dist/**',
  'dist-electron/**',
  'build/**',
  'public/**',
  'deploy/**',
  '**/*.css',
];

// 颜色模式检测
const colorPattern = /#[0-9a-fA-F]{3,8}|(?:rgb|rgba|hsl|hsla)\([^)]+\)/g;

// 主函数
async function checkCssVars() {
  try {
    // 查找所有样式文件和 JavaScript/TypeScript 文件
    const files = globSync('**/*.{scss,less,js,ts,jsx,tsx}', {
      ignore: ignorePatterns,
      nodir: true,
    });

    const fileIssues = files.reduce(
      (acc, file) => {
        const content = fs.readFileSync(file, 'utf-8');
        const lines = content.split('\n');
        const matches = content.matchAll(colorPattern);
        const issues = Array.from(matches)
          .filter(match => match.index !== undefined && !isColorInCommentByIndex(content, lines, match.index))
          .map(match => getPositionByIndex(content, match.index!));

        if (issues.length) acc.push({ file, issues });
        return acc;
      },
      [] as { file: string; issues: { value: string; line: number; column: number }[] }[],
    );

    const totalIssues = fileIssues.reduce((sum, { issues }) => sum + issues.length, 0);

    if (totalIssues > 0) {
      console.log(chalk.bold('\n🔍 样式检查结果:\n'));
      fileIssues.forEach(({ file, issues }) => {
        issues.forEach(({ value, line, column }) => {
          console.log(
            `${chalk.cyan(`${file}:${line}:${column}`)}`,
            `\n  ${chalk.red('✖')} ${chalk.gray('硬编码颜色值:')} ${chalk.yellow(value)}\n`,
          );
        });
      });
      console.log(chalk.red(`\n✖ 发现 ${totalIssues} 个问题，请使用 CSS 变量替代硬编码的颜色值\n`));
      process.exit(1);
    }

    console.log(chalk.green('\n✓ 没有发现硬编码的颜色值\n'));
  } catch (error) {
    console.error(chalk.red('\n✖ 验证过程中发生错误：'), chalk.red((error as Error).message), '\n');
    process.exit(1);
  }
}

// 根据字符索引判断是否在注释中
function isColorInCommentByIndex(content: string, lines: string[], index: number): boolean {
  // 计算所在行号
  let remaining = index;
  for (const line of lines) {
    if (remaining <= line.length) {
      const col = remaining;
      const trimmedLine = line.trim();
      if (
        trimmedLine.startsWith('//') ||
        trimmedLine.startsWith('/*') ||
        trimmedLine.startsWith('*')
      ) {
        return true;
      }
      const lineCommentIdx = line.indexOf('//');
      const blockCommentIdx = line.indexOf('/*');
      const commentIdx = Math.min(
        lineCommentIdx === -1 ? Infinity : lineCommentIdx,
        blockCommentIdx === -1 ? Infinity : blockCommentIdx,
      );
      return commentIdx !== Infinity && col > commentIdx;
    }
    remaining -= line.length + 1; // +1 for '\n'
  }
  return false;
}

// 根据字符索引获取行号、列号和颜色值
function getPositionByIndex(
  content: string,
  index: number,
): { value: string; line: number; column: number } {
  const before = content.slice(0, index);
  const line = (before.match(/\n/g) ?? []).length + 1;
  const lastNewline = before.lastIndexOf('\n');
  const column = index - lastNewline; // 1-based
  const match = content.slice(index).match(colorPattern);
  const value = match ? match[0] : '';
  return { value, line, column };
}

checkCssVars();
