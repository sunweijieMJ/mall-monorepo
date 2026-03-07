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

import { SkuStockService } from '@/modules/pms/sku-stock/sku-stock.service';
import { SkuStockController } from '@/modules/pms/sku-stock/sku-stock.controller';

import { createTestApp } from '../helpers/create-test-app';
import { TestPassportModule } from '../helpers/test-passport.module';
import { generateAdminToken, bearerHeader } from '../helpers/jwt.helper';

const mockService = {
  getList: vi.fn(),
  update: vi.fn(),
};

@Module({
  imports: [TestPassportModule],
  controllers: [SkuStockController],
  providers: [{ provide: SkuStockService, useValue: mockService }],
})
class TestSkuStockModule {}

describe('SkuStock API (e2e)', () => {
  let app: INestApplication;
  const token = generateAdminToken();

  beforeAll(async () => {
    app = await createTestApp(TestSkuStockModule);
  });

  afterAll(() => app?.close());
  beforeEach(() => vi.clearAllMocks());

  const baseUrl = '/api/sku/stock';

  describe('GET /:pid', () => {
    it('查询 SKU 库存列表 → 200', async () => {
      mockService.getList.mockResolvedValue([
        { id: 1, skuCode: 'SP001', stock: 100 },
      ]);

      const res = await request(app.getHttpServer())
        .get(`${baseUrl}/1`)
        .set('Authorization', bearerHeader(token))
        .expect(200);

      expect(res.body.code).toBe(200);
      expect(mockService.getList).toHaveBeenCalledWith(1, undefined);
    });

    it('带关键词查询 → 200', async () => {
      mockService.getList.mockResolvedValue([]);

      const res = await request(app.getHttpServer())
        .get(`${baseUrl}/1`)
        .set('Authorization', bearerHeader(token))
        .query({ keyword: 'SP' })
        .expect(200);

      expect(res.body.code).toBe(200);
      expect(mockService.getList).toHaveBeenCalledWith(1, 'SP');
    });
  });

  describe('POST /update/:pid', () => {
    it('批量更新 SKU 库存 → 200', async () => {
      mockService.update.mockResolvedValue(undefined);

      const res = await request(app.getHttpServer())
        .post(`${baseUrl}/update/1`)
        .set('Authorization', bearerHeader(token))
        .send([
          {
            id: 1,
            skuCode: 'SP001',
            stock: 200,
            price: 99.9,
            promotionPrice: 79.9,
          },
        ])
        .expect(200);

      expect(res.body.code).toBe(200);
      // 验证 price/promotionPrice 被转为 string
      expect(mockService.update).toHaveBeenCalledWith(1, [
        expect.objectContaining({ price: '99.9', promotionPrice: '79.9' }),
      ]);
    });

    it('price 为 null 时不传 → 200', async () => {
      mockService.update.mockResolvedValue(undefined);

      const res = await request(app.getHttpServer())
        .post(`${baseUrl}/update/1`)
        .set('Authorization', bearerHeader(token))
        .send([{ id: 1, skuCode: 'SP001', stock: 200 }])
        .expect(200);

      expect(res.body.code).toBe(200);
    });
  });

  describe('无 token', () => {
    it('GET /:pid → 401', async () => {
      const res = await request(app.getHttpServer())
        .get(`${baseUrl}/1`)
        .expect(401);

      expect(res.body.code).toBe(401);
    });
  });
});
