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

// PaymentController 直接 import { Request, Response } from 'express'
// pnpm strict 模式下 express 不在 apps/server/node_modules，
// 需要导出占位符（实际 HTTP 由 NestJS platform-express 处理）
vi.mock('express', () => ({
  Request: class {},
  Response: class {},
}));

import { PaymentService } from '@/modules/portal/payment/payment.service';
import { PaymentController } from '@/modules/portal/payment/payment.controller';

import { createTestApp } from '../helpers/create-test-app';
import { TestPassportModule } from '../helpers/test-passport.module';
import { generateMemberToken, bearerHeader } from '../helpers/jwt.helper';

const mockService = {
  createAlipayPayment: vi.fn(),
  handleAlipayNotify: vi.fn(),
};

@Module({
  imports: [TestPassportModule],
  controllers: [PaymentController],
  providers: [{ provide: PaymentService, useValue: mockService }],
})
class TestModule {}

describe('Payment API (e2e)', () => {
  let app: INestApplication;
  const token = generateMemberToken();

  beforeAll(async () => {
    app = await createTestApp(TestModule);
  });

  afterAll(() => app?.close());
  beforeEach(() => vi.clearAllMocks());

  const baseUrl = '/api/v1/portal/payment';

  describe('POST /alipay/pay', () => {
    it('创建支付宝支付 → 200', async () => {
      mockService.createAlipayPayment.mockResolvedValue(
        '<html>pay form</html>',
      );

      const res = await request(app.getHttpServer())
        .post(`${baseUrl}/alipay/pay`)
        .set('Authorization', bearerHeader(token))
        .send({ orderId: 1 })
        .expect(200);

      expect(res.body.code).toBe(200);
      expect(mockService.createAlipayPayment).toHaveBeenCalledWith(1, 1);
    });

    it('无 token → 401', async () => {
      const res = await request(app.getHttpServer())
        .post(`${baseUrl}/alipay/pay`)
        .send({ orderId: 1 })
        .expect(401);

      expect(res.body.code).toBe(401);
    });
  });

  describe('POST /alipay/notify', () => {
    it('支付宝回调成功 → 返回 success', async () => {
      mockService.handleAlipayNotify.mockResolvedValue(undefined);

      const res = await request(app.getHttpServer())
        .post(`${baseUrl}/alipay/notify`)
        .send({ trade_status: 'TRADE_SUCCESS', out_trade_no: 'ORDER001' })
        .expect(200);

      // @SkipResponseTransform 装饰器使响应不经过 ResponseInterceptor
      expect(res.text).toBe('success');
    });

    it('支付宝回调处理失败 → 返回 failure', async () => {
      mockService.handleAlipayNotify.mockRejectedValue(new Error('处理失败'));

      const res = await request(app.getHttpServer())
        .post(`${baseUrl}/alipay/notify`)
        .send({ trade_status: 'TRADE_SUCCESS', out_trade_no: 'ORDER002' })
        .expect(200);

      expect(res.text).toBe('failure');
    });
  });
});
