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

import { PortalProductService } from '@/modules/portal/product/portal-product.service';
import { PortalProductController } from '@/modules/portal/product/portal-product.controller';

import { createTestApp } from '../helpers/create-test-app';
import { TestPassportModule } from '../helpers/test-passport.module';

const mockService = {
  search: vi.fn(),
  categoryTreeList: vi.fn(),
  detail: vi.fn(),
};

@Module({
  imports: [TestPassportModule],
  controllers: [PortalProductController],
  providers: [{ provide: PortalProductService, useValue: mockService }],
})
class TestPortalProductModule {}

describe('Portal Product API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp(TestPortalProductModule);
  });

  afterAll(() => app?.close());
  beforeEach(() => vi.clearAllMocks());

  const baseUrl = '/api/v1/portal/products';

  describe('GET /search', () => {
    it('搜索商品列表（@Public）→ 200', async () => {
      mockService.search.mockResolvedValue({
        list: [{ id: 1, name: '测试商品' }],
        total: 1,
      });

      const res = await request(app.getHttpServer())
        .get(`${baseUrl}/search`)
        .query({ pageNum: 1, pageSize: 10, keyword: '测试' })
        .expect(200);

      expect(res.body.code).toBe(200);
      expect(mockService.search).toHaveBeenCalled();
    });

    it('带品牌和分类过滤 → 200', async () => {
      mockService.search.mockResolvedValue({ list: [], total: 0 });

      const res = await request(app.getHttpServer())
        .get(`${baseUrl}/search`)
        .query({
          pageNum: 1,
          pageSize: 10,
          brandId: '1',
          productCategoryId: '2',
          sort: '3',
        })
        .expect(200);

      expect(res.body.code).toBe(200);
      // 验证参数转换
      expect(mockService.search).toHaveBeenCalledWith(
        expect.anything(),
        undefined,
        1,
        2,
        3,
      );
    });
  });

  describe('GET /categoryTreeList', () => {
    it('获取商品分类树（@Public）→ 200', async () => {
      mockService.categoryTreeList.mockResolvedValue([
        { id: 1, name: '服装', children: [{ id: 2, name: 'T恤' }] },
      ]);

      const res = await request(app.getHttpServer())
        .get(`${baseUrl}/categoryTreeList`)
        .expect(200);

      expect(res.body.code).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });
  });

  describe('GET /:id', () => {
    it('获取商品详情（@Public）→ 200', async () => {
      mockService.detail.mockResolvedValue({
        product: { id: 1, name: '测试商品' },
        brand: { id: 1, name: '品牌A' },
        skuStockList: [],
      });

      const res = await request(app.getHttpServer())
        .get(`${baseUrl}/1`)
        .expect(200);

      expect(res.body.code).toBe(200);
      expect(res.body.data).toHaveProperty('product');
    });
  });
});
