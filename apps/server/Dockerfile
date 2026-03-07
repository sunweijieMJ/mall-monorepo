# Mall Server - 多阶段 Dockerfile（适配 pnpm monorepo）
#
# 构建上下文: monorepo 根目录
# 用法:
#   docker build -f apps/server/Dockerfile -t mall-server .
#   docker build -f apps/server/Dockerfile --target development -t mall-server:dev .

# ============================================================
# Stage 1: Base - Node + pnpm 环境
# ============================================================
FROM node:22.21.1-alpine AS base

RUN apk add --no-cache bash
RUN corepack enable && corepack prepare pnpm@10.14.0 --activate

WORKDIR /app

# ============================================================
# Stage 2: Dependencies - 安装全部 workspace 依赖
# ============================================================
FROM base AS deps

# 先复制依赖声明文件（利用 Docker 层缓存）
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/server/package.json ./apps/server/
COPY internal/eslint-config/package.json ./internal/eslint-config/
COPY internal/typescript-config/package.json ./internal/typescript-config/
COPY internal/stylelint-config/package.json ./internal/stylelint-config/

RUN pnpm install --frozen-lockfile

# ============================================================
# Stage 3: Builder - 构建应用
# ============================================================
FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/server/node_modules ./apps/server/node_modules
COPY . .

RUN pnpm --filter=mall-server build

# ============================================================
# Stage 4: Standalone - 提取生产依赖（pnpm deploy）
# ============================================================
FROM base AS standalone

# pnpm deploy 需要完整 workspace 结构（所有 package.json）才能解析 workspace:* 引用
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/server/node_modules ./apps/server/node_modules
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/server/package.json ./apps/server/
COPY internal/eslint-config/package.json ./internal/eslint-config/
COPY internal/typescript-config/package.json ./internal/typescript-config/
COPY internal/stylelint-config/package.json ./internal/stylelint-config/

# 提取 mall-server 的独立生产依赖包（pnpm v10 需要 --legacy 标志）
RUN pnpm --filter=mall-server deploy --prod --legacy /standalone

# ============================================================
# Stage 5: Production - 最终精简镜像
# ============================================================
FROM node:22.21.1-alpine AS production

ENV NODE_ENV=production

RUN apk add --no-cache bash tini

WORKDIR /app

# 仅生产 node_modules（由 pnpm deploy 提取）
COPY --from=standalone /standalone/node_modules ./node_modules

# 构建产物（含 nest-cli 复制的 i18n / mail-templates assets）
COPY --from=builder /app/apps/server/dist ./dist

# package.json（运行时依赖脚本路径）
COPY --from=builder /app/apps/server/package.json ./

# 启动脚本
COPY apps/server/scripts/wait-for-it.sh /opt/wait-for-it.sh
COPY apps/server/scripts/startup.sh /opt/startup.sh
RUN chmod +x /opt/wait-for-it.sh /opt/startup.sh && \
    sed -i 's/\r//g' /opt/wait-for-it.sh /opt/startup.sh

# 文件上传目录（使用非 root 用户）
RUN mkdir -p /app/files && chown -R node:node /app/files

EXPOSE 3001

USER node

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["/opt/startup.sh"]

# ============================================================
# Stage 6: Development - 热重载开发环境
# ============================================================
FROM base AS development

ENV NODE_ENV=development
ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN pnpm add -g @nestjs/cli

COPY --from=deps /app/node_modules ./node_modules
COPY . .

COPY apps/server/scripts/wait-for-it.sh /opt/wait-for-it.sh
COPY apps/server/scripts/startup.sh /opt/startup.sh
RUN chmod +x /opt/wait-for-it.sh /opt/startup.sh && \
    sed -i 's/\r//g' /opt/wait-for-it.sh /opt/startup.sh

EXPOSE 3001

CMD ["/opt/startup.sh"]
