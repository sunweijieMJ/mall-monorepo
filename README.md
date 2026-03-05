# mall-monorepo

> 基于 `pnpm Workspace` + `Turborepo` 构建的商城全栈 Monorepo 工程，包含移动端、管理后台、后端服务等多个子项目，共享统一的代码规范与工程配置。

## 目录结构

```
├── apps/                        # 应用（不发布到 npm）
│   ├── admin/                   #   管理后台
│   ├── mobile/                  #   移动端（客户端）
│   └── server/                  #   后端 API 服务
│
├── packages/                    # 共享包
│
├── internal/                    # 内部共享配置（不发布）
│   ├── eslint-config/           #   ESLint 共享配置 (@kit/eslint-config)
│   ├── stylelint-config/        #   Stylelint 共享配置 (@kit/stylelint-config)
│   └── typescript-config/       #   TypeScript 共享配置 (@kit/typescript-config)
│
├── scripts/                     # 工程脚本
│   ├── cssVars/                 #   CSS 变量检查脚本
│   └── husky/                   #   Git Hooks 脚本
│
├── typings/                     # 全局 TypeScript 类型声明
│
├── commitlint.config.ts         # Git 提交信息规范配置
├── eslint.config.ts             # ESLint 代码检查配置
├── prettier.config.js           # Prettier 代码格式化配置
├── stylelint.config.mjs         # Stylelint 样式检查配置
├── turbo.json                   # Turborepo 任务编排配置
├── tsconfig.json                # TypeScript 根配置
├── vitest.config.ts             # Vitest 测试框架配置
├── vitest.setup.ts              # Vitest 测试环境初始化
├── pnpm-workspace.yaml          # pnpm Workspace 配置
└── package.json                 # 根 package.json
```

## 开发环境

<p align="left">
  <img src="https://img.shields.io/badge/node-%3E%3D22-green" alt="node">
  <img src="https://img.shields.io/badge/pnpm-%3E%3D10.14.0-blue" alt="pnpm">
</p>

### 环境准备

- 全局安装 `pnpm`

  ```bash
  npm i pnpm -g
  ```

- 安装依赖

  ```bash
  pnpm i
  ```

### 推荐 VSCode 插件

- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Stylelint](https://marketplace.visualstudio.com/items?itemName=stylelint.vscode-stylelint)
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## 常用脚本

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 启动所有子项目开发服务 |
| `pnpm build` | 构建所有子项目 |
| `pnpm test` | 运行所有单元测试 |
| `pnpm lint` | 代码检查（ESLint + Stylelint） |
| `pnpm type-check` | TypeScript 类型检查 |
| `pnpm format` | Prettier 格式化代码 |
| `pnpm cspell` | 拼写检查 |
| `pnpm commit` | 使用交互式 CLI 提交代码 |

## 内部配置包

| 包名 | 路径 | 说明 |
|------|------|------|
| `@kit/eslint-config` | `internal/eslint-config` | 提供 `base` / `admin` / `mobile` / `backend` 四套 ESLint 配置 |
| `@kit/stylelint-config` | `internal/stylelint-config` | 提供 `base` / `vue-app` 两套 Stylelint 配置 |
| `@kit/typescript-config` | `internal/typescript-config` | 提供 `base` / `base-app` / `base-admin` / `base-mobile` / `base-backend` 多套 TS 配置 |

## Git 提交规范

使用 `commitizen` + `commitlint` 约束提交信息格式：

```
type(scope): subject
```

推荐使用交互式命令提交：

```bash
pnpm commit
```

### 提交前自动检查

每次 `git commit` 前，husky 会自动执行：

1. `lint-staged` — 对暂存文件进行 ESLint / Stylelint / Prettier 检查
2. `type-check` — TypeScript 类型检查
3. `test` — 单元测试
