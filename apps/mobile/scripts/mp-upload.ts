/**
 * 小程序上传脚本
 * 支持微信小程序和支付宝小程序的自动上传
 *
 * 使用方式:
 *   pnpm tsx scripts/mp-upload.ts weixin upload    # 上传微信小程序
 *   pnpm tsx scripts/mp-upload.ts weixin preview   # 生成微信小程序预览二维码
 *   pnpm tsx scripts/mp-upload.ts alipay upload    # 上传支付宝小程序
 *
 * 环境变量:
 *   MP_VERSION          版本号（可选，默认读取 package.json）
 *   MP_DESC             版本描述（可选）
 *   MP_ROBOT            微信机器人编号 1-30（可选，默认基于分支名计算）
 *   WEIXIN_APPID        微信小程序 AppID
 *   WEIXIN_PRIVATE_KEY  微信小程序上传密钥（base64 编码）
 *   ALIPAY_APPID        支付宝小程序 AppID
 *   ALIPAY_PRIVATE_KEY  支付宝小程序私钥
 *   ALIPAY_TOOL_ID      支付宝小程序工具 ID
 *
 * 密钥获取:
 *   微信: 小程序后台 -> 开发管理 -> 开发设置 -> 小程序代码上传密钥
 *   支付宝: 开放平台 -> 开发设置 -> 开发工具密钥
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
  platform: 'weixin' | 'alipay';
  action: 'upload' | 'preview';
  version: string;
  description: string;
  robot?: number;
}

interface WeixinConfig {
  appid: string;
  privateKeyPath: string;
  projectPath: string;
}

interface AlipayConfig {
  appid: string;
  privateKey: string;
  toolId: string;
  projectPath: string;
}

// ==================== 常量 ====================

const ROOT_DIR = resolve(__dirname, '..');
const DIST_DIR = resolve(ROOT_DIR, 'dist/build');
const TEMP_DIR = resolve(ROOT_DIR, '.temp');

const BUILD_PATHS = {
  weixin: join(DIST_DIR, 'mp-weixin'),
  alipay: join(DIST_DIR, 'mp-alipay'),
};

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

function incrementVersion(version: string): string {
  const parts = version.split('.');
  if (parts.length !== 3) return `${version}.1`;
  const patch = parseInt(parts[2], 10) || 0;
  parts[2] = String(patch + 1);
  return parts.join('.');
}

function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split('.').map((n) => parseInt(n, 10) || 0);
  const parts2 = v2.split('.').map((n) => parseInt(n, 10) || 0);
  const maxLength = Math.max(parts1.length, parts2.length);
  for (let i = 0; i < maxLength; i++) {
    const num1 = parts1[i] || 0;
    const num2 = parts2[i] || 0;
    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }
  return 0;
}

function parseArgs(): UploadConfig {
  const args = process.argv.slice(2);
  const platform = args[0] as 'weixin' | 'alipay';
  const action = (args[1] || 'upload') as 'upload' | 'preview';
  const version = process.env.MP_VERSION || getPackageVersion();
  const description =
    process.env.MP_DESC ||
    process.env.GITHUB_SHA?.slice(0, 7) ||
    `v${version} - ${new Date().toLocaleString('zh-CN')}`;

  return {
    platform,
    action,
    version,
    description,
    robot: calculateRobot(),
  };
}

function validateEnv(platform: 'weixin' | 'alipay'): void {
  if (platform === 'weixin') {
    if (!process.env.WEIXIN_APPID)
      throw new Error('缺少环境变量: WEIXIN_APPID');
    if (!process.env.WEIXIN_PRIVATE_KEY)
      throw new Error('缺少环境变量: WEIXIN_PRIVATE_KEY');
  } else if (platform === 'alipay') {
    if (!process.env.ALIPAY_APPID)
      throw new Error('缺少环境变量: ALIPAY_APPID');
    if (!process.env.ALIPAY_PRIVATE_KEY)
      throw new Error('缺少环境变量: ALIPAY_PRIVATE_KEY');
    if (!process.env.ALIPAY_TOOL_ID)
      throw new Error('缺少环境变量: ALIPAY_TOOL_ID');
  }
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

function getWeixinConfig(): WeixinConfig {
  ensureTempDir();
  const privateKey = Buffer.from(
    process.env.WEIXIN_PRIVATE_KEY!,
    'base64',
  ).toString('utf-8');
  const privateKeyPath = resolve(TEMP_DIR, 'private.key');
  writeFileSync(privateKeyPath, privateKey);

  return {
    appid: process.env.WEIXIN_APPID!,
    privateKeyPath,
    projectPath: BUILD_PATHS.weixin,
  };
}

async function uploadWeixin(config: UploadConfig): Promise<void> {
  const { action, version, description, robot } = config;
  const weixinConfig = getWeixinConfig();

  if (!existsSync(weixinConfig.projectPath)) {
    throw new Error(
      `构建产物不存在: ${weixinConfig.projectPath}\n请先执行: pnpm build:mp-weixin`,
    );
  }

  log(`开始${action === 'upload' ? '上传' : '预览'}微信小程序...`);
  log(`AppID: ${weixinConfig.appid}`);
  log(`版本: ${version}`);
  log(`描述: ${description}`);
  log(`Robot: ${robot}`);

  const ci = await import('miniprogram-ci');

  const project = new ci.Project({
    appid: weixinConfig.appid,
    type: 'miniProgram',
    projectPath: weixinConfig.projectPath,
    privateKeyPath: weixinConfig.privateKeyPath,
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
    log('后续: 登录 https://mp.weixin.qq.com -> 管理 -> 版本管理', 'info');
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

// ==================== 支付宝小程序 ====================

function getAlipayConfig(): AlipayConfig {
  // GitHub Secrets 中 \n 是字面字符串，需转换为实际换行符
  const privateKey = process.env.ALIPAY_PRIVATE_KEY!.replace(/\\n/g, '\n');

  return {
    appid: process.env.ALIPAY_APPID!,
    privateKey,
    toolId: process.env.ALIPAY_TOOL_ID!,
    projectPath: BUILD_PATHS.alipay,
  };
}

/**
 * 上传支付宝小程序
 * 使用 minidev Node.js API（支付宝官方 CI 工具）
 * 文档: https://opendocs.alipay.com/mini/02q3an
 */
async function uploadAlipay(config: UploadConfig): Promise<void> {
  let { version } = config;
  const { description } = config;
  const alipayConfig = getAlipayConfig();

  if (!existsSync(alipayConfig.projectPath)) {
    throw new Error(
      `构建产物不存在: ${alipayConfig.projectPath}\n请先执行: pnpm build:mp-alipay`,
    );
  }

  log(`开始上传支付宝小程序...`);
  log(`AppID: ${alipayConfig.appid}`);
  log(`描述: ${description}`);

  const { minidev } = await import('minidev');

  // 注入授权信息
  await minidev.config.useRuntime({
    'alipay.authentication.privateKey': alipayConfig.privateKey,
    'alipay.authentication.toolId': alipayConfig.toolId,
  });

  // 版本冲突检测与自动递增
  try {
    log('检查版本冲突...', 'info');
    const existingVersion = await minidev.app.getUploadedVersion({
      appId: alipayConfig.appid,
    });

    if (existingVersion) {
      log(`当前最新上传版本: ${existingVersion}`, 'info');
      if (
        existingVersion === version ||
        compareVersions(version, existingVersion) <= 0
      ) {
        const newVersion = incrementVersion(existingVersion);
        log(`版本 ${version} 已存在或过旧，自动递增为: ${newVersion}`, 'warn');
        version = newVersion;
      }
    }
  } catch {
    log('无法获取现有版本信息，继续上传', 'warn');
  }

  log(`上传版本: ${version}`, 'info');

  const uploadResult = await withRetry(() =>
    minidev.upload(
      {
        appId: alipayConfig.appid,
        project: alipayConfig.projectPath,
        version,
        experience: true, // 自动设为体验版
        versionDescription: description,
      },
      {
        onLog: (data: string) => {
          log(data, 'info');
        },
      },
    ),
  );

  log(`支付宝小程序上传成功!`, 'success');
  log(`版本: ${(uploadResult as any)?.version || version}`, 'success');
  if ((uploadResult as any)?.experienceQrCodeUrl) {
    log(
      `体验版二维码: ${(uploadResult as any).experienceQrCodeUrl}`,
      'success',
    );
  }
  log('后续: 登录 https://open.alipay.com -> 小程序详情页，提交审核', 'info');
}

// ==================== 主函数 ====================

async function main() {
  const args = process.argv.slice(2);
  if (!args[0]) {
    console.log(`
使用方式:
  pnpm tsx scripts/mp-upload.ts <platform> [action]

参数:
  platform    weixin | alipay
  action      upload | preview（默认 upload）

示例:
  pnpm tsx scripts/mp-upload.ts weixin upload
  pnpm tsx scripts/mp-upload.ts weixin preview
  pnpm tsx scripts/mp-upload.ts alipay upload

环境变量:
  MP_VERSION             版本号（默认读取 package.json）
  MP_DESC                版本描述

微信小程序:
  WEIXIN_APPID           AppID
  WEIXIN_PRIVATE_KEY     上传密钥（base64 编码）

支付宝小程序:
  ALIPAY_APPID           AppID
  ALIPAY_PRIVATE_KEY     私钥
  ALIPAY_TOOL_ID         工具 ID
    `);
    process.exit(1);
  }

  const startTime = Date.now();
  try {
    const config = parseArgs();
    validateEnv(config.platform);

    if (config.platform === 'weixin') {
      await uploadWeixin(config);
    } else if (config.platform === 'alipay') {
      await uploadAlipay(config);
    } else {
      throw new Error(
        `不支持的平台: ${config.platform}，请使用 weixin 或 alipay`,
      );
    }

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
