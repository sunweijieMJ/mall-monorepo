import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { AdminCacheService } from '@/core/auth/services/admin-cache.service';
import { AdminRoleRelationEntity } from '@/modules/ums/admin-user/infrastructure/persistence/relational/entities/admin-role-relation.entity';
import { RoleResourceRelationEntity } from '@/modules/ums/admin-role/infrastructure/persistence/relational/entities/role-resource-relation.entity';
import { AdminResourceEntity } from '@/modules/ums/admin-resource/infrastructure/persistence/relational/entities/admin-resource.entity';
import {
  createMockRepository,
  createMockCacheManager,
} from '../../../../helpers/mock.factory';

describe('AdminCacheService', () => {
  let service: AdminCacheService;
  const mockAdminRoleRelationRepo = createMockRepository();
  const mockRoleResourceRelationRepo = createMockRepository();
  const mockResourceRepo = createMockRepository();
  const mockCache = createMockCacheManager();

  beforeEach(async () => {
    vi.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        AdminCacheService,
        { provide: CACHE_MANAGER, useValue: mockCache },
        {
          provide: getRepositoryToken(AdminRoleRelationEntity),
          useValue: mockAdminRoleRelationRepo,
        },
        {
          provide: getRepositoryToken(RoleResourceRelationEntity),
          useValue: mockRoleResourceRelationRepo,
        },
        {
          provide: getRepositoryToken(AdminResourceEntity),
          useValue: mockResourceRepo,
        },
      ],
    }).compile();
    service = module.get(AdminCacheService);
  });

  describe('getResourceList', () => {
    it('缓存命中 → 直接返回', async () => {
      const cached = [{ id: 1, name: 'res1', url: '/admin/**' }];
      mockCache.get = vi.fn().mockResolvedValue(cached);

      const result = await service.getResourceList(1);

      expect(result).toBe(cached);
      expect(mockAdminRoleRelationRepo.find).not.toHaveBeenCalled();
    });

    it('缓存未命中 → 三表联查并缓存', async () => {
      mockCache.get = vi.fn().mockResolvedValue(null);
      mockAdminRoleRelationRepo.find.mockResolvedValue([
        { adminId: 1, roleId: 10 },
      ]);
      mockRoleResourceRelationRepo.find.mockResolvedValue([
        { roleId: 10, resourceId: 100 },
      ]);
      const resources = [
        { id: 100, name: '商品管理', url: '/admin/product/**' },
      ];
      mockResourceRepo.find.mockResolvedValue(resources);

      const result = await service.getResourceList(1);

      expect(result).toEqual(resources);
      expect(mockCache.set).toHaveBeenCalledWith(
        expect.stringContaining('resourceList:1'),
        resources,
        expect.any(Number),
      );
    });

    it('无角色 → 返回空数组', async () => {
      mockCache.get = vi.fn().mockResolvedValue(null);
      mockAdminRoleRelationRepo.find.mockResolvedValue([]);

      const result = await service.getResourceList(1);

      expect(result).toEqual([]);
    });
  });

  describe('getAllResourceMap', () => {
    it('缓存未命中 → 查 DB 并缓存，返回 Map', async () => {
      mockCache.get = vi.fn().mockResolvedValue(null);
      mockResourceRepo.find.mockResolvedValue([
        { id: 1, name: '商品管理', url: '/admin/product/**' },
        { id: 2, name: '订单管理', url: '/admin/order/**' },
      ]);

      const result = await service.getAllResourceMap();

      expect(result).toBeInstanceOf(Map);
      expect(result.get('/admin/product/**')).toBe('1:商品管理');
      expect(result.size).toBe(2);
    });

    it('缓存命中 → 直接用缓存构建 Map', async () => {
      mockCache.get = vi
        .fn()
        .mockResolvedValue([{ id: 1, name: 'res', url: '/test' }]);

      const result = await service.getAllResourceMap();

      expect(mockResourceRepo.find).not.toHaveBeenCalled();
      expect(result.get('/test')).toBe('1:res');
    });
  });

  describe('delResourceListByRole', () => {
    it('清除该角色下所有 admin 的缓存', async () => {
      mockAdminRoleRelationRepo.find.mockResolvedValue([
        { adminId: 1, roleId: 10 },
        { adminId: 2, roleId: 10 },
      ]);

      await service.delResourceListByRole(10);

      expect(mockCache.del).toHaveBeenCalledTimes(2);
    });
  });

  describe('delResourceListByRoleIds', () => {
    it('空数组 → 不查 DB', async () => {
      await service.delResourceListByRoleIds([]);

      expect(mockAdminRoleRelationRepo.find).not.toHaveBeenCalled();
    });
  });

  describe('delResourceListByResource', () => {
    it('级联清除：resource → role → admin 缓存 + 全局缓存', async () => {
      mockRoleResourceRelationRepo.find.mockResolvedValue([
        { roleId: 10, resourceId: 1 },
      ]);
      mockAdminRoleRelationRepo.find.mockResolvedValue([
        { adminId: 1, roleId: 10 },
      ]);

      await service.delResourceListByResource(1);

      // 应清除 admin 缓存 + 全局资源 Map 缓存
      expect(mockCache.del).toHaveBeenCalledWith(
        expect.stringContaining('resourceList:1'),
      );
      expect(mockCache.del).toHaveBeenCalledWith(
        expect.stringContaining('resourceList:all'),
      );
    });
  });
});
