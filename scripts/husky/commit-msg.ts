import { execSync } from 'child_process';
import chalk from 'chalk';

// 获取提交信息文件路径
const COMMIT_MESSAGE_FILE = process.argv[2];
if (!COMMIT_MESSAGE_FILE) {
  console.error(chalk.red('❌ 没有提供 commit message 文件路径'));
  process.exit(1);
}

try {
  execSync(`pnpm exec commitlint --edit ${COMMIT_MESSAGE_FILE}`, {
    stdio: 'inherit',
  });
  console.log(chalk.green('✅ Commitlint 检查通过'));
} catch {
  console.error(
    `${chalk.red('❌ Commitlint 校验失败')}\n${chalk.blue('提示：请确保提交信息符合规范，示例: feat: 添加用户登录功能')}`,
  );
  process.exit(1);
}
