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

import { FlashPromotionService } from '@/modules/sms/flash-promotion/flash-promotion.service';
import {
  FlashPromotionController,
  FlashSessionController,
  FlashProductRelationController,
} from '@/modules/sms/flash-promotion/flash-promotion.controller';

import { createTestApp } from '../helpers/create-test-app';
import { TestPassportModule } from '../helpers/test-passport.module';
import { generateAdminToken, bearerHeader } from '../helpers/jwt.helper';

// mock 所有 FlashPromotionService 方法
const mockService = {
  // 秒杀活动
  createFlash: vi.fn(),
  updateFlash: vi.fn(),
  deleteFlash: vi.fn(),
  updateFlashStatus: vi.fn(),
  getFlashItem: vi.fn(),
  listFlash: vi.fn(),
  // 秒杀场次
  createSession: vi.fn(),
  updateSession: vi.fn(),
  updateSessionStatus: vi.fn(),
  deleteSession: vi.fn(),
  getSessionItem: vi.fn(),
  listSession: vi.fn(),
  selectList: vi.fn(),
  // 商品关联
  createRelation: vi.fn(),
  updateRelation: vi.fn(),
  deleteRelation: vi.fn(),
  getRelationItem: vi.fn(),
  listRelation: vi.fn(),
  getRelationCount: vi.fn(),
};

@Module({
  imports: [TestPassportModule],
  controllers: [
    FlashPromotionController,
    FlashSessionController,
    FlashProductRelationController,
  ],
  providers: [{ provide: FlashPromotionService, useValue: mockService }],
})
class TestFlashPromotionModule {}

describe('FlashPromotion API (e2e)', () => {
  let app: INestApplication;
  const token = generateAdminToken();

  beforeAll(async () => {
    app = await createTestApp(TestFlashPromotionModule);
  });

  afterAll(() => app?.close());
  beforeEach(() => vi.clearAllMocks());

  // ---- 秒杀活动 ----
  const flashBase = '/api/v1/admin/sms/flash-promotions';

  describe('GET /api/v1/admin/sms/flash-promotions', () => {
    const url = flashBase;

    it('无 token → 401', async () => {
      const res = await request(app.getHttpServer()).get(url).expect(401);
      expect(res.body.code).toBe(401);
    });

    it('分页查询秒杀活动列表 → 200', async () => {
      mockService.listFlash.mockResolvedValue({
        list: [{ id: 1, title: '618 秒杀' }],
        total: 1,
        pageNum: 1,
        pageSize: 5,
        totalPage: 1,
      });

      const res = await request(app.getHttpServer())
        .get(url)
        .set('Authorization', bearerHeader(token))
        .query({ pageNum: 1, pageSize: 5 })
        .expect(200);

      expect(res.body.code).toBe(200);
      expect(mockService.listFlash).toHaveBeenCalled();
    });
  });

  describe('POST /api/v1/admin/sms/flash-promotions', () => {
    it('添加秒杀活动 → 201', async () => {
      const dto = {
        title: '618 秒杀',
        startDate: '2026-06-01',
        endDate: '2026-06-18',
      };
      mockService.createFlash.mockResolvedValue({ id: 1, ...dto });

      const res = await request(app.getHttpServer())
        .post(flashBase)
        .set('Authorization', bearerHeader(token))
        .send(dto)
        .expect(200);

      expect(res.body.code).toBe(200);
      expect(mockService.createFlash).toHaveBeenCalled();
    });
  });

  describe('PUT /api/v1/admin/sms/flash-promotions/:id', () => {
    it('修改秒杀活动 → 200', async () => {
      mockService.updateFlash.mockResolvedValue(undefined);

      const res = await request(app.getHttpServer())
        .put(`${flashBase}/1`)
        .set('Authorization', bearerHeader(token))
        .send({ title: '双11 秒杀' })
        .expect(200);

      expect(res.body.code).toBe(200);
      expect(mockService.updateFlash).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ title: '双11 秒杀' }),
      );
    });
  });

  describe('DELETE /api/v1/admin/sms/flash-promotions/:id', () => {
    it('删除秒杀活动 → 200', async () => {
      mockService.deleteFlash.mockResolvedValue(undefined);

      const res = await request(app.getHttpServer())
        .delete(`${flashBase}/1`)
        .set('Authorization', bearerHeader(token))
        .expect(200);

      expect(res.body.code).toBe(200);
      expect(mockService.deleteFlash).toHaveBeenCalledWith(1);
    });
  });

  // ---- 秒杀场次 ----
  const sessionBase = '/api/v1/admin/sms/flash-sessions';

  describe('GET /api/v1/admin/sms/flash-sessions', () => {
    it('获取全部场次 → 200', async () => {
      mockService.listSession.mockResolvedValue([
        { id: 1, name: '08:00 场', startTime: '08:00:00', endTime: '10:00:00' },
      ]);

      const res = await request(app.getHttpServer())
        .get(sessionBase)
        .set('Authorization', bearerHeader(token))
        .expect(200);

      expect(res.body.code).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });
  });

  describe('POST /api/v1/admin/sms/flash-sessions', () => {
    it('添加场次 → 201', async () => {
      const dto = {
        name: '10:00 场',
        startTime: '10:00:00',
        endTime: '12:00:00',
      };
      mockService.createSession.mockResolvedValue({ id: 2, ...dto });

      const res = await request(app.getHttpServer())
        .post(sessionBase)
        .set('Authorization', bearerHeader(token))
        .send(dto)
        .expect(200);

      expect(res.body.code).toBe(200);
      expect(mockService.createSession).toHaveBeenCalled();
    });
  });

  // ---- 秒杀商品关联 ----
  const relationBase = '/api/v1/admin/sms/flash-product-relations';

  describe('GET /api/v1/admin/sms/flash-product-relations', () => {
    it('分页查询商品关联 → 200', async () => {
      mockService.listRelation.mockResolvedValue({
        list: [],
        total: 0,
        pageNum: 1,
        pageSize: 5,
        totalPage: 0,
      });

      const res = await request(app.getHttpServer())
        .get(relationBase)
        .set('Authorization', bearerHeader(token))
        .query({
          flashPromotionId: 1,
          flashPromotionSessionId: 1,
          pageNum: 1,
          pageSize: 5,
        })
        .expect(200);

      expect(res.body.code).toBe(200);
      expect(mockService.listRelation).toHaveBeenCalled();
    });
  });

  describe('POST /api/v1/admin/sms/flash-product-relations', () => {
    it('批量添加商品关联 → 201', async () => {
      const dto = [
        {
          flashPromotionId: 1,
          flashPromotionSessionId: 1,
          productId: 100,
          flashPromotionPrice: 99.0,
          flashPromotionCount: 50,
          flashPromotionLimit: 1,
        },
      ];
      mockService.createRelation.mockResolvedValue([{ id: 1, ...dto[0] }]);

      const res = await request(app.getHttpServer())
        .post(relationBase)
        .set('Authorization', bearerHeader(token))
        .send(dto)
        .expect(200);

      expect(res.body.code).toBe(200);
      expect(mockService.createRelation).toHaveBeenCalled();
    });

    it('不传 flashPromotionPrice → undefined', async () => {
      const dto = [
        {
          flashPromotionId: 1,
          flashPromotionSessionId: 1,
          productId: 100,
          flashPromotionCount: 50,
          flashPromotionLimit: 1,
        },
      ];
      mockService.createRelation.mockResolvedValue([{ id: 1 }]);

      const res = await request(app.getHttpServer())
        .post(relationBase)
        .set('Authorization', bearerHeader(token))
        .send(dto)
        .expect(200);

      expect(res.body.code).toBe(200);
      // flashPromotionPrice 为 null/undefined 时应传 undefined
      expect(mockService.createRelation).toHaveBeenCalledWith([
        expect.objectContaining({ flashPromotionPrice: undefined }),
      ]);
    });
  });

  describe('PUT /api/v1/admin/sms/flash-product-relations/:id', () => {
    it('修改关联信息（含价格）→ 200', async () => {
      mockService.updateRelation.mockResolvedValue(undefined);

      const res = await request(app.getHttpServer())
        .put(`${relationBase}/1`)
        .set('Authorization', bearerHeader(token))
        .send({ flashPromotionPrice: 88.8, flashPromotionCount: 100 })
        .expect(200);

      expect(res.body.code).toBe(200);
      // 验证 price 被转为 string
      expect(mockService.updateRelation).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ flashPromotionPrice: '88.8' }),
      );
    });

    it('修改关联信息（不含价格）→ 200', async () => {
      mockService.updateRelation.mockResolvedValue(undefined);

      const res = await request(app.getHttpServer())
        .put(`${relationBase}/1`)
        .set('Authorization', bearerHeader(token))
        .send({ flashPromotionCount: 200 })
        .expect(200);

      expect(res.body.code).toBe(200);
      expect(mockService.updateRelation).toHaveBeenCalled();
    });
  });

  describe('PUT /api/v1/admin/sms/flash-promotions/:id/status', () => {
    it('修改活动上下线状态 → 200', async () => {
      mockService.updateFlashStatus.mockResolvedValue(undefined);

      const res = await request(app.getHttpServer())
        .put(`${flashBase}/1/status`)
        .set('Authorization', bearerHeader(token))
        .send({ status: 1 })
        .expect(200);

      expect(res.body.code).toBe(200);
    });
  });

  describe('GET /api/v1/admin/sms/flash-sessions/options', () => {
    it('获取全部可选场次 → 200', async () => {
      mockService.selectList.mockResolvedValue([
        { id: 1, name: '08:00 场', productCount: 5 },
      ]);

      const res = await request(app.getHttpServer())
        .get(`${sessionBase}/options`)
        .set('Authorization', bearerHeader(token))
        .query({ flashPromotionId: '1' })
        .expect(200);

      expect(res.body.code).toBe(200);
    });
  });

  describe('PUT /api/v1/admin/sms/flash-sessions/:id/status', () => {
    it('修改场次启用状态 → 200', async () => {
      mockService.updateSessionStatus.mockResolvedValue(undefined);

      const res = await request(app.getHttpServer())
        .put(`${sessionBase}/1/status`)
        .set('Authorization', bearerHeader(token))
        .send({ status: 1 })
        .expect(200);

      expect(res.body.code).toBe(200);
    });
  });

  describe('DELETE /api/v1/admin/sms/flash-sessions/:id', () => {
    it('删除场次 → 200', async () => {
      mockService.deleteSession.mockResolvedValue(undefined);

      const res = await request(app.getHttpServer())
        .delete(`${sessionBase}/1`)
        .set('Authorization', bearerHeader(token))
        .expect(200);

      expect(res.body.code).toBe(200);
    });
  });
});
