import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { AdminRoleService } from '@/modules/ums/admin-role/admin-role.service';
import { AdminRoleEntity } from '@/modules/ums/admin-role/infrastructure/persistence/relational/entities/admin-role.entity';
import { AdminRoleRelationEntity } from '@/modules/ums/admin-user/infrastructure/persistence/relational/entities/admin-role-relation.entity';
import { RoleMenuRelationEntity } from '@/modules/ums/admin-role/infrastructure/persistence/relational/entities/role-menu-relation.entity';
import { RoleResourceRelationEntity } from '@/modules/ums/admin-role/infrastructure/persistence/relational/entities/role-resource-relation.entity';
import { AdminMenuEntity } from '@/modules/ums/admin-menu/infrastructure/persistence/relational/entities/admin-menu.entity';
import { AdminResourceEntity } from '@/modules/ums/admin-resource/infrastructure/persistence/relational/entities/admin-resource.entity';
import { TransactionService } from '@/infrastructure/database/transaction/transaction.service';
import {
  createMockRepository,
  createMockCacheManager,
} from '../../../../helpers/mock.factory';

describe('AdminRoleService', () => {
  let service: AdminRoleService;
  const mockRoleRepo = createMockRepository();
  const mockAdminRoleRelRepo = createMockRepository();
  const mockRoleMenuRelRepo = createMockRepository();
  const mockRoleResourceRelRepo = createMockRepository();
  const mockMenuRepo = createMockRepository();
  const mockResourceRepo = createMockRepository();
  const mockCache = createMockCacheManager();
  const mockManager = {
    delete: vi.fn().mockResolvedValue({}),
    create: vi.fn().mockImplementation((_e: any, d: any) => d),
    save: vi.fn().mockResolvedValue({}),
  };
  const mockTransactionService = {
    run: vi.fn().mockImplementation(async (cb: any) => cb(mockManager)),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    mockTransactionService.run.mockImplementation(async (cb: any) =>
      cb(mockManager),
    );

    const module = await Test.createTestingModule({
      providers: [
        AdminRoleService,
        {
          provide: getRepositoryToken(AdminRoleEntity),
          useValue: mockRoleRepo,
        },
        {
          provide: getRepositoryToken(AdminRoleRelationEntity),
          useValue: mockAdminRoleRelRepo,
        },
        {
          provide: getRepositoryToken(RoleMenuRelationEntity),
          useValue: mockRoleMenuRelRepo,
        },
        {
          provide: getRepositoryToken(RoleResourceRelationEntity),
          useValue: mockRoleResourceRelRepo,
        },
        {
          provide: getRepositoryToken(AdminMenuEntity),
          useValue: mockMenuRepo,
        },
        {
          provide: getRepositoryToken(AdminResourceEntity),
          useValue: mockResourceRepo,
        },
        { provide: CACHE_MANAGER, useValue: mockCache },
        { provide: TransactionService, useValue: mockTransactionService },
      ],
    }).compile();
    service = module.get(AdminRoleService);
  });

  describe('create', () => {
    it('创建角色 → adminCount 默认 0', async () => {
      mockRoleRepo.save.mockResolvedValue({
        id: 1,
        name: '编辑',
        adminCount: 0,
      });

      const result = await service.create({ name: '编辑' });

      expect(result.adminCount).toBe(0);
    });
  });

  describe('delete', () => {
    it('批量删除 → 清除关联 admin 缓存', async () => {
      const qb = mockRoleRepo.createQueryBuilder();
      qb.delete = vi.fn().mockReturnValue(qb);
      mockRoleRepo.createQueryBuilder.mockReturnValue(qb);
      qb.execute.mockResolvedValue({ affected: 2 });
      mockAdminRoleRelRepo.find.mockResolvedValue([{ adminId: 1, roleId: 10 }]);

      await service.delete([10]);

      expect(mockCache.del).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('更新角色 → 返回 1', async () => {
      mockRoleRepo.update.mockResolvedValue({ affected: 1 });

      const result = await service.update(1, { name: '新角色名' });

      expect(result).toBe(1);
      expect(mockRoleRepo.update).toHaveBeenCalledWith(1, { name: '新角色名' });
    });
  });

  describe('list', () => {
    it('无关键词 → 返回分页结果', async () => {
      mockRoleRepo.findAndCount.mockResolvedValue([
        [{ id: 1, name: '编辑' }],
        1,
      ]);

      const result = await service.list('', { page: 1, limit: 10 } as any);

      expect(result.list).toHaveLength(1);
      expect(result.total).toBe(1);
      // 无关键词时 where 应为空对象
      const callArgs = mockRoleRepo.findAndCount.mock.calls[0][0];
      expect(callArgs.where).toEqual({});
    });

    it('有关键词 → 使用 Like 查询', async () => {
      mockRoleRepo.findAndCount.mockResolvedValue([[], 0]);

      await service.list('管理', { page: 1, limit: 10 } as any);

      const callArgs = mockRoleRepo.findAndCount.mock.calls[0][0];
      expect(callArgs.where.name).toBeDefined();
    });
  });

  describe('listAll', () => {
    it('返回所有角色', async () => {
      mockRoleRepo.find.mockResolvedValue([
        { id: 1, name: '超级管理员' },
        { id: 2, name: '编辑' },
      ]);

      const result = await service.listAll();

      expect(result).toHaveLength(2);
      expect(mockRoleRepo.find).toHaveBeenCalled();
    });
  });

  describe('updateStatus', () => {
    it('更新角色状态 → 返回 1', async () => {
      mockRoleRepo.update.mockResolvedValue({ affected: 1 });

      const result = await service.updateStatus(1, 0);

      expect(result).toBe(1);
      expect(mockRoleRepo.update).toHaveBeenCalledWith(1, { status: 0 });
    });
  });

  describe('listMenu', () => {
    it('有菜单 → 返回菜单列表', async () => {
      mockRoleMenuRelRepo.find.mockResolvedValue([{ roleId: 1, menuId: 100 }]);
      mockMenuRepo.find.mockResolvedValue([{ id: 100, title: '系统管理' }]);

      const result = await service.listMenu(1);
      expect(result).toHaveLength(1);
    });

    it('无菜单关联 → 返回空数组', async () => {
      mockRoleMenuRelRepo.find.mockResolvedValue([]);

      const result = await service.listMenu(1);
      expect(result).toEqual([]);
    });
  });

  describe('listResource', () => {
    it('有资源 → 返回资源列表', async () => {
      mockRoleResourceRelRepo.find.mockResolvedValue([
        { roleId: 1, resourceId: 200 },
      ]);
      mockResourceRepo.find.mockResolvedValue([{ id: 200, name: '商品管理' }]);

      const result = await service.listResource(1);
      expect(result).toHaveLength(1);
    });

    it('无资源关联 → 返回空数组', async () => {
      mockRoleResourceRelRepo.find.mockResolvedValue([]);
      const result = await service.listResource(1);
      expect(result).toEqual([]);
    });
  });

  describe('allocMenu', () => {
    it('分配菜单 → 先删后插', async () => {
      await service.allocMenu(1, [100, 200]);

      expect(mockManager.delete).toHaveBeenCalledWith(RoleMenuRelationEntity, {
        roleId: 1,
      });
      expect(mockManager.save).toHaveBeenCalled();
    });

    it('空菜单列表 → 只删除', async () => {
      await service.allocMenu(1, []);

      expect(mockManager.delete).toHaveBeenCalled();
      expect(mockManager.save).not.toHaveBeenCalled();
    });
  });

  describe('allocResource', () => {
    it('分配资源 → 先删后插 + 清 admin 缓存', async () => {
      mockAdminRoleRelRepo.find.mockResolvedValue([{ adminId: 1, roleId: 1 }]);

      await service.allocResource(1, [200, 300]);

      expect(mockManager.delete).toHaveBeenCalledWith(
        RoleResourceRelationEntity,
        { roleId: 1 },
      );
      expect(mockCache.del).toHaveBeenCalled();
    });
  });

  describe('getMenuList', () => {
    it('admin → roles → menus 链式查询', async () => {
      mockAdminRoleRelRepo.find.mockResolvedValue([{ adminId: 1, roleId: 10 }]);
      mockRoleMenuRelRepo.find.mockResolvedValue([{ roleId: 10, menuId: 100 }]);
      mockMenuRepo.find.mockResolvedValue([{ id: 100, title: '首页' }]);

      const result = await service.getMenuList(1);

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('首页');
    });

    it('admin 无角色 → 空', async () => {
      mockAdminRoleRelRepo.find.mockResolvedValue([]);
      const result = await service.getMenuList(1);
      expect(result).toEqual([]);
    });
  });
});
