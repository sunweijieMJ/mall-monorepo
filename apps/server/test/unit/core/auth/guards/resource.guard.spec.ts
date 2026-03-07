import { vi, describe, it, expect, beforeEach } from 'vitest';
import { Reflector } from '@nestjs/core';
import { ResourceGuard } from '@/core/auth/guards/resource.guard';

function createMockContext(
  user: any,
  path: string,
  method = 'GET',
  isPublic = false,
) {
  const request = { user, path, method };
  const reflector_override = isPublic;
  return {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({
      getRequest: () => request,
    }),
    _isPublic: reflector_override,
  };
}

describe('ResourceGuard', () => {
  let guard: ResourceGuard;
  let reflector: Reflector;
  let mockAdminCacheService: any;

  beforeEach(() => {
    reflector = new Reflector();
    mockAdminCacheService = {
      getAllResourceMap: vi.fn().mockResolvedValue(new Map()),
      getResourceList: vi.fn().mockResolvedValue([]),
    };
    guard = new ResourceGuard(reflector, mockAdminCacheService);
  });

  it('@Public 路由 → 直接放行', async () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);
    const ctx = createMockContext(null, '/api/v1/admin/auth/login');

    expect(await guard.canActivate(ctx as any)).toBe(true);
  });

  it('member token 访问 /admin/ 路径 → 拒绝', async () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
    const user = { sub: 1, username: 'member1', type: 'member' };
    const ctx = createMockContext(user, '/api/v1/admin/pms/products/list');

    expect(await guard.canActivate(ctx as any)).toBe(false);
  });

  it('无 token 访问 /admin/ 路径 → 拒绝', async () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
    const ctx = createMockContext(undefined, '/api/v1/admin/pms/products/list');

    expect(await guard.canActivate(ctx as any)).toBe(false);
  });

  it('member token 访问非 admin 路径 → 放行（不走资源校验）', async () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
    const user = { sub: 1, username: 'member1', type: 'member' };
    const ctx = createMockContext(user, '/api/v1/portal/cart/list');

    expect(await guard.canActivate(ctx as any)).toBe(true);
  });

  it('OPTIONS 请求 → 放行', async () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
    const user = { sub: 1, username: 'admin1', type: 'admin' };
    const ctx = createMockContext(user, '/api/v1/admin/something', 'OPTIONS');

    expect(await guard.canActivate(ctx as any)).toBe(true);
  });

  it('admin 访问未配置资源的路径 → 放行（白名单策略）', async () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
    mockAdminCacheService.getAllResourceMap.mockResolvedValue(new Map());
    const user = { sub: 1, username: 'admin1', type: 'admin' };
    const ctx = createMockContext(user, '/api/v1/admin/unconfigured/path');

    expect(await guard.canActivate(ctx as any)).toBe(true);
  });

  it('admin 有权限 → 放行', async () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
    const resourceMap = new Map([['/admin/pms/products/**', '1:商品管理']]);
    mockAdminCacheService.getAllResourceMap.mockResolvedValue(resourceMap);
    mockAdminCacheService.getResourceList.mockResolvedValue([
      { id: 1, name: '商品管理' },
    ]);
    const user = { sub: 1, username: 'admin1', type: 'admin' };
    const ctx = createMockContext(user, '/api/v1/admin/pms/products/list');

    expect(await guard.canActivate(ctx as any)).toBe(true);
  });

  it('admin 无权限 → 拒绝', async () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
    const resourceMap = new Map([['/admin/pms/products/**', '1:商品管理']]);
    mockAdminCacheService.getAllResourceMap.mockResolvedValue(resourceMap);
    mockAdminCacheService.getResourceList.mockResolvedValue([
      { id: 2, name: '订单管理' },
    ]);
    const user = { sub: 1, username: 'admin1', type: 'admin' };
    const ctx = createMockContext(user, '/api/v1/admin/pms/products/list');

    expect(await guard.canActivate(ctx as any)).toBe(false);
  });
});
