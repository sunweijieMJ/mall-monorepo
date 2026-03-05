#!/usr/bin/env bash
set -e

# Mall Server 容器启动脚本
# ENV_MODE: dev | ci | prod（默认 prod）

ENV_MODE=${ENV_MODE:-prod}

echo "========================================"
echo "Starting Mall Server..."
echo "ENV_MODE: $ENV_MODE"
echo "NODE_ENV: $NODE_ENV"
echo "========================================"

# 等待 PostgreSQL 就绪
echo "Waiting for PostgreSQL (${DATABASE_HOST:-postgres}:${DATABASE_PORT:-5432})..."
/opt/wait-for-it.sh "${DATABASE_HOST:-postgres}:${DATABASE_PORT:-5432}" -t 60

# 等待 Redis 就绪（如果启用）
if [ "$REDIS_ENABLED" = "true" ] && [ -n "$REDIS_HOST" ]; then
  echo "Waiting for Redis (${REDIS_HOST}:${REDIS_PORT:-6379})..."
  /opt/wait-for-it.sh "${REDIS_HOST}:${REDIS_PORT:-6379}" -t 30 || true
fi

# 运行数据库 migration
echo "Running database migrations..."
if [ "$ENV_MODE" = "prod" ]; then
  node ./node_modules/typeorm/cli.js \
    --dataSource=dist/infrastructure/database/data-source.js \
    migration:run
else
  # dev / ci 环境：pnpm 可用（monorepo 上下文）
  pnpm --filter=mall-server migration:run
fi

# 运行 seed 数据
if [ "$ENV_MODE" = "prod" ]; then
  if [ "$RUN_SEEDS" = "true" ]; then
    echo "Running seed data (RUN_SEEDS=true)..."
    node dist/infrastructure/database/seeds/run-seed.js
  else
    echo "Skipping seeds in production (set RUN_SEEDS=true to enable)"
  fi
else
  echo "Running seed data..."
  pnpm --filter=mall-server seed:run
fi

# 启动应用
case $ENV_MODE in
  ci)
    echo "Starting in CI mode..."
    node dist/main > /tmp/app.log 2>&1 &
    APP_PID=$!

    echo "Waiting for API to be ready..."
    if ! /opt/wait-for-it.sh localhost:3001 -t 120; then
      echo "========================================"
      echo "Application failed to start. Logs:"
      echo "========================================"
      cat /tmp/app.log || true
      exit 1
    fi

    echo "Running E2E tests..."
    pnpm --filter=mall-server test:e2e

    kill $APP_PID 2>/dev/null || true
    ;;

  prod | *)
    echo "Starting in production mode..."
    exec node dist/main
    ;;
esac
