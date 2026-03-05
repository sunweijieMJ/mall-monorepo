#!/bin/bash

# Mall Server 容器管理脚本
# 用法: ./deploy/manage.sh [start|stop|restart|remove|status|logs|health|cleanup|help]

set -euo pipefail

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 配置变量
CONTAINER_NAME="mall-server-api"
COMPOSE_FILE="deploy/docker-compose.prod.yaml"
HEALTH_URL="http://localhost:3001/api/v1/health/ready"
HEALTH_TIMEOUT=30

log_info()  { echo -e "${GREEN}[INFO]${NC} $*"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC} $*"; }
log_error() { echo -e "${RED}[ERROR]${NC} $*" >&2; }
log_blue()  { echo -e "${BLUE}[INFO]${NC} $*"; }

check_docker() {
    if ! command -v docker >/dev/null 2>&1; then
        log_error "Docker is not installed."
        exit 1
    fi
    if ! docker compose version >/dev/null 2>&1; then
        log_error "Docker Compose is not available."
        exit 1
    fi
}

# 服务器场景: manage.sh 与 docker/ 同级
# 本地场景: manage.sh 在 deploy/ 子目录下
get_project_root() {
    local script_dir
    script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    if [ -d "${script_dir}/docker" ]; then
        echo "$script_dir"
    else
        cd "${script_dir}/.." && pwd
    fi
}

container_running() {
    docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"
}

container_exists() {
    docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"
}

start_services() {
    local project_root
    project_root=$(get_project_root)

    if container_running; then
        log_warn "Services are already running"
        show_status
        return 0
    fi

    log_info "Starting services..."
    cd "$project_root"
    docker compose -f "$COMPOSE_FILE" up -d --remove-orphans

    log_info "Waiting for API to be healthy..."
    for i in $(seq 1 "$HEALTH_TIMEOUT"); do
        if wget -q --spider "$HEALTH_URL" 2>/dev/null || curl -sf "$HEALTH_URL" >/dev/null 2>&1; then
            log_info "API is healthy!"
            show_status
            return 0
        fi
        echo -ne "  Attempt $i/$HEALTH_TIMEOUT...\r"
        sleep 5
    done

    log_error "API health check failed after $HEALTH_TIMEOUT attempts"
    show_logs_tail
    exit 1
}

stop_services() {
    local project_root
    project_root=$(get_project_root)

    if ! container_exists; then
        log_warn "No services running"
        return 0
    fi

    log_info "Stopping services..."
    cd "$project_root"
    docker compose -f "$COMPOSE_FILE" stop
    log_info "Services stopped"
}

restart_services() {
    local project_root
    project_root=$(get_project_root)

    log_info "Restarting services..."
    cd "$project_root"
    docker compose -f "$COMPOSE_FILE" restart
    sleep 3

    if container_running; then
        log_info "Services restarted successfully"
        show_status
    else
        log_error "Services failed to restart"
        show_logs_tail
        exit 1
    fi
}

remove_services() {
    local project_root
    project_root=$(get_project_root)

    log_info "Removing services and volumes..."
    cd "$project_root"
    docker compose -f "$COMPOSE_FILE" down -v --remove-orphans
    log_info "Services removed"
}

show_status() {
    local project_root
    project_root=$(get_project_root)

    log_blue "Service Status:"
    cd "$project_root"
    docker compose -f "$COMPOSE_FILE" ps
}

show_logs() {
    local project_root
    project_root=$(get_project_root)

    log_info "Showing logs (Ctrl+C to exit)..."
    cd "$project_root"
    docker compose -f "$COMPOSE_FILE" logs -f
}

show_logs_tail() {
    local project_root
    project_root=$(get_project_root)

    log_blue "Recent API logs:"
    cd "$project_root"
    docker compose -f "$COMPOSE_FILE" logs api --tail=30
}

health_check() {
    if container_running; then
        if wget -q --spider "$HEALTH_URL" 2>/dev/null || curl -sf "$HEALTH_URL" >/dev/null 2>&1; then
            log_info "API is healthy"
        else
            log_error "API is running but health check failed"
            exit 1
        fi
    else
        log_error "API container is not running"
        exit 1
    fi
}

cleanup_images() {
    local image_pattern="${1:-}"

    if [ -z "$image_pattern" ]; then
        log_error "Usage: $0 cleanup <image-pattern>"
        exit 1
    fi

    log_info "Cleaning up old images for: ${image_pattern}"
    local old_images
    old_images=$(docker images "$image_pattern" -q | tail -n +4)

    if [ -n "$old_images" ]; then
        echo "$old_images" | xargs -r docker rmi -f || true
        log_info "Old images cleaned up"
    else
        log_info "No old images to clean up"
    fi
}

show_help() {
    cat <<EOF
${BLUE}Mall Server Container Management${NC}

Usage: $0 [COMMAND]

${GREEN}Commands:${NC}
  start       Start all services (api, postgres, redis)
  stop        Stop all running services
  restart     Restart all services
  remove      Remove all services and volumes
  status      Show services status
  logs        Show and follow service logs
  health      Run API health check
  cleanup     Clean up old Docker images (keep latest 3)
  help        Show this help message

${GREEN}Examples:${NC}
  $0 start
  $0 logs
  $0 health
  $0 cleanup mall-server

${GREEN}Configuration:${NC}
  Container:    $CONTAINER_NAME
  Compose file: $COMPOSE_FILE
  Health URL:   $HEALTH_URL
EOF
}

main() {
    check_docker

    local command="${1:-help}"

    case "$command" in
        start)    start_services ;;
        stop)     stop_services ;;
        restart)  restart_services ;;
        remove|rm) remove_services ;;
        status|ps) show_status ;;
        logs)     show_logs ;;
        health)   health_check ;;
        cleanup)  cleanup_images "${2:-}" ;;
        help|--help|-h) show_help ;;
        *)
            log_error "Unknown command: $command"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

main "$@"
