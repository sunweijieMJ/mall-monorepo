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

import { MemberService } from '@/modules/portal/member/member.service';
import {
  MemberInfoController,
  MemberAddressController,
  MemberCouponController,
  PortalCouponController,
} from '@/modules/portal/member/member.controller';

import { createTestApp } from '../helpers/create-test-app';
import { TestPassportModule } from '../helpers/test-passport.module';
import { generateMemberToken, bearerHeader } from '../helpers/jwt.helper';

const mockMemberService = {
  getCurrentMember: vi.fn(),
  updateInfo: vi.fn(),
  listAddress: vi.fn(),
  getAddress: vi.fn(),
  addAddress: vi.fn(),
  updateAddress: vi.fn(),
  deleteAddress: vi.fn(),
  addCoupon: vi.fn(),
  listCouponObjects: vi.fn(),
  listMemberCoupons: vi.fn(),
  listCouponsByProduct: vi.fn(),
  listCartCoupons: vi.fn(),
  listAvailableCoupons: vi.fn(),
};

@Module({
  imports: [TestPassportModule],
  controllers: [
    MemberInfoController,
    MemberAddressController,
    MemberCouponController,
    PortalCouponController,
  ],
  providers: [{ provide: MemberService, useValue: mockMemberService }],
})
class TestMemberModule {}

describe('Member API (e2e)', () => {
  let app: INestApplication;
  const token = generateMemberToken();

  beforeAll(async () => {
    app = await createTestApp(TestMemberModule);
  });

  afterAll(() => app?.close());
  beforeEach(() => vi.clearAllMocks());

  // ======================== 会员信息 ========================

  describe('GET /api/v1/portal/sso/info', () => {
    const url = '/api/v1/portal/sso/info';

    it('无 token → 401', async () => {
      const res = await request(app.getHttpServer()).get(url).expect(401);
      expect(res.body.code).toBe(401);
    });

    it('获取会员信息 → 200', async () => {
      mockMemberService.getCurrentMember.mockResolvedValue({
        id: 1,
        username: 'test-member',
        nickname: '测试会员',
      });

      const res = await request(app.getHttpServer())
        .get(url)
        .set('Authorization', bearerHeader(token))
        .expect(200);

      expect(res.body.code).toBe(200);
      expect(res.body.data.username).toBe('test-member');
    });
  });

  describe('POST /api/v1/portal/sso/update', () => {
    it('更新会员信息 → 200', async () => {
      mockMemberService.updateInfo.mockResolvedValue(1);

      const res = await request(app.getHttpServer())
        .post('/api/v1/portal/sso/update')
        .set('Authorization', bearerHeader(token))
        .send({ nickname: '新昵称' })
        .expect(200);

      expect(res.body.code).toBe(200);
    });
  });

  // ======================== 收货地址 ========================

  describe('GET /api/v1/portal/member/address/list', () => {
    it('获取地址列表 → 200', async () => {
      mockMemberService.listAddress.mockResolvedValue([
        { id: 1, name: '张三', phoneNumber: '13800138000' },
      ]);

      const res = await request(app.getHttpServer())
        .get('/api/v1/portal/member/address/list')
        .set('Authorization', bearerHeader(token))
        .expect(200);

      expect(res.body.code).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });
  });

  describe('POST /api/v1/portal/member/address/add', () => {
    it('添加地址 → 200', async () => {
      mockMemberService.addAddress.mockResolvedValue({ id: 1 });

      const res = await request(app.getHttpServer())
        .post('/api/v1/portal/member/address/add')
        .set('Authorization', bearerHeader(token))
        .send({ name: '李四', phoneNumber: '13900139000', city: '北京' })
        .expect(201);

      expect(res.body.code).toBe(200);
    });
  });

  describe('POST /api/v1/portal/member/address/delete/:id', () => {
    it('删除地址 → 200', async () => {
      mockMemberService.deleteAddress.mockResolvedValue(1);

      const res = await request(app.getHttpServer())
        .post('/api/v1/portal/member/address/delete/1')
        .set('Authorization', bearerHeader(token))
        .expect(201);

      expect(res.body.code).toBe(200);
    });
  });

  describe('GET /api/v1/portal/member/address/:id', () => {
    it('获取地址详情 → 200', async () => {
      mockMemberService.getAddress.mockResolvedValue({
        id: 1,
        name: '张三',
        phoneNumber: '13800138000',
      });

      const res = await request(app.getHttpServer())
        .get('/api/v1/portal/member/address/1')
        .set('Authorization', bearerHeader(token))
        .expect(200);

      expect(res.body.code).toBe(200);
      expect(res.body.data).toHaveProperty('name', '张三');
    });
  });

  describe('POST /api/v1/portal/member/address/update/:id', () => {
    it('更新地址 → 201', async () => {
      mockMemberService.updateAddress.mockResolvedValue(1);

      const res = await request(app.getHttpServer())
        .post('/api/v1/portal/member/address/update/1')
        .set('Authorization', bearerHeader(token))
        .send({ name: '李四', phoneNumber: '13900139000' })
        .expect(201);

      expect(res.body.code).toBe(200);
    });
  });

  // ======================== 会员优惠券 ========================

  describe('POST /api/v1/portal/member/coupons/:couponId', () => {
    it('领取优惠券 → 200', async () => {
      mockMemberService.addCoupon.mockResolvedValue(undefined);

      const res = await request(app.getHttpServer())
        .post('/api/v1/portal/member/coupons/1')
        .set('Authorization', bearerHeader(token))
        .expect(201);

      expect(res.body.code).toBe(200);
    });
  });

  describe('GET /api/v1/portal/member/coupons/list', () => {
    it('查询我的优惠券（不传 useStatus）→ 200', async () => {
      mockMemberService.listCouponObjects.mockResolvedValue([
        { id: 1, name: '满100减10' },
      ]);

      const res = await request(app.getHttpServer())
        .get('/api/v1/portal/member/coupons/list')
        .set('Authorization', bearerHeader(token))
        .expect(200);

      expect(res.body.code).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(mockMemberService.listCouponObjects).toHaveBeenCalledWith(
        1,
        undefined,
      );
    });

    it('查询我的优惠券（传 useStatus=0）→ 200', async () => {
      mockMemberService.listCouponObjects.mockResolvedValue([]);

      const res = await request(app.getHttpServer())
        .get('/api/v1/portal/member/coupons/list')
        .set('Authorization', bearerHeader(token))
        .query({ useStatus: '0' })
        .expect(200);

      expect(res.body.code).toBe(200);
      expect(mockMemberService.listCouponObjects).toHaveBeenCalledWith(1, 0);
    });
  });

  describe('GET /api/v1/portal/member/coupons/listHistory', () => {
    it('优惠券历史（不传 useStatus）→ 200', async () => {
      mockMemberService.listMemberCoupons.mockResolvedValue([]);

      const res = await request(app.getHttpServer())
        .get('/api/v1/portal/member/coupons/listHistory')
        .set('Authorization', bearerHeader(token))
        .expect(200);

      expect(res.body.code).toBe(200);
      expect(mockMemberService.listMemberCoupons).toHaveBeenCalledWith(
        1,
        undefined,
      );
    });

    it('优惠券历史（传 useStatus=1）→ 200', async () => {
      mockMemberService.listMemberCoupons.mockResolvedValue([]);

      const res = await request(app.getHttpServer())
        .get('/api/v1/portal/member/coupons/listHistory')
        .set('Authorization', bearerHeader(token))
        .query({ useStatus: '1' })
        .expect(200);

      expect(res.body.code).toBe(200);
      expect(mockMemberService.listMemberCoupons).toHaveBeenCalledWith(1, 1);
    });
  });

  describe('GET /api/v1/portal/member/coupons/product/:productId', () => {
    it('查询商品可用优惠券 → 200', async () => {
      mockMemberService.listCouponsByProduct.mockResolvedValue([
        { id: 1, name: '商品专用券' },
      ]);

      const res = await request(app.getHttpServer())
        .get('/api/v1/portal/member/coupons/product/1')
        .set('Authorization', bearerHeader(token))
        .expect(200);

      expect(res.body.code).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });
  });

  describe('GET /api/v1/portal/member/coupons/listCart', () => {
    it('缺少 cartIds → 400', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/portal/member/coupons/listCart')
        .set('Authorization', bearerHeader(token))
        .expect(400);

      expect(res.body.code).toBe(400);
    });

    it('cartIds 全部无效 → 返回空数组', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/portal/member/coupons/listCart')
        .set('Authorization', bearerHeader(token))
        .query({ cartIds: '0,-1' })
        .expect(200);

      expect(res.body.data).toEqual([]);
    });

    it('cartIds 有效 → 200', async () => {
      mockMemberService.listCartCoupons.mockResolvedValue([
        { id: 1, name: '满减券' },
      ]);

      const res = await request(app.getHttpServer())
        .get('/api/v1/portal/member/coupons/listCart')
        .set('Authorization', bearerHeader(token))
        .query({ cartIds: '1,2,3' })
        .expect(200);

      expect(res.body.code).toBe(200);
      expect(mockMemberService.listCartCoupons).toHaveBeenCalledWith(
        1,
        [1, 2, 3],
      );
    });
  });

  // ======================== 公开接口（领券中心） ========================

  describe('GET /api/v1/portal/coupons', () => {
    it('无 token 也能访问（@Public）→ 200', async () => {
      mockMemberService.listAvailableCoupons.mockResolvedValue([
        { id: 1, name: '新人券' },
      ]);

      const res = await request(app.getHttpServer())
        .get('/api/v1/portal/coupons')
        .expect(200);

      expect(res.body.code).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });
  });
});
