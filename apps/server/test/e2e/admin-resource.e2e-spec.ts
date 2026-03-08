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

import { AdminResourceService } from '@/modules/ums/admin-resource/admin-resource.service';
import {
  AdminResourceController,
  AdminResourceCategoryController,
} from '@/modules/ums/admin-resource/admin-resource.controller';

import { createTestApp } from '../helpers/create-test-app';
import { TestPassportModule } from '../helpers/test-passport.module';
import { generateAdminToken, bearerHeader } from '../helpers/jwt.helper';

const mockResourceService = {
  create: vi.fn(),
  update: vi.fn(),
  getItem: vi.fn(),
  delete: vi.fn(),
  list: vi.fn(),
  listAll: vi.fn(),
  createCategory: vi.fn(),
  updateCategory: vi.fn(),
  deleteCategory: vi.fn(),
  listCategory: vi.fn(),
};

@Module({
  imports: [TestPassportModule],
  controllers: [AdminResourceController, AdminResourceCategoryController],
  providers: [{ provide: AdminResourceService, useValue: mockResourceService }],
})
class TestAdminResourceModule {}

describe('AdminResource API (e2e)', () => {
  let app: INestApplication;
  const token = generateAdminToken();

  beforeAll(async () => {
    app = await createTestApp(TestAdminResourceModule);
  });

  afterAll(() => app?.close());
  beforeEach(() => vi.clearAllMocks());

  const resourceUrl = '/api/v1/admin/ums/resources';
  const categoryUrl = '/api/v1/admin/ums/resource-categories';

  describe('POST /resource/create', () => {
    it('创建资源 → 201', async () => {
      mockResourceService.create.mockResolvedValue({ id: 1 });

      const res = await request(app.getHttpServer())
        .post(`${resourceUrl}/create`)
        .set('Authorization', bearerHeader(token))
        .send({ name: '新资源', url: '/test/**', categoryId: 1 })
        .expect(200);

      expect(res.body.code).toBe(200);
    });
  });

  describe('GET /resource/:id', () => {
    it('获取资源详情 → 200', async () => {
      mockResourceService.getItem.mockResolvedValue({
        id: 1,
        name: '商品管理',
        url: '/pms/**',
      });

      const res = await request(app.getHttpServer())
        .get(`${resourceUrl}/1`)
        .set('Authorization', bearerHeader(token))
        .expect(200);

      expect(res.body.code).toBe(200);
      expect(res.body.data).toHaveProperty('name', '商品管理');
    });
  });

  describe('DELETE /resource/delete/:id', () => {
    it('删除资源 → 200', async () => {
      mockResourceService.delete.mockResolvedValue(1);

      const res = await request(app.getHttpServer())
        .delete(`${resourceUrl}/delete/1`)
        .set('Authorization', bearerHeader(token))
        .expect(200);

      expect(res.body.code).toBe(200);
    });
  });

  describe('GET /resourceCategory/all', () => {
    it('获取所有资源分类 → 200', async () => {
      mockResourceService.listCategory.mockResolvedValue([
        { id: 1, name: '商品模块' },
      ]);

      const res = await request(app.getHttpServer())
        .get(`${categoryUrl}/all`)
        .set('Authorization', bearerHeader(token))
        .expect(200);

      expect(res.body.code).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
    });
  });

  describe('POST /resourceCategory/create', () => {
    it('创建资源分类 → 201', async () => {
      mockResourceService.createCategory.mockResolvedValue({ id: 1 });

      const res = await request(app.getHttpServer())
        .post(`${categoryUrl}/create`)
        .set('Authorization', bearerHeader(token))
        .send({ name: '商品模块', sort: 0 })
        .expect(200);

      expect(res.body.code).toBe(200);
    });
  });

  describe('PUT /resourceCategory/update/:id', () => {
    it('修改资源分类 → 200', async () => {
      mockResourceService.updateCategory.mockResolvedValue(undefined);

      const res = await request(app.getHttpServer())
        .put(`${categoryUrl}/update/1`)
        .set('Authorization', bearerHeader(token))
        .send({ name: '订单模块' })
        .expect(200);

      expect(res.body.code).toBe(200);
    });
  });

  describe('DELETE /resourceCategory/delete/:id', () => {
    it('删除资源分类 → 200', async () => {
      mockResourceService.deleteCategory.mockResolvedValue(undefined);

      const res = await request(app.getHttpServer())
        .delete(`${categoryUrl}/delete/1`)
        .set('Authorization', bearerHeader(token))
        .expect(200);

      expect(res.body.code).toBe(200);
    });
  });

  describe('PUT /resource/update/:id', () => {
    it('修改资源 → 200', async () => {
      mockResourceService.update.mockResolvedValue(undefined);

      const res = await request(app.getHttpServer())
        .put(`${resourceUrl}/update/1`)
        .set('Authorization', bearerHeader(token))
        .send({ name: '修改后的资源', url: '/updated/**' })
        .expect(200);

      expect(res.body.code).toBe(200);
    });
  });

  describe('无 token', () => {
    it('POST /resource/create → 401', async () => {
      const res = await request(app.getHttpServer())
        .post(`${resourceUrl}/create`)
        .send({ name: '资源' })
        .expect(401);

      expect(res.body.code).toBe(401);
    });
  });
});
