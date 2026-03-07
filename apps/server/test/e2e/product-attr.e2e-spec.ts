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

import { ProductAttrService } from '@/modules/pms/product-attr/product-attr.service';
import {
  ProductAttrCategoryController,
  ProductAttrController,
} from '@/modules/pms/product-attr/product-attr.controller';

import { createTestApp } from '../helpers/create-test-app';
import { TestPassportModule } from '../helpers/test-passport.module';
import { generateAdminToken, bearerHeader } from '../helpers/jwt.helper';

const mockService = {
  createAttrCategory: vi.fn(),
  updateAttrCategory: vi.fn(),
  deleteAttrCategory: vi.fn(),
  listAttrCategory: vi.fn(),
  listAttrCategoryWithAttr: vi.fn(),
  createAttr: vi.fn(),
  updateAttr: vi.fn(),
  deleteAttr: vi.fn(),
  listAttr: vi.fn(),
  getAttrItem: vi.fn(),
};

@Module({
  imports: [TestPassportModule],
  controllers: [ProductAttrCategoryController, ProductAttrController],
  providers: [{ provide: ProductAttrService, useValue: mockService }],
})
class TestProductAttrModule {}

describe('ProductAttr API (e2e)', () => {
  let app: INestApplication;
  const token = generateAdminToken();

  beforeAll(async () => {
    app = await createTestApp(TestProductAttrModule);
  });

  afterAll(() => app?.close());
  beforeEach(() => vi.clearAllMocks());

  // ======================== 属性分类 ========================

  const catUrl = '/api/productAttributeCategory';

  describe('POST /productAttributeCategory/create', () => {
    it('创建属性分类 → 200', async () => {
      mockService.createAttrCategory.mockResolvedValue({ id: 1 });

      const res = await request(app.getHttpServer())
        .post(`${catUrl}/create`)
        .set('Authorization', bearerHeader(token))
        .send({ name: '规格' })
        .expect(200);

      expect(res.body.code).toBe(200);
      expect(mockService.createAttrCategory).toHaveBeenCalled();
    });
  });

  describe('POST /productAttributeCategory/update/:id', () => {
    it('更新属性分类 → 200', async () => {
      mockService.updateAttrCategory.mockResolvedValue(undefined);

      const res = await request(app.getHttpServer())
        .post(`${catUrl}/update/1`)
        .set('Authorization', bearerHeader(token))
        .send({ name: '参数' })
        .expect(200);

      expect(res.body.code).toBe(200);
    });
  });

  describe('POST /productAttributeCategory/delete/:id', () => {
    it('删除属性分类 → 200', async () => {
      mockService.deleteAttrCategory.mockResolvedValue(undefined);

      const res = await request(app.getHttpServer())
        .post(`${catUrl}/delete/1`)
        .set('Authorization', bearerHeader(token))
        .expect(200);

      expect(res.body.code).toBe(200);
    });
  });

  describe('GET /productAttributeCategory/list', () => {
    it('分页获取属性分类 → 200', async () => {
      mockService.listAttrCategory.mockResolvedValue({
        list: [{ id: 1, name: '规格' }],
        total: 1,
      });

      const res = await request(app.getHttpServer())
        .get(`${catUrl}/list`)
        .set('Authorization', bearerHeader(token))
        .query({ pageNum: 1, pageSize: 10 })
        .expect(200);

      expect(res.body.code).toBe(200);
    });
  });

  describe('GET /productAttributeCategory/listWithAttr', () => {
    it('获取属性分类含属性 → 200', async () => {
      mockService.listAttrCategoryWithAttr.mockResolvedValue([]);

      const res = await request(app.getHttpServer())
        .get(`${catUrl}/listWithAttr`)
        .set('Authorization', bearerHeader(token))
        .expect(200);

      expect(res.body.code).toBe(200);
    });
  });

  // ======================== 商品属性 ========================

  const attrUrl = '/api/productAttribute';

  describe('POST /productAttribute/create', () => {
    it('创建商品属性 → 200', async () => {
      mockService.createAttr.mockResolvedValue({ id: 1 });

      const res = await request(app.getHttpServer())
        .post(`${attrUrl}/create`)
        .set('Authorization', bearerHeader(token))
        .send({ name: '颜色', productAttributeCategoryId: 1, type: 0 })
        .expect(200);

      expect(res.body.code).toBe(200);
    });
  });

  describe('POST /productAttribute/update/:id', () => {
    it('更新商品属性 → 200', async () => {
      mockService.updateAttr.mockResolvedValue(undefined);

      const res = await request(app.getHttpServer())
        .post(`${attrUrl}/update/1`)
        .set('Authorization', bearerHeader(token))
        .send({ name: '尺码' })
        .expect(200);

      expect(res.body.code).toBe(200);
    });
  });

  describe('POST /productAttribute/delete', () => {
    it('批量删除商品属性 → 200', async () => {
      mockService.deleteAttr.mockResolvedValue(undefined);

      const res = await request(app.getHttpServer())
        .post(`${attrUrl}/delete`)
        .set('Authorization', bearerHeader(token))
        .query({ ids: '1,2' })
        .expect(200);

      expect(res.body.code).toBe(200);
    });
  });

  describe('GET /productAttribute/list/:cid', () => {
    it('获取商品属性列表 → 200', async () => {
      mockService.listAttr.mockResolvedValue({
        list: [{ id: 1, name: '颜色' }],
        total: 1,
      });

      const res = await request(app.getHttpServer())
        .get(`${attrUrl}/list/1`)
        .set('Authorization', bearerHeader(token))
        .query({ type: '0', pageNum: 1, pageSize: 10 })
        .expect(200);

      expect(res.body.code).toBe(200);
    });
  });

  describe('GET /productAttribute/:id', () => {
    it('获取属性详情 → 200', async () => {
      mockService.getAttrItem.mockResolvedValue({ id: 1, name: '颜色' });

      const res = await request(app.getHttpServer())
        .get(`${attrUrl}/1`)
        .set('Authorization', bearerHeader(token))
        .expect(200);

      expect(res.body.code).toBe(200);
    });
  });

  describe('无 token', () => {
    it('POST /productAttribute/create → 401', async () => {
      const res = await request(app.getHttpServer())
        .post(`${attrUrl}/create`)
        .send({ name: '颜色' })
        .expect(401);

      expect(res.body.code).toBe(401);
    });
  });
});
