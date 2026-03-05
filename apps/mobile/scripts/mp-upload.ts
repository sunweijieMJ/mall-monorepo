/**
 * 微信小程序上传脚本
 * 支持上传体验版和生成预览二维码
 *
 * 使用方式:
 *   pnpm mp:upload:weixin          # 上传到体验版
 *   pnpm mp:preview:weixin         # 生成预览二维码
 *
 * 环境变量:
 *   MP_VERSION          版本号（可选，默认读取 package.json）
 *   MP_DESC             版本描述（可选）
 *   MP_ROBOT            微信机器人编号 1-30（可选，默认基于分支名计算）
 *   WEIXIN_APPID        微信小程序 AppID
 *   WEIXIN_PRIVATE_KEY  微信小程序上传密钥（base64 编码）
 *
 * 密钥获取:
 *   小程序后台 -> 开发管理 -> 开发设置 -> 小程序代码上传密钥
 *
 * Robot 分配规则:
 *   main/master: 1 | develop/dev: 2 | staging: 3 | test: 4
 *   其他分支: 5-30（基于分支名哈希）
 */

import { existsSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { readFileSync } from 'node:fs';
import { resolve, join } from 'node:path';

// ==================== 类型定义 ====================

interface UploadConfig {
  platform: 'weixin';
  action: 'upload' | 'preview';
  version: string;
  description: string;
  robot?: number;
}

// ==================== 常量 ====================

const ROOT_DIR = resolve(import.meta.dirname, '..');
const DIST_DIR = resolve(ROOT_DIR, 'dist/build');
const TEMP_DIR = resolve(ROOT_DIR, '.temp');
const WEIXIN_BUILD_PATH = join(DIST_DIR, 'mp-weixin');

// ==================== 工具函数 ====================

function log(
  message: string,
  type: 'info' | 'success' | 'error' | 'warn' = 'info',
) {
  const colors = {
    info: '\x1b[36m',
    success: '\x1b[32m',
    error: '\x1b[31m',
    warn: '\x1b[33m',
  };
  const prefix = { info: 'ℹ', success: '✓', error: '✗', warn: '⚠' };
  console.log(`${colors[type]}${prefix[type]} ${message}\x1b[0m`);
}

function getPackageVersion(): string {
  const packagePath = resolve(ROOT_DIR, 'package.json');
  return JSON.parse(readFileSync(packagePath, 'utf-8')).version;
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function calculateRobot(): number {
  if (process.env.MP_ROBOT) {
    const robot = parseInt(process.env.MP_ROBOT, 10);
    if (robot >= 1 && robot <= 30) return robot;
  }

  const branch =
    process.env.GITHUB_REF_NAME || process.env.GITHUB_HEAD_REF || 'local';

  const fixedMap: Record<string, number> = {
    main: 1,
    master: 1,
    develop: 2,
    dev: 2,
    staging: 3,
    test: 4,
  };

  return fixedMap[branch] ?? (hashString(branch) % 26) + 5;
}

function parseArgs(): UploadConfig {
  const args = process.argv.slice(2);
  const action = (args[1] || 'upload') as 'upload' | 'preview';
  const version = process.env.MP_VERSION || getPackageVersion();
  const description =
    process.env.MP_DESC ||
    process.env.GITHUB_SHA?.slice(0, 7) ||
    `v${version} - ${new Date().toLocaleString('zh-CN')}`;

  return {
    platform: 'weixin',
    action,
    version,
    description,
    robot: calculateRobot(),
  };
}

function validateEnv(): void {
  if (!process.env.WEIXIN_APPID) throw new Error('缺少环境变量: WEIXIN_APPID');
  if (!process.env.WEIXIN_PRIVATE_KEY)
    throw new Error('缺少环境变量: WEIXIN_PRIVATE_KEY');
}

function ensureTempDir(): void {
  if (!existsSync(TEMP_DIR)) mkdirSync(TEMP_DIR, { recursive: true });
}

function cleanupTempFiles(): void {
  const keyPath = resolve(TEMP_DIR, 'private.key');
  if (existsSync(keyPath)) rmSync(keyPath);
}

async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 5000,
): Promise<T> {
  let lastError: Error | undefined;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < retries) {
        log(
          `操作失败，${delay / 1000}s 后重试 (${attempt}/${retries}): ${lastError.message}`,
          'warn',
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
}

// ==================== 微信小程序 ====================

async function uploadWeixin(config: UploadConfig): Promise<void> {
  const { action, version, description, robot } = config;

  if (!existsSync(WEIXIN_BUILD_PATH)) {
    throw new Error(
      `构建产物不存在: ${WEIXIN_BUILD_PATH}\n请先执行: pnpm build:mp-weixin`,
    );
  }

  ensureTempDir();
  const privateKey = Buffer.from(
    process.env.WEIXIN_PRIVATE_KEY!,
    'base64',
  ).toString('utf-8');
  const privateKeyPath = resolve(TEMP_DIR, 'private.key');
  writeFileSync(privateKeyPath, privateKey);

  log(`开始${action === 'upload' ? '上传' : '预览'}微信小程序...`);
  log(`AppID: ${process.env.WEIXIN_APPID}`);
  log(`版本: ${version}`);
  log(`描述: ${description}`);
  log(`Robot: ${robot}`);

  const ci = await import('miniprogram-ci');

  const project = new ci.Project({
    appid: process.env.WEIXIN_APPID!,
    type: 'miniProgram',
    projectPath: WEIXIN_BUILD_PATH,
    privateKeyPath,
    ignores: ['node_modules/**/*'],
  });

  if (action === 'upload') {
    await withRetry(() =>
      ci.upload({
        project,
        version,
        desc: description,
        robot,
        threads: 4,
        setting: {
          es6: true,
          es7: true,
          minify: true,
          autoPrefixWXSS: true,
          minifyWXML: true,
          minifyWXSS: true,
          minifyJS: true,
          codeProtect: true,
        },
        onProgressUpdate: (progress: any) => {
          if (progress._status === 'done') log(`上传进度: ${progress._msg}`);
        },
      }),
    );
    log(`微信小程序上传成功! 版本: ${version}`, 'success');
    log('后续操作: 登录 https://mp.weixin.qq.com -> 管理 -> 版本管理', 'info');
  } else {
    const qrcodePath = resolve(TEMP_DIR, 'preview-qrcode.png');
    await ci.preview({
      project,
      version,
      desc: description,
      robot,
      qrcodeFormat: 'image',
      qrcodeOutputDest: qrcodePath,
      setting: { es6: true, es7: true, minify: true },
      onProgressUpdate: (progress: any) => {
        if (progress._status === 'done') log(`预览进度: ${progress._msg}`);
      },
    });
    log(`预览二维码已保存: ${qrcodePath}`, 'success');
  }
}

// ==================== 主函数 ====================

async function main() {
  const args = process.argv.slice(2);
  if (!args[0]) {
    console.log(`
使用方式:
  pnpm tsx scripts/mp-upload.ts weixin [action]

参数:
  action    upload | preview（默认 upload）

示例:
  pnpm tsx scripts/mp-upload.ts weixin upload
  pnpm tsx scripts/mp-upload.ts weixin preview
    `);
    process.exit(1);
  }

  const startTime = Date.now();
  try {
    validateEnv();
    const config = parseArgs();
    await uploadWeixin(config);
    log(`总耗时: ${((Date.now() - startTime) / 1000).toFixed(2)}s`, 'success');
  } catch (error) {
    log(`上传失败: ${error instanceof Error ? error.message : error}`, 'error');
    if (error instanceof Error && error.stack) console.error(error.stack);
    process.exit(1);
  } finally {
    cleanupTempFiles();
  }
}

main();
