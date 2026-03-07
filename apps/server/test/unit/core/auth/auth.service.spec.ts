import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

// vi.mock 提升到 import 之前
vi.mock('bcryptjs', () => ({
  compare: vi.fn(),
  hash: vi.fn().mockResolvedValue('$hashed$'),
}));

import * as bcrypt from 'bcryptjs';

import { AuthService } from '@/core/auth/auth.service';
import { AdminUserEntity } from '@/modules/ums/admin-user/infrastructure/persistence/relational/entities/admin-user.entity';
import { AdminLoginLogEntity } from '@/modules/ums/admin-user/infrastructure/persistence/relational/entities/admin-login-log.entity';
import { AdminRoleRelationEntity } from '@/modules/ums/admin-user/infrastructure/persistence/relational/entities/admin-role-relation.entity';
import { AdminRoleEntity } from '@/modules/ums/admin-role/infrastructure/persistence/relational/entities/admin-role.entity';
import { RoleMenuRelationEntity } from '@/modules/ums/admin-role/infrastructure/persistence/relational/entities/role-menu-relation.entity';
import { AdminMenuEntity } from '@/modules/ums/admin-menu/infrastructure/persistence/relational/entities/admin-menu.entity';
import { MemberEntity } from '@/modules/portal/member/infrastructure/persistence/relational/entities/member.entity';
import { MemberLevelEntity } from '@/modules/ums/member-level/infrastructure/persistence/relational/entities/member-level.entity';
import { SessionEntity } from '@/core/auth/infrastructure/persistence/relational/entities/session.entity';
import { REDIS_CLIENT } from '@/infrastructure/redis/redis-client.module';
import {
  createMockRepository,
  createMockCacheManager,
} from '../../../helpers/mock.factory';

// 复用 fixture
import {
  createAdminFixture,
  createDisabledAdminFixture,
} from '../../../fixtures/admin.fixture';
import { createMemberFixture } from '../../../fixtures/member.fixture';

function createMockRedisClient() {
  return {
    incr: vi.fn().mockResolvedValue(1),
    pexpire: vi.fn().mockResolvedValue(1),
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue('OK'),
    del: vi.fn().mockResolvedValue(1),
  };
}

describe('AuthService', () => {
  let service: AuthService;
  const mockAdminRepo = createMockRepository();
  const mockLoginLogRepo = createMockRepository();
  const mockAdminRoleRelationRepo = createMockRepository();
  const mockAdminRoleRepo = createMockRepository();
  const mockRoleMenuRelationRepo = createMockRepository();
  const mockAdminMenuRepo = createMockRepository();
  const mockMemberRepo = createMockRepository();
  const mockMemberLevelRepo = createMockRepository();
  const mockSessionRepo = createMockRepository();
  const mockCache = createMockCacheManager();
  const mockRedis = createMockRedisClient();

  // adminLogin/portalLogin 使用 createQueryBuilder 链式调用
  // 需要固定 QB mock 引用，因为 createMockRepository 每次调用 createQueryBuilder 返回新对象
  const adminQb = mockAdminRepo.createQueryBuilder();
  mockAdminRepo.createQueryBuilder.mockReturnValue(adminQb);
  const memberQb = mockMemberRepo.createQueryBuilder();
  mockMemberRepo.createQueryBuilder.mockReturnValue(memberQb);

  beforeEach(async () => {
    vi.clearAllMocks();

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: vi.fn().mockReturnValue('mock-jwt-token'),
            decode: vi.fn().mockReturnValue({
              sub: 1,
              username: 'test-admin',
              type: 'admin',
              exp: Math.floor(Date.now() / 1000) + 3600,
            }),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: vi.fn().mockReturnValue('test-secret'),
            get: vi.fn().mockReturnValue('7d'),
          },
        },
        { provide: CACHE_MANAGER, useValue: mockCache },
        {
          provide: getRepositoryToken(AdminUserEntity),
          useValue: mockAdminRepo,
        },
        {
          provide: getRepositoryToken(AdminLoginLogEntity),
          useValue: mockLoginLogRepo,
        },
        {
          provide: getRepositoryToken(AdminRoleRelationEntity),
          useValue: mockAdminRoleRelationRepo,
        },
        {
          provide: getRepositoryToken(AdminRoleEntity),
          useValue: mockAdminRoleRepo,
        },
        {
          provide: getRepositoryToken(RoleMenuRelationEntity),
          useValue: mockRoleMenuRelationRepo,
        },
        {
          provide: getRepositoryToken(AdminMenuEntity),
          useValue: mockAdminMenuRepo,
        },
        { provide: getRepositoryToken(MemberEntity), useValue: mockMemberRepo },
        {
          provide: getRepositoryToken(MemberLevelEntity),
          useValue: mockMemberLevelRepo,
        },
        {
          provide: getRepositoryToken(SessionEntity),
          useValue: mockSessionRepo,
        },
        { provide: REDIS_CLIENT, useValue: mockRedis },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  // ======================== adminLogin ========================

  describe('adminLogin', () => {
    const dto = { username: 'test-admin', password: 'Admin@123456' };

    function mockQbReturns(entity: any) {
      adminQb.getOne.mockResolvedValue(entity);
    }

    it('正确凭据 → 返回 token pair', async () => {
      mockCache.get = vi.fn().mockResolvedValue(null); // 未锁定
      mockQbReturns(createAdminFixture());
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      mockSessionRepo.save.mockResolvedValue({ id: 1 });
      mockLoginLogRepo.save.mockResolvedValue({});
      mockAdminRepo.update.mockResolvedValue({});

      const result = await service.adminLogin(dto);

      expect(result.token).toBeDefined();
      expect(result.tokenHead).toBe('Bearer');
      expect(result.refreshToken).toBeDefined();
    });

    it('用户不存在 → 401 + 记录失败次数', async () => {
      mockCache.get = vi.fn().mockResolvedValue(null);
      mockQbReturns(null);

      await expect(service.adminLogin(dto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockRedis.incr).toHaveBeenCalled();
    });

    it('密码错误 → 401 + 记录失败次数', async () => {
      mockCache.get = vi.fn().mockResolvedValue(null);
      mockQbReturns(createAdminFixture());
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      await expect(service.adminLogin(dto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockRedis.incr).toHaveBeenCalled();
    });

    it('账号禁用 → 401', async () => {
      mockCache.get = vi.fn().mockResolvedValue(null);
      mockQbReturns(createDisabledAdminFixture());
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

      await expect(service.adminLogin(dto)).rejects.toThrow('账号已被禁用');
    });

    it('账号被锁定（防暴力破解）→ 401', async () => {
      mockCache.get = vi.fn().mockResolvedValue('locked');

      await expect(service.adminLogin(dto)).rejects.toThrow('登录尝试过多');
    });

    it('连续失败 5 次 → 触发锁定', async () => {
      mockCache.get = vi.fn().mockResolvedValue(null);
      mockQbReturns(null);
      mockRedis.incr.mockResolvedValue(5); // 第 5 次失败

      await expect(service.adminLogin(dto)).rejects.toThrow(
        UnauthorizedException,
      );
      // 应该设置锁定 key
      expect(mockRedis.set).toHaveBeenCalledWith(
        expect.stringContaining('lock'),
        '1',
        'PX',
        expect.any(Number),
      );
    });
  });

  // ======================== adminRegister ========================

  describe('adminRegister', () => {
    const dto = {
      username: 'new-admin',
      password: 'Admin@123',
      email: 'new@test.com',
      nickName: '新管理员',
    };

    it('正常注册 → 返回用户信息（不含密码）', async () => {
      mockAdminRepo.findOne.mockResolvedValue(null);
      mockAdminRepo.save.mockResolvedValue({
        id: 2,
        username: 'new-admin',
        password: '$hashed$',
        email: 'new@test.com',
      });

      const result = await service.adminRegister(dto as any);

      expect(result).not.toHaveProperty('password');
      expect(vi.mocked(bcrypt.hash)).toHaveBeenCalledWith('Admin@123', 10);
    });

    it('用户名已存在 → 400', async () => {
      mockAdminRepo.findOne.mockResolvedValue(createAdminFixture());

      await expect(service.adminRegister(dto as any)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  // ======================== getAdminInfo ========================

  describe('getAdminInfo', () => {
    it('正常获取 → 返回用户名、角色、菜单树', async () => {
      mockAdminRepo.findOne.mockResolvedValue(createAdminFixture());
      mockAdminRoleRelationRepo.find.mockResolvedValue([
        { adminId: 1, roleId: 1 },
      ]);
      mockAdminRoleRepo.find.mockResolvedValue([{ id: 1, name: '超级管理员' }]);
      mockRoleMenuRelationRepo.find.mockResolvedValue([
        { roleId: 1, menuId: 1 },
      ]);
      mockAdminMenuRepo.find.mockResolvedValue([
        { id: 1, parentId: 0, title: '商品', sort: 0 },
      ]);

      const result = await service.getAdminInfo(1);

      expect(result.username).toBe('test-admin');
      expect(result.roles).toEqual(['超级管理员']);
      expect(result.menus).toBeDefined();
    });

    it('管理员不存在 → 401', async () => {
      mockAdminRepo.findOne.mockResolvedValue(null);

      await expect(service.getAdminInfo(999)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('无角色 → 返回空角色列表和空菜单', async () => {
      mockAdminRepo.findOne.mockResolvedValue(createAdminFixture());
      mockAdminRoleRelationRepo.find.mockResolvedValue([]);

      const result = await service.getAdminInfo(1);

      expect(result.roles).toEqual([]);
      expect(result.menus).toEqual([]);
    });
  });

  // ======================== portalLogin ========================

  describe('portalLogin', () => {
    const dto = { username: 'test-member', password: 'Member@123456' };

    function mockMemberQbReturns(entity: any) {
      memberQb.getOne.mockResolvedValue(entity);
    }

    it('正确凭据 → 返回 token pair', async () => {
      mockCache.get = vi.fn().mockResolvedValue(null); // 未锁定
      mockMemberQbReturns(createMemberFixture());
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      mockSessionRepo.save.mockResolvedValue({ id: 1 });
      mockMemberRepo.update.mockResolvedValue({});

      const result = await service.portalLogin(dto);

      expect(result.token).toBeDefined();
      expect(result.tokenHead).toBe('Bearer');
      expect(result.refreshToken).toBeDefined();
    });

    it('用户不存在 → recordLoginFailure + 401', async () => {
      mockCache.get = vi.fn().mockResolvedValue(null);
      mockMemberQbReturns(null);

      await expect(service.portalLogin(dto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockRedis.incr).toHaveBeenCalled();
    });

    it('密码错误 → recordLoginFailure + 401', async () => {
      mockCache.get = vi.fn().mockResolvedValue(null);
      mockMemberQbReturns(createMemberFixture());
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      await expect(service.portalLogin(dto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockRedis.incr).toHaveBeenCalled();
    });

    it('账号禁用（status !== 1）→ 401', async () => {
      mockCache.get = vi.fn().mockResolvedValue(null);
      mockMemberQbReturns(createMemberFixture({ status: 0 }));
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

      await expect(service.portalLogin(dto)).rejects.toThrow('账号已被禁用');
    });

    it('账号锁定 → 401', async () => {
      mockCache.get = vi.fn().mockResolvedValue('locked');

      await expect(service.portalLogin(dto)).rejects.toThrow('登录尝试过多');
    });
  });

  // ======================== portalRegister ========================

  describe('portalRegister', () => {
    const dto = {
      username: '13800138001',
      password: 'User@123',
      telephone: '13800138001',
      authCode: '123456',
    };

    it('正常注册 → 成功', async () => {
      mockCache.get = vi.fn().mockResolvedValue('123456');
      mockMemberRepo.findOne.mockResolvedValue(null);
      mockMemberLevelRepo.findOne.mockResolvedValue({ id: 1 });
      mockMemberRepo.save.mockResolvedValue({});

      await expect(service.portalRegister(dto as any)).resolves.toBeUndefined();
      // 注册后应删除验证码
      expect(mockCache.del).toHaveBeenCalledWith(
        expect.stringContaining('authCode'),
      );
    });

    it('验证码错误 → 400', async () => {
      mockCache.get = vi.fn().mockResolvedValue('654321');

      await expect(service.portalRegister(dto as any)).rejects.toThrow(
        '验证码错误',
      );
    });

    it('手机号已注册 → 400', async () => {
      mockCache.get = vi.fn().mockResolvedValue('123456');
      mockMemberRepo.findOne.mockResolvedValue(createMemberFixture());

      await expect(service.portalRegister(dto as any)).rejects.toThrow(
        '手机号已注册',
      );
    });
  });

  // ======================== generateAuthCode ========================

  describe('generateAuthCode', () => {
    it('正常生成 → 返回 6 位验证码', async () => {
      mockCache.get = vi.fn().mockResolvedValue(null);

      const code = await service.generateAuthCode('13800138000');

      expect(code).toHaveLength(6);
      expect(/^\d{6}$/.test(code)).toBe(true);
      // 应设置验证码和冷却
      expect(mockCache.set).toHaveBeenCalledTimes(2);
    });

    it('冷却期内 → 400', async () => {
      mockCache.get = vi.fn().mockResolvedValue('1'); // 冷却未结束

      await expect(service.generateAuthCode('13800138000')).rejects.toThrow(
        '验证码发送过于频繁',
      );
    });
  });

  // ======================== logout ========================

  describe('logout', () => {
    it('正常登出 → token 加入黑名单 + 删除缓存', async () => {
      mockCache.set = vi.fn().mockResolvedValue(undefined);
      mockCache.del = vi.fn().mockResolvedValue(undefined);
      mockSessionRepo.delete.mockResolvedValue({});

      await service.logout('Bearer mock-token');

      // 应加入黑名单
      expect(mockCache.set).toHaveBeenCalledWith(
        expect.stringContaining('token_blacklist'),
        '1',
        expect.any(Number),
      );
      // 应删除 jwt_valid 缓存
      expect(mockCache.del).toHaveBeenCalledWith(
        expect.stringContaining('jwt_valid'),
      );
    });
  });

  // ======================== refreshToken ========================

  describe('refreshToken', () => {
    const payload = {
      sub: 1,
      username: 'test-admin',
      type: 'admin' as const,
      sessionId: 1,
      jti: 'test-jti',
    };

    it('正常刷新 → 返回新 token pair', async () => {
      mockSessionRepo.findOne.mockResolvedValue({
        id: 1,
        userId: 1,
        userType: 'admin',
        hash: '$hashed$',
      });
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      mockAdminRepo.findOne.mockResolvedValue(createAdminFixture());
      mockSessionRepo.delete.mockResolvedValue({});
      mockSessionRepo.save.mockResolvedValue({ id: 2 });

      const result = await service.refreshToken(payload);

      expect(result.token).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('Session 不存在 → 401', async () => {
      mockSessionRepo.findOne.mockResolvedValue(null);

      await expect(service.refreshToken(payload)).rejects.toThrow(
        'Session 不存在',
      );
    });

    it('Session 归属不匹配 → 401', async () => {
      mockSessionRepo.findOne.mockResolvedValue({
        id: 1,
        userId: 999,
        userType: 'admin',
        hash: '$hashed$',
      });

      await expect(service.refreshToken(payload)).rejects.toThrow(
        'Session 信息不匹配',
      );
    });

    it('jti 不匹配 → 401 + 删除 Session', async () => {
      mockSessionRepo.findOne.mockResolvedValue({
        id: 1,
        userId: 1,
        userType: 'admin',
        hash: '$hashed$',
      });
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);
      mockSessionRepo.delete.mockResolvedValue({});

      await expect(service.refreshToken(payload)).rejects.toThrow(
        'Token 验证失败',
      );
      expect(mockSessionRepo.delete).toHaveBeenCalledWith({ id: 1 });
    });

    it('账号已禁用 → 401 + 删除 Session', async () => {
      mockSessionRepo.findOne.mockResolvedValue({
        id: 1,
        userId: 1,
        userType: 'admin',
        hash: '$hashed$',
      });
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      mockAdminRepo.findOne.mockResolvedValue(createDisabledAdminFixture());
      mockSessionRepo.delete.mockResolvedValue({});

      await expect(service.refreshToken(payload)).rejects.toThrow(
        '账号已被禁用',
      );
    });
  });

  // ======================== getMemberInfo ========================

  describe('getMemberInfo', () => {
    it('正常获取 → 返回信息（不含密码）', async () => {
      mockMemberRepo.findOne.mockResolvedValue(createMemberFixture());

      const result = await service.getMemberInfo(1);

      expect(result).not.toHaveProperty('password');
      expect(result).toHaveProperty('username', 'test-member');
    });

    it('会员不存在 → 401', async () => {
      mockMemberRepo.findOne.mockResolvedValue(null);

      await expect(service.getMemberInfo(999)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  // ======================== updateMemberPassword ========================

  describe('updateMemberPassword', () => {
    it('正常修改 → 成功', async () => {
      mockCache.get = vi.fn().mockResolvedValue('123456');
      mockMemberRepo.findOne.mockResolvedValue(createMemberFixture());
      mockMemberRepo.update.mockResolvedValue({});

      await expect(
        service.updateMemberPassword('13800138000', 'NewPass1', '123456'),
      ).resolves.toBeUndefined();
    });

    it('验证码错误 → 400', async () => {
      mockCache.get = vi.fn().mockResolvedValue('654321');

      await expect(
        service.updateMemberPassword('13800138000', 'NewPass1', '000000'),
      ).rejects.toThrow('验证码错误');
    });

    it('手机号未注册 → 400', async () => {
      mockCache.get = vi.fn().mockResolvedValue('123456');
      mockMemberRepo.findOne.mockResolvedValue(null);

      await expect(
        service.updateMemberPassword('13900139000', 'NewPass1', '123456'),
      ).rejects.toThrow('该手机号未注册');
    });
  });

  // ======================== refreshToken member 账号禁用 ========================

  describe('refreshToken 补充', () => {
    it('member 账号禁用 → 401 + 删除 Session', async () => {
      const memberPayload = {
        sub: 1,
        username: 'test-member',
        type: 'member' as const,
        sessionId: 1,
        jti: 'test-jti',
      };

      mockSessionRepo.findOne.mockResolvedValue({
        id: 1,
        userId: 1,
        userType: 'member',
        hash: '$hashed$',
      });
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      // member 账号已禁用
      mockMemberRepo.findOne.mockResolvedValue({ id: 1, status: 0 });
      mockSessionRepo.delete.mockResolvedValue({});

      await expect(service.refreshToken(memberPayload)).rejects.toThrow(
        '账号已被禁用',
      );
      expect(mockSessionRepo.delete).toHaveBeenCalledWith({ id: 1 });
    });
  });
});
