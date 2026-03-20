import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { AdminUserService } from '@/modules/ums/admin-user/admin-user.service';
import { AdminUserEntity } from '@/modules/ums/admin-user/infrastructure/persistence/relational/entities/admin-user.entity';
import { AdminRoleRelationEntity } from '@/modules/ums/admin-user/infrastructure/persistence/relational/entities/admin-role-relation.entity';
import { AdminRoleEntity } from '@/modules/ums/admin-role/infrastructure/persistence/relational/entities/admin-role.entity';
import { TransactionService } from '@/infrastructure/database/transaction/transaction.service';
import {
  createMockRepository,
  createMockCacheManager,
} from '../../../../helpers/mock.factory';

// bcryptjs mock
vi.mock('bcryptjs', () => ({
  compare: vi.fn().mockResolvedValue(false),
  hash: vi.fn().mockResolvedValue('$2a$10$hashed'),
}));
import * as bcrypt from 'bcryptjs';

const adminFixture = (overrides = {}) =>
  ({
    id: 1,
    username: 'admin',
    password: '$2a$10$existingHash',
    nickName: '管理员',
    status: 1,
    ...overrides,
  }) as unknown as AdminUserEntity;

describe('AdminUserService', () => {
  let service: AdminUserService;
  const mockAdminRepo = createMockRepository();
  const mockRoleRelRepo = createMockRepository();
  const mockRoleRepo = createMockRepository();
  const mockCache = createMockCacheManager();
  const mockManager = {
    delete: vi.fn().mockResolvedValue({}),
    softDelete: vi.fn().mockResolvedValue({ affected: 1 }),
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
        AdminUserService,
        {
          provide: getRepositoryToken(AdminUserEntity),
          useValue: mockAdminRepo,
        },
        {
          provide: getRepositoryToken(AdminRoleRelationEntity),
          useValue: mockRoleRelRepo,
        },
        {
          provide: getRepositoryToken(AdminRoleEntity),
          useValue: mockRoleRepo,
        },
        { provide: CACHE_MANAGER, useValue: mockCache },
        { provide: TransactionService, useValue: mockTransactionService },
      ],
    }).compile();
    service = module.get(AdminUserService);
  });

  describe('list', () => {
    it('无关键词 → 返回分页结果', async () => {
      const qb = mockAdminRepo.createQueryBuilder();
      mockAdminRepo.createQueryBuilder.mockReturnValue(qb);
      qb.getManyAndCount.mockResolvedValue([[adminFixture()], 1]);

      const result = await service.list('', { page: 1, limit: 10 } as any);

      expect(result.list).toHaveLength(1);
      expect(result.total).toBe(1);
      // 无关键词时不应调用 where
      expect(qb.where).not.toHaveBeenCalled();
    });

    it('有关键词 → 使用 LIKE 查询', async () => {
      const qb = mockAdminRepo.createQueryBuilder();
      mockAdminRepo.createQueryBuilder.mockReturnValue(qb);
      qb.getManyAndCount.mockResolvedValue([[], 0]);

      await service.list('admin', { page: 1, limit: 10 } as any);

      expect(qb.where).toHaveBeenCalledWith(
        'admin.username LIKE :keyword OR admin.nickName LIKE :keyword',
        { keyword: '%admin%' },
      );
    });
  });

  describe('getItem', () => {
    it('存在 → 返回管理员', async () => {
      mockAdminRepo.findOneBy.mockResolvedValue(adminFixture());
      const result = await service.getItem(1);
      expect(result.username).toBe('admin');
    });

    it('不存在 → 404', async () => {
      mockAdminRepo.findOneBy.mockResolvedValue(null);
      await expect(service.getItem(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByUsername', () => {
    it('存在 → 返回管理员', async () => {
      mockAdminRepo.findOneBy.mockResolvedValue(adminFixture());

      const result = await service.findByUsername('admin');
      expect(result?.username).toBe('admin');
    });

    it('不存在 → 返回 null', async () => {
      mockAdminRepo.findOneBy.mockResolvedValue(null);

      const result = await service.findByUsername('ghost');
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('更新基本信息（密码字段被忽略）', async () => {
      mockAdminRepo.findOneBy.mockResolvedValue(adminFixture());
      mockAdminRepo.update.mockResolvedValue({});

      await service.update(1, { password: 'samepass', nickName: '新昵称' });

      // update 方法会 delete dto.password，所以不应调用 hash
      expect(bcrypt.hash).not.toHaveBeenCalled();
      // update 调用时不应包含 password
      expect(mockAdminRepo.update).toHaveBeenCalledWith(
        1,
        expect.not.objectContaining({ password: expect.anything() }),
      );
    });

    it('管理员不存在 → 404', async () => {
      mockAdminRepo.findOneBy.mockResolvedValue(null);

      await expect(service.update(999, {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('存在 → 删除 + 清缓存', async () => {
      mockAdminRepo.findOneBy.mockResolvedValue(adminFixture());
      mockManager.softDelete.mockResolvedValue({ affected: 1 });

      const result = await service.delete(1);

      expect(result).toBe(1);
      expect(mockCache.del).toHaveBeenCalledWith('mall:admin:admin');
      expect(mockCache.del).toHaveBeenCalledWith('mall:resourceList:1');
      expect(mockManager.delete).toHaveBeenCalledWith(AdminRoleRelationEntity, {
        adminId: 1,
      });
      expect(mockManager.softDelete).toHaveBeenCalledWith(AdminUserEntity, 1);
    });

    it('不存在 → 返回 0', async () => {
      mockAdminRepo.findOneBy.mockResolvedValue(null);

      const result = await service.delete(999);
      expect(result).toBe(0);
    });
  });

  describe('updateStatus', () => {
    it('更新状态 + 清缓存', async () => {
      mockAdminRepo.findOneBy.mockResolvedValue(adminFixture());
      mockAdminRepo.update.mockResolvedValue({});

      await service.updateStatus(1, 0);

      expect(mockAdminRepo.update).toHaveBeenCalledWith(1, { status: 0 });
      expect(mockCache.del).toHaveBeenCalledWith('mall:admin:admin');
      expect(mockCache.del).toHaveBeenCalledWith('mall:resourceList:1');
    });

    it('管理员不存在 → NotFoundException', async () => {
      mockAdminRepo.findOneBy.mockResolvedValue(null);
      await expect(service.updateStatus(999, 0)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updatePassword', () => {
    it('参数不完整 → 400', async () => {
      await expect(
        service.updatePassword({
          username: '',
          oldPassword: '',
          newPassword: '',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('用户不存在 → NotFoundException', async () => {
      const qb = mockAdminRepo.createQueryBuilder();
      mockAdminRepo.createQueryBuilder.mockReturnValue(qb);
      qb.getOne.mockResolvedValue(null);

      await expect(
        service.updatePassword({
          username: 'ghost',
          oldPassword: 'pass',
          newPassword: 'new',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('旧密码错误 → 400', async () => {
      const qb = mockAdminRepo.createQueryBuilder();
      mockAdminRepo.createQueryBuilder.mockReturnValue(qb);
      qb.getOne.mockResolvedValue(adminFixture());
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      await expect(
        service.updatePassword({
          username: 'admin',
          oldPassword: 'wrong',
          newPassword: 'new123',
        }),
      ).rejects.toThrow('旧密码错误');
    });

    it('旧密码正确 → 更新密码 + 清缓存', async () => {
      const qb = mockAdminRepo.createQueryBuilder();
      mockAdminRepo.createQueryBuilder.mockReturnValue(qb);
      qb.getOne.mockResolvedValue(adminFixture());
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      mockAdminRepo.save.mockResolvedValue({});

      await service.updatePassword({
        username: 'admin',
        oldPassword: 'correct',
        newPassword: 'newpass',
      });

      expect(bcrypt.hash).toHaveBeenCalled();
      expect(mockCache.del).toHaveBeenCalled();
    });
  });

  describe('updateRole', () => {
    it('分配角色 → 先删后插 + 清缓存', async () => {
      await service.updateRole(1, [10, 20]);

      expect(mockManager.delete).toHaveBeenCalledWith(AdminRoleRelationEntity, {
        adminId: 1,
      });
      expect(mockManager.save).toHaveBeenCalled();
      expect(mockCache.del).toHaveBeenCalled();
    });

    it('空角色列表 → 只删除', async () => {
      await service.updateRole(1, []);

      expect(mockManager.delete).toHaveBeenCalled();
      expect(mockManager.save).not.toHaveBeenCalled();
    });
  });

  describe('getRoleList', () => {
    it('有角色 → 返回角色列表', async () => {
      mockRoleRelRepo.find.mockResolvedValue([{ adminId: 1, roleId: 10 }]);
      mockRoleRepo.find.mockResolvedValue([{ id: 10, name: '超级管理员' }]);

      const result = await service.getRoleList(1);
      expect(result).toHaveLength(1);
    });

    it('无角色 → 返回空数组', async () => {
      mockRoleRelRepo.find.mockResolvedValue([]);

      const result = await service.getRoleList(1);
      expect(result).toEqual([]);
    });
  });

  describe('resetPassword', () => {
    it('正常重置 → hash + update + 清缓存', async () => {
      mockAdminRepo.findOneBy.mockResolvedValue(adminFixture());
      mockAdminRepo.update.mockResolvedValue({ affected: 1 });

      const result = await service.resetPassword(1, 'NewPass123');

      expect(bcrypt.hash).toHaveBeenCalledWith('NewPass123', 10);
      expect(mockAdminRepo.update).toHaveBeenCalledWith(1, {
        password: '$2a$10$hashed',
      });
      expect(mockCache.del).toHaveBeenCalled();
      expect(result).toBe(1);
    });

    it('管理员不存在 → 404', async () => {
      mockAdminRepo.findOneBy.mockResolvedValue(null);

      await expect(service.resetPassword(999, 'any')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
