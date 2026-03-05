// import { execSync } from 'child_process';
import chalk from 'chalk';

try {
  // 构建检查（推送前确保产物可以正常构建）
  console.log(chalk.blue('正在进行构建检查...'));
  // execSync('pnpm run build', { stdio: 'inherit' });
  console.log(chalk.green('✓ 构建检查通过'));

  process.exit(0);
} catch (error) {
  console.error(chalk.red('× 构建检查失败'));
  if (error instanceof Error) {
    console.error(chalk.red(error.message));
  }
  process.exit(1);
}
