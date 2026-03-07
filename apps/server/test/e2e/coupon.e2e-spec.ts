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

import { CouponService } from '@/modules/sms/coupon/coupon.service';
import {
  CouponController,
  CouponHistoryController,
} from '@/modules/sms/coupon/coupon.controller';

import { createTestApp } from '../helpers/create-test-app';
import { TestPassportModule } from '../helpers/test-passport.module';
import { generateAdminToken, bearerHeader } from '../helpers/jwt.helper';

// 创建 CouponService mock
const mockCouponService = {
  list: vi.fn(),
  detail: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  listHistory: vi.fn(),
};

@Module({
  imports: [TestPassportModule],
  controllers: [CouponController, CouponHistoryController],
  providers: [{ provide: CouponService, useValue: mockCouponService }],
})
class TestCouponModule {}

describe('Coupon API (e2e)', () => {
  let app: INestApplication;
  const token = generateAdminToken();

  beforeAll(async () => {
    app = await createTestApp(TestCouponModule);
  });

  afterAll(() => app?.close());
  beforeEach(() => vi.clearAllMocks());

  // ======================== 优惠券 CRUD ========================

  describe('GET /api/v1/admin/sms/coupons/list', () => {
    const url = '/api/v1/admin/sms/coupons/list';

    it('无 token → 401', async () => {
      const res = await request(app.getHttpServer()).get(url).expect(401);
      expect(res.body.code).toBe(401);
    });

    it('正常查询 → 200 + 分页数据', async () => {
      mockCouponService.list.mockResolvedValue({
        list: [{ id: 1, name: '满100减10' }],
        total: 1,
        pageNum: 1,
        pageSize: 10,
      });

      const res = await request(app.getHttpServer())
        .get(url)
        .set('Authorization', bearerHeader(token))
        .query({ pageNum: 1, pageSize: 10 })
        .expect(200);

      expect(res.body.code).toBe(200);
      expect(res.body.data.list).toHaveLength(1);
    });
  });

  describe('GET /api/v1/admin/sms/coupons/:id', () => {
    it('查询详情 → 200', async () => {
      mockCouponService.detail.mockResolvedValue({
        id: 1,
        name: '满100减10',
        productRelationList: [],
        productCategoryRelationList: [],
      });

      const res = await request(app.getHttpServer())
        .get('/api/v1/admin/sms/coupons/1')
        .set('Authorization', bearerHeader(token))
        .expect(200);

      expect(res.body.code).toBe(200);
      expect(res.body.data.name).toBe('满100减10');
    });
  });

  describe('POST /api/v1/admin/sms/coupons/create', () => {
    it('创建优惠券 → 200', async () => {
      mockCouponService.create.mockResolvedValue({ id: 1 });

      const res = await request(app.getHttpServer())
        .post('/api/v1/admin/sms/coupons/create')
        .set('Authorization', bearerHeader(token))
        .send({ name: '新券', amount: 10, minPoint: 100, type: 0 })
        .expect(201);

      expect(res.body.code).toBe(200);
    });
  });

  describe('POST /api/v1/admin/sms/coupons/update/:id', () => {
    it('更新优惠券 → 200', async () => {
      mockCouponService.update.mockResolvedValue(1);

      const res = await request(app.getHttpServer())
        .post('/api/v1/admin/sms/coupons/update/1')
        .set('Authorization', bearerHeader(token))
        .send({ name: '修改后的券' })
        .expect(201);

      expect(res.body.code).toBe(200);
    });
  });

  describe('POST /api/v1/admin/sms/coupons/delete/:id', () => {
    it('删除优惠券 → 200', async () => {
      mockCouponService.delete.mockResolvedValue(1);

      const res = await request(app.getHttpServer())
        .post('/api/v1/admin/sms/coupons/delete/1')
        .set('Authorization', bearerHeader(token))
        .expect(201);

      expect(res.body.code).toBe(200);
    });
  });

  // ======================== 优惠券领取记录 ========================

  describe('GET /api/v1/admin/sms/coupon-histories/list', () => {
    it('查询记录 → 200', async () => {
      mockCouponService.listHistory.mockResolvedValue({
        list: [],
        total: 0,
        pageNum: 1,
        pageSize: 10,
      });

      const res = await request(app.getHttpServer())
        .get('/api/v1/admin/sms/coupon-histories/list')
        .set('Authorization', bearerHeader(token))
        .query({ pageNum: 1, pageSize: 10 })
        .expect(200);

      expect(res.body.code).toBe(200);
      expect(res.body.data.list).toEqual([]);
    });
  });
});
