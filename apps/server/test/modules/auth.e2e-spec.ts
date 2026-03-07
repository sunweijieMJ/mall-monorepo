import { INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import request from 'supertest';
import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  vi,
} from 'vitest';

// vi.mock 被 Vitest 自动提升到 import 之前执行，解决 ESM 不可 spy 的问题
vi.mock('bcryptjs', () => ({
  compare: vi.fn(),
  hash: vi.fn(),
}));

import * as bcrypt from 'bcryptjs';

import { AuthModule } from '@/core/auth/auth.module';
import { AdminUserEntity } from '@/modules/ums/admin-user/infrastructure/persistence/relational/entities/admin-user.entity';
import { AdminLoginLogEntity } from '@/modules/ums/admin-user/infrastructure/persistence/relational/entities/admin-login-log.entity';
import { AdminRoleRelationEntity } from '@/modules/ums/admin-user/infrastructure/persistence/relational/entities/admin-role-relation.entity';
import { AdminRoleEntity } from '@/modules/ums/admin-role/infrastructure/persistence/relational/entities/admin-role.entity';
import { RoleMenuRelationEntity } from '@/modules/ums/admin-role/infrastructure/persistence/relational/entities/role-menu-relation.entity';
import { RoleResourceRelationEntity } from '@/modules/ums/admin-role/infrastructure/persistence/relational/entities/role-resource-relation.entity';
import { AdminResourceEntity } from '@/modules/ums/admin-resource/infrastructure/persistence/relational/entities/admin-resource.entity';
import { AdminMenuEntity } from '@/modules/ums/admin-menu/infrastructure/persistence/relational/entities/admin-menu.entity';
import { MemberEntity } from '@/modules/portal/member/infrastructure/persistence/relational/entities/member.entity';
import { MemberLevelEntity } from '@/modules/ums/member-level/infrastructure/persistence/relational/entities/member-level.entity';
import { SessionEntity } from '@/core/auth/infrastructure/persistence/relational/entities/session.entity';

import { createTestApp } from '../helpers/create-test-app';
import {
  createMockRepository,
  createMockCacheManager,
} from '../helpers/mock.factory';
import { generateAdminToken, bearerHeader } from '../helpers/jwt.helper';
import {
  createAdminFixture,
  createDisabledAdminFixture,
} from '../fixtures/admin.fixture';
import {
  createMemberFixture,
  createDisabledMemberFixture,
} from '../fixtures/member.fixture';

describe('Auth API (e2e)', () => {
  let app: INestApplication;

  // Mock repositories
  const mockAdminRepo = createMockRepository();
  const mockLoginLogRepo = createMockRepository();
  const mockAdminRoleRelationRepo = createMockRepository();
  const mockAdminRoleRepo = createMockRepository();
  const mockRoleMenuRelationRepo = createMockRepository();
  const mockRoleResourceRelationRepo = createMockRepository();
  const mockAdminResourceRepo = createMockRepository();
  const mockAdminMenuRepo = createMockRepository();
  const mockMemberRepo = createMockRepository();
  const mockMemberLevelRepo = createMockRepository();
  const mockSessionRepo = createMockRepository();
  const mockCache = createMockCacheManager();

  beforeAll(async () => {
    app = await createTestApp(AuthModule, (builder) => {
      builder
        .overrideProvider(getRepositoryToken(AdminUserEntity))
        .useValue(mockAdminRepo)
        .overrideProvider(getRepositoryToken(AdminLoginLogEntity))
        .useValue(mockLoginLogRepo)
        .overrideProvider(getRepositoryToken(AdminRoleRelationEntity))
        .useValue(mockAdminRoleRelationRepo)
        .overrideProvider(getRepositoryToken(AdminRoleEntity))
        .useValue(mockAdminRoleRepo)
        .overrideProvider(getRepositoryToken(RoleMenuRelationEntity))
        .useValue(mockRoleMenuRelationRepo)
        .overrideProvider(getRepositoryToken(RoleResourceRelationEntity))
        .useValue(mockRoleResourceRelationRepo)
        .overrideProvider(getRepositoryToken(AdminResourceEntity))
        .useValue(mockAdminResourceRepo)
        .overrideProvider(getRepositoryToken(AdminMenuEntity))
        .useValue(mockAdminMenuRepo)
        .overrideProvider(getRepositoryToken(MemberEntity))
        .useValue(mockMemberRepo)
        .overrideProvider(getRepositoryToken(MemberLevelEntity))
        .useValue(mockMemberLevelRepo)
        .overrideProvider(getRepositoryToken(SessionEntity))
        .useValue(mockSessionRepo)
        .overrideProvider(CACHE_MANAGER)
        .useValue(mockCache);
    });
  });

  afterAll(() => app?.close());

  beforeEach(() => vi.clearAllMocks());

  // ======================== 管理端登录 ========================

  describe('POST /api/v1/admin/auth/login', () => {
    const url = '/api/v1/admin/auth/login';

    it('正确凭据 → 200 + token', async () => {
      // adminLogin 使用 createQueryBuilder 链式查询（addSelect password 字段）
      mockAdminRepo.createQueryBuilder.mockReturnValue({
        addSelect: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        getOne: vi.fn().mockResolvedValue(createAdminFixture()),
      });
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      mockLoginLogRepo.save.mockResolvedValue({});
      mockAdminRepo.update.mockResolvedValue({});
      mockSessionRepo.save.mockResolvedValue({ id: 1 });

      const res = await request(app.getHttpServer())
        .post(url)
        .send({ username: 'test-admin', password: 'Admin@123456' })
        .expect(200);

      expect(res.body.code).toBe(200);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.tokenHead).toBe('Bearer');
    });

    it('用户不存在 → 401', async () => {
      mockAdminRepo.createQueryBuilder.mockReturnValue({
        addSelect: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        getOne: vi.fn().mockResolvedValue(null),
      });

      const res = await request(app.getHttpServer())
        .post(url)
        .send({ username: 'nonexistent', password: 'Admin@123456' })
        .expect(401);

      expect(res.body.code).toBe(401);
      expect(res.body.data).toBeNull();
    });

    it('密码错误 → 401', async () => {
      mockAdminRepo.createQueryBuilder.mockReturnValue({
        addSelect: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        getOne: vi.fn().mockResolvedValue(createAdminFixture()),
      });
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      const res = await request(app.getHttpServer())
        .post(url)
        .send({ username: 'test-admin', password: 'wrong-password' })
        .expect(401);

      expect(res.body.code).toBe(401);
      expect(res.body.data).toBeNull();
    });

    it('账号禁用 → 401', async () => {
      mockAdminRepo.createQueryBuilder.mockReturnValue({
        addSelect: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        getOne: vi.fn().mockResolvedValue(createDisabledAdminFixture()),
      });
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

      const res = await request(app.getHttpServer())
        .post(url)
        .send({ username: 'disabled-admin', password: 'Admin@123456' })
        .expect(401);

      expect(res.body.code).toBe(401);
      expect(res.body.data).toBeNull();
    });

    it('缺少 username 字段 → 422', async () => {
      const res = await request(app.getHttpServer())
        .post(url)
        .send({ password: 'Admin@123456' })
        .expect(422);

      expect(res.body.code).toBe(422);
      expect(res.body.data).toHaveProperty('username');
    });

    it('缺少 password 字段 → 422', async () => {
      const res = await request(app.getHttpServer())
        .post(url)
        .send({ username: 'test-admin' })
        .expect(422);

      expect(res.body.code).toBe(422);
      expect(res.body.data).toHaveProperty('password');
    });
  });

  // ======================== 管理端获取信息 ========================

  describe('GET /api/v1/admin/auth/info', () => {
    const url = '/api/v1/admin/auth/info';

    it('无 Authorization header → 401', async () => {
      const res = await request(app.getHttpServer()).get(url).expect(401);

      expect(res.body.code).toBe(401);
      expect(res.body.data).toBeNull();
    });

    it('无效 token → 401', async () => {
      const res = await request(app.getHttpServer())
        .get(url)
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(res.body.code).toBe(401);
      expect(res.body.data).toBeNull();
    });

    it('有效 admin token → 200 + 用户信息', async () => {
      const admin = createAdminFixture();
      const token = generateAdminToken(admin.id, admin.username);

      mockAdminRepo.findOne.mockResolvedValue(admin);
      mockAdminRoleRelationRepo.find.mockResolvedValue([
        { adminId: 1, roleId: 1 },
      ]);
      mockAdminRoleRepo.find.mockResolvedValue([
        { id: 1, name: '超级管理员', description: '', status: 1, sort: 0 },
      ]);
      mockRoleMenuRelationRepo.find.mockResolvedValue([
        { roleId: 1, menuId: 1 },
        { roleId: 1, menuId: 2 },
      ]);
      mockAdminMenuRepo.find.mockResolvedValue([
        {
          id: 1,
          parentId: 0,
          title: '商品',
          level: 0,
          sort: 0,
          name: 'pms',
          icon: 'product',
          hidden: 0,
        },
        {
          id: 2,
          parentId: 1,
          title: '商品列表',
          level: 1,
          sort: 0,
          name: 'product',
          icon: 'product-list',
          hidden: 0,
        },
      ]);

      const res = await request(app.getHttpServer())
        .get(url)
        .set('Authorization', bearerHeader(token))
        .expect(200);

      expect(res.body.code).toBe(200);
      expect(res.body.data.username).toBe('test-admin');
      expect(res.body.data.roles).toEqual(['超级管理员']);
      expect(res.body.data.menus).toBeDefined();
      expect(Array.isArray(res.body.data.menus)).toBe(true);
    });
  });

  // ======================== 管理端登出 ========================

  describe('POST /api/v1/admin/auth/logout', () => {
    const url = '/api/v1/admin/auth/logout';

    it('无 token → 401', async () => {
      const res = await request(app.getHttpServer()).post(url).expect(401);

      expect(res.body.code).toBe(401);
      expect(res.body.data).toBeNull();
    });

    it('有效 token → 200', async () => {
      const token = generateAdminToken();

      const res = await request(app.getHttpServer())
        .post(url)
        .set('Authorization', bearerHeader(token))
        .expect(200);

      expect(res.body.code).toBe(200);
    });
  });

  // ======================== 移动端登录 ========================

  describe('POST /api/v1/portal/auth/login', () => {
    const url = '/api/v1/portal/auth/login';

    it('正确凭据 → 200 + token', async () => {
      // portalLogin 使用 createQueryBuilder 链式查询（addSelect password 字段）
      mockMemberRepo.createQueryBuilder.mockReturnValue({
        addSelect: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        getOne: vi.fn().mockResolvedValue(createMemberFixture()),
      });
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      mockSessionRepo.save.mockResolvedValue({ id: 1 });

      const res = await request(app.getHttpServer())
        .post(url)
        .send({ username: '13800138000', password: 'Member@123456' })
        .expect(200);

      expect(res.body.code).toBe(200);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.tokenHead).toBe('Bearer');
    });

    it('用户不存在 → 401', async () => {
      mockMemberRepo.createQueryBuilder.mockReturnValue({
        addSelect: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        getOne: vi.fn().mockResolvedValue(null),
      });

      const res = await request(app.getHttpServer())
        .post(url)
        .send({ username: '13900139000', password: 'Member@123456' })
        .expect(401);

      expect(res.body.code).toBe(401);
      expect(res.body.data).toBeNull();
    });

    it('账号禁用 → 401', async () => {
      mockMemberRepo.createQueryBuilder.mockReturnValue({
        addSelect: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        getOne: vi.fn().mockResolvedValue(createDisabledMemberFixture()),
      });
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

      const res = await request(app.getHttpServer())
        .post(url)
        .send({ username: '13800138000', password: 'Member@123456' })
        .expect(401);

      expect(res.body.code).toBe(401);
      expect(res.body.data).toBeNull();
    });

    it('缺少 username 字段 → 422', async () => {
      const res = await request(app.getHttpServer())
        .post(url)
        .send({ password: 'Member@123456' })
        .expect(422);

      expect(res.body.code).toBe(422);
      expect(res.body.data).toHaveProperty('username');
    });
  });

  // ======================== 移动端注册 ========================

  describe('POST /api/v1/portal/auth/register', () => {
    const url = '/api/v1/portal/auth/register';

    it('正确注册 → 200', async () => {
      mockCache.get = vi.fn().mockResolvedValue('123456');
      mockMemberRepo.findOne.mockResolvedValue(null);
      mockMemberLevelRepo.findOne.mockResolvedValue({ id: 1 });
      mockMemberRepo.save.mockResolvedValue({});

      const res = await request(app.getHttpServer())
        .post(url)
        .send({
          username: '13800138001',
          password: 'User@123',
          telephone: '13800138001',
          authCode: '123456',
        })
        .expect(200);

      expect(res.body.code).toBe(200);
    });

    it('验证码错误 → 400', async () => {
      mockCache.get = vi.fn().mockResolvedValue('654321');

      const res = await request(app.getHttpServer())
        .post(url)
        .send({
          username: '13800138001',
          password: 'User@123',
          telephone: '13800138001',
          authCode: '000000',
        })
        .expect(400);

      expect(res.body.code).toBe(400);
      expect(res.body.data).toBeNull();
    });

    it('缺少必填字段 → 422', async () => {
      const res = await request(app.getHttpServer())
        .post(url)
        .send({ username: '13800138001' })
        .expect(422);

      expect(res.body.code).toBe(422);
      expect(res.body.data).toHaveProperty('password');
    });
  });
});
