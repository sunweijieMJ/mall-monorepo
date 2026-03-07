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

import { OrderSettingService } from '@/modules/oms/order-setting/order-setting.service';
import { OrderSettingController } from '@/modules/oms/order-setting/order-setting.controller';

import { createTestApp } from '../helpers/create-test-app';
import { TestPassportModule } from '../helpers/test-passport.module';
import { generateAdminToken, bearerHeader } from '../helpers/jwt.helper';

const mockService = {
  getItem: vi.fn(),
  update: vi.fn(),
};

@Module({
  imports: [TestPassportModule],
  controllers: [OrderSettingController],
  providers: [{ provide: OrderSettingService, useValue: mockService }],
})
class TestModule {}

describe('OrderSetting API (e2e)', () => {
  let app: INestApplication;
  const token = generateAdminToken();

  beforeAll(async () => {
    app = await createTestApp(TestModule);
  });

  afterAll(() => app?.close());
  beforeEach(() => vi.clearAllMocks());

  const baseUrl = '/api/v1/orderSetting';

  describe('GET /:id', () => {
    it('获取订单设置 → 200', async () => {
      mockService.getItem.mockResolvedValue({
        id: 1,
        flashOrderOvertime: 60,
        normalOrderOvertime: 120,
      });

      const res = await request(app.getHttpServer())
        .get(`${baseUrl}/1`)
        .set('Authorization', bearerHeader(token))
        .expect(200);

      expect(res.body.code).toBe(200);
      expect(res.body.data).toHaveProperty('flashOrderOvertime', 60);
    });

    it('无 token → 401', async () => {
      const res = await request(app.getHttpServer())
        .get(`${baseUrl}/1`)
        .expect(401);

      expect(res.body.code).toBe(401);
    });
  });

  describe('POST /update/:id', () => {
    it('更新订单设置 → 201', async () => {
      mockService.update.mockResolvedValue(undefined);

      const res = await request(app.getHttpServer())
        .post(`${baseUrl}/update/1`)
        .set('Authorization', bearerHeader(token))
        .send({ flashOrderOvertime: 30, normalOrderOvertime: 60 })
        .expect(201);

      expect(res.body.code).toBe(200);
      expect(mockService.update).toHaveBeenCalledWith(1, expect.any(Object));
    });
  });
});
