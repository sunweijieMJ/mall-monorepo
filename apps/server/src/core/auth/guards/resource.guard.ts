import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtPayload } from '../types/jwt-payload.type';
import { AdminCacheService } from '../services/admin-cache.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/** 将 Ant 风格路径模式转换为正则进行匹配 */
function antMatch(pattern: string, path: string): boolean {
  const regexStr = pattern
    .replace(/\./g, '\\.')
    .replace(/\*\*/g, '___DOUBLE___')
    .replace(/\*/g, '[^/]*')
    .replace(/___DOUBLE___/g, '.*');
  return new RegExp(`^${regexStr}$`).test(path);
}

/**
 * 动态资源权限 Guard
 * 对应 Java DynamicSecurityFilter + DynamicAccessDecisionManager
 */
@Injectable()
export class ResourceGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly adminCacheService: AdminCacheService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 公开路由直接放行
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtPayload | undefined;

    // 未认证或 member 用户不走资源权限校验
    if (!user || user.type !== 'admin') return true;

    if (request.method === 'OPTIONS') return true;

    // 移除全局前缀和版本前缀后再匹配（资源表中存储不含前缀的路径）
    const requestPath = (request.path as string).replace(/^\/api\/v\d+/, '');

    // 获取全局资源 Map（URL pattern -> resourceId:name）
    const resourceMap = await this.adminCacheService.getAllResourceMap();

    // 匹配请求路径对应的资源
    let needAuthority: string | null = null;
    for (const [pattern, authority] of resourceMap.entries()) {
      if (antMatch(pattern, requestPath)) {
        needAuthority = authority;
        break;
      }
    }

    // 路径未在资源表中配置，直接放行
    if (!needAuthority) return true;

    // 检查当前 admin 是否拥有所需资源
    const adminResources = await this.adminCacheService.getResourceList(
      user.sub,
    );
    const adminAuthorities = new Set(
      adminResources.map((r) => `${r.id}:${r.name}`),
    );

    return adminAuthorities.has(needAuthority);
  }
}
