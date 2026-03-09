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

import { CartService } from '@/modules/portal/cart/cart.service';
import { OrderService } from '@/modules/oms/order/order.service';
import { CartController } from '@/modules/portal/cart/cart.controller';

import { createTestApp } from '../helpers/create-test-app';
import { TestPassportModule } from '../helpers/test-passport.module';
import { generateMemberToken, bearerHeader } from '../helpers/jwt.helper';

const mockCartService = {
  getCartList: vi.fn(),
  getCount: vi.fn(),
  add: vi.fn(),
  updateQuantity: vi.fn(),
  delete: vi.fn(),
  clear: vi.fn(),
  getCartProduct: vi.fn(),
  updateAttr: vi.fn(),
};

const mockOrderService = {
  listCartPromotion: vi.fn(),
};

@Module({
  imports: [TestPassportModule],
  controllers: [CartController],
  providers: [
    { provide: CartService, useValue: mockCartService },
    { provide: OrderService, useValue: mockOrderService },
  ],
})
class TestCartModule {}

describe('Cart API (e2e)', () => {
  let app: INestApplication;
  const token = generateMemberToken();

  beforeAll(async () => {
    app = await createTestApp(TestCartModule);
  });

  afterAll(() => app?.close());
  beforeEach(() => vi.clearAllMocks());

  const baseUrl = '/api/v1/portal/carts';

  describe('GET /', () => {
    it('无 token → 401', async () => {
      const res = await request(app.getHttpServer()).get(baseUrl).expect(401);
      expect(res.body.code).toBe(401);
    });

    it('获取购物车列表 → 200', async () => {
      mockCartService.getCartList.mockResolvedValue([
        { id: 1, productName: '商品A', quantity: 2 },
      ]);

      const res = await request(app.getHttpServer())
        .get(baseUrl)
        .set('Authorization', bearerHeader(token))
        .expect(200);

      expect(res.body.code).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });
  });

  describe('GET /count', () => {
    it('获取购物车数量 → 200', async () => {
      mockCartService.getCount.mockResolvedValue(5);

      const res = await request(app.getHttpServer())
        .get(`${baseUrl}/count`)
        .set('Authorization', bearerHeader(token))
        .expect(200);

      expect(res.body.code).toBe(200);
      expect(res.body.data).toBe(5);
    });
  });

  describe('POST /', () => {
    it('加入购物车 → 200', async () => {
      mockCartService.add.mockResolvedValue({ id: 1 });

      const res = await request(app.getHttpServer())
        .post(baseUrl)
        .set('Authorization', bearerHeader(token))
        .send({ productId: 100, productSkuId: 1, productQuantity: 1 })
        .expect(200);

      expect(res.body.code).toBe(200);
    });
  });

  describe('PUT /:id/quantity', () => {
    it('修改数量 → 200', async () => {
      mockCartService.updateQuantity.mockResolvedValue(1);

      const res = await request(app.getHttpServer())
        .put(`${baseUrl}/1/quantity`)
        .set('Authorization', bearerHeader(token))
        .send({ productQuantity: 3 })
        .expect(200);

      expect(res.body.code).toBe(200);
    });
  });

  describe('POST /batch-delete', () => {
    it('缺少 ids → 422', async () => {
      const res = await request(app.getHttpServer())
        .post(`${baseUrl}/batch-delete`)
        .set('Authorization', bearerHeader(token))
        .expect(422);

      expect(res.body.code).toBe(422);
    });

    it('删除购物车商品 → 200', async () => {
      mockCartService.delete.mockResolvedValue(1);

      const res = await request(app.getHttpServer())
        .post(`${baseUrl}/batch-delete`)
        .set('Authorization', bearerHeader(token))
        .send({ ids: [1, 2] })
        .expect(200);

      expect(res.body.code).toBe(200);
    });
  });

  describe('DELETE /clear', () => {
    it('清空购物车 → 200', async () => {
      mockCartService.clear.mockResolvedValue(undefined);

      const res = await request(app.getHttpServer())
        .delete(`${baseUrl}/clear`)
        .set('Authorization', bearerHeader(token))
        .expect(200);

      expect(res.body.code).toBe(200);
    });
  });

  describe('GET /promotion', () => {
    it('获取含促销信息的列表 → 200', async () => {
      mockOrderService.listCartPromotion.mockResolvedValue([]);

      const res = await request(app.getHttpServer())
        .get(`${baseUrl}/promotion?cartIds=1,2`)
        .set('Authorization', bearerHeader(token))
        .expect(200);

      expect(res.body.code).toBe(200);
    });
  });

  describe('GET /product/:productId', () => {
    it('获取商品规格 → 200', async () => {
      mockCartService.getCartProduct.mockResolvedValue({
        id: 100,
        name: '商品A',
        skuStockList: [],
      });

      const res = await request(app.getHttpServer())
        .get(`${baseUrl}/products/100`)
        .set('Authorization', bearerHeader(token))
        .expect(200);

      expect(res.body.code).toBe(200);
    });
  });
});
