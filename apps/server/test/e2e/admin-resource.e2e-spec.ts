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

  // AdminResourceController: @Controller('resource')，无版本号
  // 注意：controller 中 GET ':id' 在 GET 'list'/'listAll' 之前声明，
  // 导致 GET /resource/list 和 GET /resource/listAll 被 ':id' 路由拦截。
  // 因此仅测试 POST 路由和数字 ID 路由。
  const resourceUrl = '/api/resource';
  const categoryUrl = '/api/resourceCategory';

  describe('POST /resource/create', () => {
    it('创建资源 → 201', async () => {
      mockResourceService.create.mockResolvedValue({ id: 1 });

      const res = await request(app.getHttpServer())
        .post(`${resourceUrl}/create`)
        .set('Authorization', bearerHeader(token))
        .send({ name: '新资源', url: '/test/**', categoryId: 1 })
        .expect(201);

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

  describe('POST /resource/delete/:id', () => {
    it('删除资源 → 201', async () => {
      mockResourceService.delete.mockResolvedValue(1);

      const res = await request(app.getHttpServer())
        .post(`${resourceUrl}/delete/1`)
        .set('Authorization', bearerHeader(token))
        .expect(201);

      expect(res.body.code).toBe(200);
    });
  });

  describe('GET /resourceCategory/listAll', () => {
    it('获取所有资源分类 → 200', async () => {
      mockResourceService.listCategory.mockResolvedValue([
        { id: 1, name: '商品模块' },
      ]);

      const res = await request(app.getHttpServer())
        .get(`${categoryUrl}/listAll`)
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
        .expect(201);

      expect(res.body.code).toBe(200);
    });
  });

  describe('POST /resourceCategory/update/:id', () => {
    it('修改资源分类 → 201', async () => {
      mockResourceService.updateCategory.mockResolvedValue(undefined);

      const res = await request(app.getHttpServer())
        .post(`${categoryUrl}/update/1`)
        .set('Authorization', bearerHeader(token))
        .send({ name: '订单模块' })
        .expect(201);

      expect(res.body.code).toBe(200);
    });
  });

  describe('POST /resourceCategory/delete/:id', () => {
    it('删除资源分类 → 201', async () => {
      mockResourceService.deleteCategory.mockResolvedValue(undefined);

      const res = await request(app.getHttpServer())
        .post(`${categoryUrl}/delete/1`)
        .set('Authorization', bearerHeader(token))
        .expect(201);

      expect(res.body.code).toBe(200);
    });
  });

  describe('POST /resource/update/:id', () => {
    it('修改资源 → 201', async () => {
      mockResourceService.update.mockResolvedValue(undefined);

      const res = await request(app.getHttpServer())
        .post(`${resourceUrl}/update/1`)
        .set('Authorization', bearerHeader(token))
        .send({ name: '修改后的资源', url: '/updated/**' })
        .expect(201);

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
