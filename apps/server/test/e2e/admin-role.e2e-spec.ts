import { INestApplication, Module } from '@nestjs/common';
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

import { AdminRoleService } from '@/modules/ums/admin-role/admin-role.service';
import { AdminRoleController } from '@/modules/ums/admin-role/admin-role.controller';

import { createTestApp } from '../helpers/create-test-app';
import { TestPassportModule } from '../helpers/test-passport.module';
import { generateAdminToken, bearerHeader } from '../helpers/jwt.helper';

const mockRoleService = {
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  listAll: vi.fn(),
  list: vi.fn(),
  updateStatus: vi.fn(),
  listMenu: vi.fn(),
  listResource: vi.fn(),
  allocMenu: vi.fn(),
  allocResource: vi.fn(),
};

@Module({
  imports: [TestPassportModule],
  controllers: [AdminRoleController],
  providers: [{ provide: AdminRoleService, useValue: mockRoleService }],
})
class TestAdminRoleModule {}

describe('Admin Role API (e2e)', () => {
  let app: INestApplication;
  const token = generateAdminToken();

  // 注意：AdminRoleController 的路径是 'role'，没有 version，URL 为 /api/role/...
  beforeAll(async () => {
    app = await createTestApp(TestAdminRoleModule);
  });

  afterAll(() => app?.close());
  beforeEach(() => vi.clearAllMocks());

  describe('POST /api/role/create', () => {
    const url = '/api/role/create';

    it('无 token → 401', async () => {
      const res = await request(app.getHttpServer()).post(url).expect(401);
      expect(res.body.code).toBe(401);
    });

    it('创建角色 → 200', async () => {
      mockRoleService.create.mockResolvedValue({ id: 1, name: '编辑' });

      const res = await request(app.getHttpServer())
        .post(url)
        .set('Authorization', bearerHeader(token))
        .send({ name: '编辑', description: '编辑角色' })
        .expect(201);

      expect(res.body.code).toBe(200);
      expect(res.body.data.name).toBe('编辑');
    });
  });

  describe('POST /api/role/update/:id', () => {
    it('更新角色 → 200', async () => {
      mockRoleService.update.mockResolvedValue(1);

      const res = await request(app.getHttpServer())
        .post('/api/role/update/1')
        .set('Authorization', bearerHeader(token))
        .send({ name: '新名称' })
        .expect(201);

      expect(res.body.code).toBe(200);
    });
  });

  describe('POST /api/role/delete', () => {
    it('批量删除 → 200', async () => {
      mockRoleService.delete.mockResolvedValue(2);

      const res = await request(app.getHttpServer())
        .post('/api/role/delete')
        .set('Authorization', bearerHeader(token))
        .query({ ids: '1,2' })
        .expect(201);

      expect(res.body.code).toBe(200);
    });
  });

  describe('GET /api/role/listAll', () => {
    it('获取所有角色 → 200', async () => {
      mockRoleService.listAll.mockResolvedValue([
        { id: 1, name: '超级管理员' },
        { id: 2, name: '编辑' },
      ]);

      const res = await request(app.getHttpServer())
        .get('/api/role/listAll')
        .set('Authorization', bearerHeader(token))
        .expect(200);

      expect(res.body.code).toBe(200);
      expect(res.body.data).toHaveLength(2);
    });
  });

  describe('GET /api/role/list', () => {
    it('分页查询 → 200', async () => {
      mockRoleService.list.mockResolvedValue({
        list: [{ id: 1, name: '管理员' }],
        total: 1,
      });

      const res = await request(app.getHttpServer())
        .get('/api/role/list')
        .set('Authorization', bearerHeader(token))
        .query({ keyword: '管理', pageNum: 1, pageSize: 10 })
        .expect(200);

      expect(res.body.code).toBe(200);
    });
  });

  describe('GET /api/role/listMenu/:roleId', () => {
    it('获取角色菜单 → 200', async () => {
      mockRoleService.listMenu.mockResolvedValue([
        { id: 1, title: '系统管理' },
      ]);

      const res = await request(app.getHttpServer())
        .get('/api/role/listMenu/1')
        .set('Authorization', bearerHeader(token))
        .expect(200);

      expect(res.body.code).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });
  });

  describe('GET /api/role/listResource/:roleId', () => {
    it('获取角色资源 → 200', async () => {
      mockRoleService.listResource.mockResolvedValue([
        { id: 1, name: '商品管理' },
      ]);

      const res = await request(app.getHttpServer())
        .get('/api/role/listResource/1')
        .set('Authorization', bearerHeader(token))
        .expect(200);

      expect(res.body.code).toBe(200);
    });
  });

  describe('POST /api/role/allocMenu', () => {
    it('分配菜单 → 200', async () => {
      mockRoleService.allocMenu.mockResolvedValue(undefined);

      const res = await request(app.getHttpServer())
        .post('/api/role/allocMenu')
        .set('Authorization', bearerHeader(token))
        .query({ roleId: 1, menuIds: '1,2,3' })
        .expect(201);

      expect(res.body.code).toBe(200);
    });
  });

  describe('POST /api/role/allocResource', () => {
    it('分配资源 → 200', async () => {
      mockRoleService.allocResource.mockResolvedValue(undefined);

      const res = await request(app.getHttpServer())
        .post('/api/role/allocResource')
        .set('Authorization', bearerHeader(token))
        .query({ roleId: 1, resourceIds: '10,20' })
        .expect(201);

      expect(res.body.code).toBe(200);
    });
  });
});
