import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { AdminResourceService } from '@/modules/ums/admin-resource/admin-resource.service';
import {
  AdminResourceEntity,
  AdminResourceCategoryEntity,
} from '@/modules/ums/admin-resource/infrastructure/persistence/relational/entities/admin-resource.entity';
import { AdminCacheService } from '@/core/auth/services/admin-cache.service';
import { createMockRepository } from '../../../../helpers/mock.factory';

describe('AdminResourceService', () => {
  let service: AdminResourceService;
  const mockResourceRepo = createMockRepository();
  const mockCategoryRepo = createMockRepository();
  const mockAdminCacheService = {
    delAllResourceCache: vi.fn().mockResolvedValue(undefined),
    delResourceListByResource: vi.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module = await Test.createTestingModule({
      providers: [
        AdminResourceService,
        {
          provide: getRepositoryToken(AdminResourceEntity),
          useValue: mockResourceRepo,
        },
        {
          provide: getRepositoryToken(AdminResourceCategoryEntity),
          useValue: mockCategoryRepo,
        },
        { provide: AdminCacheService, useValue: mockAdminCacheService },
      ],
    }).compile();

    service = module.get(AdminResourceService);
  });

  // ---- 资源 CRUD ----

  describe('create', () => {
    it('创建资源 → 清除全局资源缓存', async () => {
      const dto = { name: '商品管理', url: '/product/**' };
      mockResourceRepo.save.mockResolvedValue({ id: 1, ...dto });

      const result = await service.create(dto as any);

      expect(result.id).toBe(1);
      expect(mockAdminCacheService.delAllResourceCache).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('更新资源 → 清除相关 admin 资源缓存', async () => {
      mockResourceRepo.update.mockResolvedValue({ affected: 1 });

      const result = await service.update(1, { name: '新名称' } as any);

      expect(result).toBe(1);
      expect(
        mockAdminCacheService.delResourceListByResource,
      ).toHaveBeenCalledWith(1);
    });
  });

  describe('getItem', () => {
    it('存在 → 返回资源', async () => {
      const resource = { id: 1, name: '商品管理' };
      mockResourceRepo.findOneBy.mockResolvedValue(resource);

      const result = await service.getItem(1);

      expect(result).toBe(resource);
    });

    it('不存在 → 抛出 NotFoundException', async () => {
      mockResourceRepo.findOneBy.mockResolvedValue(null);

      await expect(service.getItem(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('删除资源 → 清除相关 admin 资源缓存', async () => {
      mockResourceRepo.delete.mockResolvedValue({ affected: 1 });

      const result = await service.delete(1);

      expect(result).toBe(1);
      expect(
        mockAdminCacheService.delResourceListByResource,
      ).toHaveBeenCalledWith(1);
    });
  });

  describe('list', () => {
    it('无过滤条件 → 返回分页列表', async () => {
      const qb = mockResourceRepo.createQueryBuilder();
      qb.getManyAndCount.mockResolvedValue([[{ id: 1 }], 1]);
      mockResourceRepo.createQueryBuilder.mockReturnValue(qb);

      const query = { page: 1, limit: 10 } as any;
      const result = await service.list(undefined, undefined, undefined, query);

      expect(result.list).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('带 categoryId + nameKeyword + urlKeyword 过滤', async () => {
      const qb = mockResourceRepo.createQueryBuilder();
      qb.getManyAndCount.mockResolvedValue([[{ id: 1 }], 1]);
      mockResourceRepo.createQueryBuilder.mockReturnValue(qb);

      const query = { page: 1, limit: 10 } as any;
      await service.list(5, '商品', '/product', query);

      // 应该调用 3 次 andWhere（categoryId、name、url）
      expect(qb.andWhere).toHaveBeenCalledTimes(3);
    });
  });

  describe('listAll', () => {
    it('返回全部资源', async () => {
      const all = [{ id: 1 }, { id: 2 }];
      mockResourceRepo.find.mockResolvedValue(all);

      const result = await service.listAll();

      expect(result).toBe(all);
    });
  });

  // ---- 资源分类 CRUD ----

  describe('createCategory', () => {
    it('创建资源分类', async () => {
      mockCategoryRepo.save.mockResolvedValue({ id: 1, name: '商品模块' });

      const result = await service.createCategory({ name: '商品模块' } as any);

      expect(result.id).toBe(1);
    });
  });

  describe('updateCategory', () => {
    it('更新资源分类', async () => {
      mockCategoryRepo.update.mockResolvedValue({ affected: 1 });

      const result = await service.updateCategory(1, {
        name: '新分类名',
      } as any);

      expect(result).toBe(1);
    });
  });

  describe('deleteCategory', () => {
    it('删除资源分类', async () => {
      mockCategoryRepo.delete.mockResolvedValue({ affected: 1 });

      const result = await service.deleteCategory(1);

      expect(result).toBe(1);
    });
  });

  describe('listCategory', () => {
    it('返回全部分类（按 sort 升序）', async () => {
      const categories = [
        { id: 1, sort: 1 },
        { id: 2, sort: 2 },
      ];
      mockCategoryRepo.find.mockResolvedValue(categories);

      const result = await service.listCategory();

      expect(result).toBe(categories);
      expect(mockCategoryRepo.find).toHaveBeenCalledWith({
        order: { sort: 'ASC' },
      });
    });
  });
});
