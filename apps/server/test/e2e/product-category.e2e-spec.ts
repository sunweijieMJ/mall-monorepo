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

import { ProductCategoryService } from '@/modules/pms/product-category/product-category.service';
import { ProductCategoryController } from '@/modules/pms/product-category/product-category.controller';

import { createTestApp } from '../helpers/create-test-app';
import { TestPassportModule } from '../helpers/test-passport.module';
import { generateAdminToken, bearerHeader } from '../helpers/jwt.helper';

const mockCategoryService = {
  getList: vi.fn(),
  listWithChildren: vi.fn(),
  getItem: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  updateNavStatus: vi.fn(),
  updateShowStatus: vi.fn(),
};

@Module({
  imports: [TestPassportModule],
  controllers: [ProductCategoryController],
  providers: [
    { provide: ProductCategoryService, useValue: mockCategoryService },
  ],
})
class TestProductCategoryModule {}

describe('ProductCategory API (e2e)', () => {
  let app: INestApplication;
  const token = generateAdminToken();

  beforeAll(async () => {
    app = await createTestApp(TestProductCategoryModule);
  });

  afterAll(() => app?.close());
  beforeEach(() => vi.clearAllMocks());

  // ProductCategoryController: @Controller('productCategory')，无版本号
  const baseUrl = '/api/productCategory';

  describe('GET /list/:parentId', () => {
    it('按父级获取分类列表 → 200', async () => {
      mockCategoryService.getList.mockResolvedValue({
        list: [{ id: 1, name: '手机数码', parentId: 0 }],
        total: 1,
        pageNum: 1,
        pageSize: 10,
      });

      const res = await request(app.getHttpServer())
        .get(`${baseUrl}/list/0`)
        .set('Authorization', bearerHeader(token))
        .query({ pageNum: 1, pageSize: 10 })
        .expect(200);

      expect(res.body.code).toBe(200);
    });
  });

  describe('GET /withChildren', () => {
    it('获取树形分类列表 → 200', async () => {
      mockCategoryService.listWithChildren.mockResolvedValue([
        { id: 1, name: '手机数码', children: [] },
      ]);

      const res = await request(app.getHttpServer())
        .get(`${baseUrl}/withChildren`)
        .set('Authorization', bearerHeader(token))
        .expect(200);

      expect(res.body.code).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
    });
  });

  describe('POST /create', () => {
    it('创建分类 → 200', async () => {
      mockCategoryService.create.mockResolvedValue({ id: 10 });

      const res = await request(app.getHttpServer())
        .post(`${baseUrl}/create`)
        .set('Authorization', bearerHeader(token))
        .send({ name: '新分类', parentId: 0 })
        .expect(200);

      expect(res.body.code).toBe(200);
    });
  });

  describe('POST /update/:id', () => {
    it('更新分类 → 200', async () => {
      mockCategoryService.update.mockResolvedValue(1);

      const res = await request(app.getHttpServer())
        .post(`${baseUrl}/update/1`)
        .set('Authorization', bearerHeader(token))
        .send({ name: '修改分类名' })
        .expect(200);

      expect(res.body.code).toBe(200);
    });
  });

  describe('无 token', () => {
    it('GET /list/:parentId → 401', async () => {
      const res = await request(app.getHttpServer())
        .get(`${baseUrl}/list/0`)
        .expect(401);

      expect(res.body.code).toBe(401);
    });
  });
});
