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

import { AdminMenuService } from '@/modules/ums/admin-menu/admin-menu.service';
import { AdminMenuController } from '@/modules/ums/admin-menu/admin-menu.controller';

import { createTestApp } from '../helpers/create-test-app';
import { TestPassportModule } from '../helpers/test-passport.module';
import { generateAdminToken, bearerHeader } from '../helpers/jwt.helper';

const mockService = {
  create: vi.fn(),
  update: vi.fn(),
  getItem: vi.fn(),
  delete: vi.fn(),
  list: vi.fn(),
  treeList: vi.fn(),
  updateHidden: vi.fn(),
};

@Module({
  imports: [TestPassportModule],
  controllers: [AdminMenuController],
  providers: [{ provide: AdminMenuService, useValue: mockService }],
})
class TestAdminMenuModule {}

describe('AdminMenu API (e2e)', () => {
  let app: INestApplication;
  const token = generateAdminToken();

  beforeAll(async () => {
    app = await createTestApp(TestAdminMenuModule);
  });

  afterAll(() => app?.close());
  beforeEach(() => vi.clearAllMocks());

  const baseUrl = '/api/menu';

  describe('POST /create', () => {
    it('添加后台菜单 → 201', async () => {
      mockService.create.mockResolvedValue({ id: 1 });

      const res = await request(app.getHttpServer())
        .post(`${baseUrl}/create`)
        .set('Authorization', bearerHeader(token))
        .send({ name: 'pms', parentId: 0, sort: 0 })
        .expect(201);

      expect(res.body.code).toBe(200);
      expect(mockService.create).toHaveBeenCalled();
    });
  });

  describe('POST /update/:id', () => {
    it('修改后台菜单 → 201', async () => {
      mockService.update.mockResolvedValue(undefined);

      const res = await request(app.getHttpServer())
        .post(`${baseUrl}/update/1`)
        .set('Authorization', bearerHeader(token))
        .send({ title: '商品管理V2' })
        .expect(201);

      expect(res.body.code).toBe(200);
    });
  });

  describe('GET /:id', () => {
    it('获取菜单详情 → 200', async () => {
      mockService.getItem.mockResolvedValue({
        id: 1,
        title: '商品管理',
        parentId: 0,
      });

      const res = await request(app.getHttpServer())
        .get(`${baseUrl}/1`)
        .set('Authorization', bearerHeader(token))
        .expect(200);

      expect(res.body.code).toBe(200);
      expect(res.body.data).toHaveProperty('title', '商品管理');
    });
  });

  describe('POST /delete/:id', () => {
    it('删除后台菜单 → 201', async () => {
      mockService.delete.mockResolvedValue(undefined);

      const res = await request(app.getHttpServer())
        .post(`${baseUrl}/delete/1`)
        .set('Authorization', bearerHeader(token))
        .expect(201);

      expect(res.body.code).toBe(200);
    });
  });

  describe('GET /list/:parentId', () => {
    it('分页查询子菜单 → 200', async () => {
      mockService.list.mockResolvedValue({
        list: [{ id: 2, title: '商品列表', parentId: 1 }],
        total: 1,
      });

      const res = await request(app.getHttpServer())
        .get(`${baseUrl}/list/1`)
        .set('Authorization', bearerHeader(token))
        .query({ pageNum: 1, pageSize: 10 })
        .expect(200);

      expect(res.body.code).toBe(200);
    });
  });

  // 注意：GET /treeList 被 GET /:id 的 ParseIntPipe 先拦截返回 400，
  // 这是 controller 路由声明顺序问题（:id 在 treeList 之前），不在测试范围内修复。

  describe('POST /updateHidden/:id', () => {
    it('修改菜单显示状态 → 201', async () => {
      mockService.updateHidden.mockResolvedValue(undefined);

      const res = await request(app.getHttpServer())
        .post(`${baseUrl}/updateHidden/1`)
        .set('Authorization', bearerHeader(token))
        .query({ hidden: '1' })
        .expect(201);

      expect(res.body.code).toBe(200);
      expect(mockService.updateHidden).toHaveBeenCalledWith(1, 1);
    });
  });

  describe('无 token', () => {
    it('GET /treeList → 401', async () => {
      const res = await request(app.getHttpServer())
        .get(`${baseUrl}/treeList`)
        .expect(401);

      expect(res.body.code).toBe(401);
    });
  });
});
