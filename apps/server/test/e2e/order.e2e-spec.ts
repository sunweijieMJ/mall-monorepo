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

import { OrderService } from '@/modules/oms/order/order.service';
import {
  AdminOrderController,
  PortalOrderController,
} from '@/modules/oms/order/order.controller';

import { createTestApp } from '../helpers/create-test-app';
import { TestPassportModule } from '../helpers/test-passport.module';
import {
  generateAdminToken,
  generateMemberToken,
  bearerHeader,
} from '../helpers/jwt.helper';

const mockOrderService = {
  adminList: vi.fn(),
  detail: vi.fn(),
  adminDelete: vi.fn(),
  delivery: vi.fn(),
  close: vi.fn(),
  updateReceiverInfo: vi.fn(),
  updateMoneyInfo: vi.fn(),
  updateNote: vi.fn(),
  generateConfirmOrder: vi.fn(),
  generateOrder: vi.fn(),
  memberList: vi.fn(),
  paySuccess: vi.fn(),
  cancelOrder: vi.fn(),
  confirmReceive: vi.fn(),
  deleteOrder: vi.fn(),
};

@Module({
  imports: [TestPassportModule],
  controllers: [AdminOrderController, PortalOrderController],
  providers: [{ provide: OrderService, useValue: mockOrderService }],
})
class TestOrderModule {}

describe('Order API (e2e)', () => {
  let app: INestApplication;
  const adminToken = generateAdminToken();
  const memberToken = generateMemberToken();

  beforeAll(async () => {
    app = await createTestApp(TestOrderModule);
  });

  afterAll(() => app?.close());
  beforeEach(() => vi.clearAllMocks());

  // ======================== 管理端 ========================

  describe('GET /api/v1/admin/oms/orders', () => {
    const url = '/api/v1/admin/oms/orders';

    it('无 token → 401', async () => {
      const res = await request(app.getHttpServer()).get(url).expect(401);
      expect(res.body.code).toBe(401);
    });

    it('订单列表 → 200', async () => {
      mockOrderService.adminList.mockResolvedValue({
        list: [{ id: 1, orderSn: 'OC202501010001' }],
        total: 1,
      });

      const res = await request(app.getHttpServer())
        .get(url)
        .set('Authorization', bearerHeader(adminToken))
        .query({ pageNum: 1, pageSize: 10 })
        .expect(200);

      expect(res.body.code).toBe(200);
      expect(res.body.data.list).toHaveLength(1);
    });
  });

  describe('GET /api/v1/admin/oms/orders/:id', () => {
    it('订单详情 → 200', async () => {
      mockOrderService.detail.mockResolvedValue({
        id: 1,
        orderSn: 'OC202501010001',
        orderItemList: [],
        historyList: [],
      });

      const res = await request(app.getHttpServer())
        .get('/api/v1/admin/oms/orders/1')
        .set('Authorization', bearerHeader(adminToken))
        .expect(200);

      expect(res.body.code).toBe(200);
      expect(res.body.data.orderSn).toBe('OC202501010001');
    });
  });

  describe('POST /api/v1/admin/oms/orders/delivery', () => {
    it('批量发货 → 200', async () => {
      mockOrderService.delivery.mockResolvedValue(1);

      const res = await request(app.getHttpServer())
        .post('/api/v1/admin/oms/orders/delivery')
        .set('Authorization', bearerHeader(adminToken))
        .send([{ orderId: 1, deliveryCompany: '顺丰', deliverySn: 'SF001' }])
        .expect(200);

      expect(res.body.code).toBe(200);
    });
  });

  describe('POST /api/v1/admin/oms/orders/close', () => {
    it('关闭订单 → 200', async () => {
      mockOrderService.close.mockResolvedValue(1);

      const res = await request(app.getHttpServer())
        .post('/api/v1/admin/oms/orders/close')
        .set('Authorization', bearerHeader(adminToken))
        .send({ ids: [1, 2], note: '手动关闭' })
        .expect(200);

      expect(res.body.code).toBe(200);
    });
  });

  describe('PUT /api/v1/admin/oms/orders/:id/note', () => {
    it('修改备注 → 200', async () => {
      mockOrderService.updateNote.mockResolvedValue(1);

      const res = await request(app.getHttpServer())
        .put('/api/v1/admin/oms/orders/1/note')
        .set('Authorization', bearerHeader(adminToken))
        .send({ note: '已联系客户', status: 1 })
        .expect(200);

      expect(res.body.code).toBe(200);
    });
  });

  describe('POST /api/v1/admin/oms/orders/batch-delete', () => {
    it('缺少 ids → 422', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/admin/oms/orders/batch-delete')
        .set('Authorization', bearerHeader(adminToken))
        .expect(422);

      expect(res.body.code).toBe(422);
    });

    it('批量删除 → 200', async () => {
      mockOrderService.adminDelete.mockResolvedValue(2);

      const res = await request(app.getHttpServer())
        .post('/api/v1/admin/oms/orders/batch-delete')
        .set('Authorization', bearerHeader(adminToken))
        .send({ ids: [1, 2] })
        .expect(200);

      expect(res.body.code).toBe(200);
    });
  });

  describe('PUT /api/v1/admin/oms/orders/:id/receiver-info', () => {
    it('修改收货人信息 → 200', async () => {
      mockOrderService.updateReceiverInfo.mockResolvedValue(1);

      const res = await request(app.getHttpServer())
        .put('/api/v1/admin/oms/orders/1/receiver-info')
        .set('Authorization', bearerHeader(adminToken))
        .send({
          receiverName: '张三',
          receiverPhone: '13800138000',
          receiverDetailAddress: '朝阳区某某路1号',
          receiverProvince: '北京',
          receiverCity: '北京市',
          receiverRegion: '朝阳区',
          status: 1,
        })
        .expect(200);

      expect(res.body.code).toBe(200);
    });
  });

  describe('PUT /api/v1/admin/oms/orders/:id/money-info', () => {
    it('修改费用信息 → 200', async () => {
      mockOrderService.updateMoneyInfo.mockResolvedValue(1);

      const res = await request(app.getHttpServer())
        .put('/api/v1/admin/oms/orders/1/money-info')
        .set('Authorization', bearerHeader(adminToken))
        .send({ freightAmount: 10, status: 1 })
        .expect(200);

      expect(res.body.code).toBe(200);
    });
  });

  // ======================== 移动端 ========================

  describe('POST /api/v1/portal/orders/confirm', () => {
    it('生成确认订单（带 cartIds）→ 201', async () => {
      mockOrderService.generateConfirmOrder.mockResolvedValue({
        cartPromotionItemList: [],
        memberReceiveAddressList: [],
      });

      const res = await request(app.getHttpServer())
        .post('/api/v1/portal/orders/confirm')
        .set('Authorization', bearerHeader(memberToken))
        .send({ cartIds: [1, 2] })
        .expect(200);

      expect(res.body.code).toBe(200);
      expect(mockOrderService.generateConfirmOrder).toHaveBeenCalledWith(
        1,
        [1, 2],
      );
    });

    it('生成确认订单（不传 cartIds）→ 201，默认空数组', async () => {
      mockOrderService.generateConfirmOrder.mockResolvedValue({});

      const res = await request(app.getHttpServer())
        .post('/api/v1/portal/orders/confirm')
        .set('Authorization', bearerHeader(memberToken))
        .send({})
        .expect(200);

      expect(res.body.code).toBe(200);
      expect(mockOrderService.generateConfirmOrder).toHaveBeenCalledWith(1, []);
    });
  });

  describe('POST /api/v1/portal/orders/generate', () => {
    it('提交订单 → 201', async () => {
      mockOrderService.generateOrder.mockResolvedValue({
        orderId: 1,
        orderSn: 'OC202501010001',
      });

      const res = await request(app.getHttpServer())
        .post('/api/v1/portal/orders/generate')
        .set('Authorization', bearerHeader(memberToken))
        .send({
          cartIds: [1],
          memberReceiveAddressId: 1,
          payType: 1,
          couponId: null,
        })
        .expect(200);

      expect(res.body.code).toBe(200);
    });
  });

  describe('GET /api/v1/portal/orders', () => {
    const url = '/api/v1/portal/orders';

    it('无 token → 401', async () => {
      const res = await request(app.getHttpServer()).get(url).expect(401);
      expect(res.body.code).toBe(401);
    });

    it('我的订单列表（不传 status）→ 200', async () => {
      mockOrderService.memberList.mockResolvedValue({
        list: [{ id: 1, orderSn: 'OC001' }],
        total: 1,
      });

      const res = await request(app.getHttpServer())
        .get(url)
        .set('Authorization', bearerHeader(memberToken))
        .query({ pageNum: 1, pageSize: 10 })
        .expect(200);

      expect(res.body.code).toBe(200);
    });

    it('我的订单列表（传 status=0）→ 200', async () => {
      mockOrderService.memberList.mockResolvedValue({
        list: [],
        total: 0,
      });

      const res = await request(app.getHttpServer())
        .get(url)
        .set('Authorization', bearerHeader(memberToken))
        .query({ pageNum: 1, pageSize: 10, status: '0' })
        .expect(200);

      expect(res.body.code).toBe(200);
    });
  });

  describe('GET /api/v1/portal/orders/:id', () => {
    it('移动端订单详情 → 200', async () => {
      mockOrderService.detail.mockResolvedValue({
        id: 1,
        orderSn: 'OC001',
        orderItemList: [],
      });

      const res = await request(app.getHttpServer())
        .get('/api/v1/portal/orders/1')
        .set('Authorization', bearerHeader(memberToken))
        .expect(200);

      expect(res.body.code).toBe(200);
      expect(mockOrderService.detail).toHaveBeenCalledWith(1, 1);
    });
  });

  describe('PUT /api/v1/portal/orders/:id/cancel', () => {
    it('取消订单 → 200', async () => {
      mockOrderService.cancelOrder.mockResolvedValue(1);

      const res = await request(app.getHttpServer())
        .put('/api/v1/portal/orders/1/cancel')
        .set('Authorization', bearerHeader(memberToken))
        .expect(200);

      expect(res.body.code).toBe(200);
    });
  });

  describe('PUT /api/v1/portal/orders/:id/confirm-receive', () => {
    it('确认收货 → 200', async () => {
      mockOrderService.confirmReceive.mockResolvedValue(1);

      const res = await request(app.getHttpServer())
        .put('/api/v1/portal/orders/1/confirm-receive')
        .set('Authorization', bearerHeader(memberToken))
        .expect(200);

      expect(res.body.code).toBe(200);
    });
  });

  describe('DELETE /api/v1/portal/orders/:id', () => {
    it('删除订单 → 200', async () => {
      mockOrderService.deleteOrder.mockResolvedValue(1);

      const res = await request(app.getHttpServer())
        .delete('/api/v1/portal/orders/1')
        .set('Authorization', bearerHeader(memberToken))
        .expect(200);

      expect(res.body.code).toBe(200);
    });
  });

  describe('PUT /api/v1/portal/orders/:id/pay', () => {
    it('支付成功回调 → 200', async () => {
      mockOrderService.paySuccess.mockResolvedValue(1);

      const res = await request(app.getHttpServer())
        .put('/api/v1/portal/orders/1/pay')
        .set('Authorization', bearerHeader(memberToken))
        .send({ payType: 1 })
        .expect(200);

      expect(res.body.code).toBe(200);
    });
  });
});
