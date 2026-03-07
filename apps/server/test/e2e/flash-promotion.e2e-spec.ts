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
  const flashBase = '/api/v1/flash';

  describe('GET /api/v1/flash/list', () => {
    const url = `${flashBase}/list`;

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

  describe('POST /api/v1/flash/create', () => {
    it('添加秒杀活动 → 201', async () => {
      const dto = {
        title: '618 秒杀',
        startDate: '2026-06-01',
        endDate: '2026-06-18',
      };
      mockService.createFlash.mockResolvedValue({ id: 1, ...dto });

      const res = await request(app.getHttpServer())
        .post(`${flashBase}/create`)
        .set('Authorization', bearerHeader(token))
        .send(dto)
        .expect(201);

      expect(res.body.code).toBe(200);
      expect(mockService.createFlash).toHaveBeenCalled();
    });
  });

  describe('POST /api/v1/flash/update/:id', () => {
    it('修改秒杀活动 → 201', async () => {
      mockService.updateFlash.mockResolvedValue(undefined);

      const res = await request(app.getHttpServer())
        .post(`${flashBase}/update/1`)
        .set('Authorization', bearerHeader(token))
        .send({ title: '双11 秒杀' })
        .expect(201);

      expect(res.body.code).toBe(200);
      expect(mockService.updateFlash).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ title: '双11 秒杀' }),
      );
    });
  });

  describe('POST /api/v1/flash/delete/:id', () => {
    it('删除秒杀活动 → 201', async () => {
      mockService.deleteFlash.mockResolvedValue(undefined);

      const res = await request(app.getHttpServer())
        .post(`${flashBase}/delete/1`)
        .set('Authorization', bearerHeader(token))
        .expect(201);

      expect(res.body.code).toBe(200);
      expect(mockService.deleteFlash).toHaveBeenCalledWith(1);
    });
  });

  // ---- 秒杀场次 ----
  const sessionBase = '/api/v1/flashSession';

  describe('GET /api/v1/flashSession/list', () => {
    it('获取全部场次 → 200', async () => {
      mockService.listSession.mockResolvedValue([
        { id: 1, name: '08:00 场', startTime: '08:00:00', endTime: '10:00:00' },
      ]);

      const res = await request(app.getHttpServer())
        .get(`${sessionBase}/list`)
        .set('Authorization', bearerHeader(token))
        .expect(200);

      expect(res.body.code).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });
  });

  describe('POST /api/v1/flashSession/create', () => {
    it('添加场次 → 201', async () => {
      const dto = {
        name: '10:00 场',
        startTime: '10:00:00',
        endTime: '12:00:00',
      };
      mockService.createSession.mockResolvedValue({ id: 2, ...dto });

      const res = await request(app.getHttpServer())
        .post(`${sessionBase}/create`)
        .set('Authorization', bearerHeader(token))
        .send(dto)
        .expect(201);

      expect(res.body.code).toBe(200);
      expect(mockService.createSession).toHaveBeenCalled();
    });
  });

  // ---- 秒杀商品关联 ----
  const relationBase = '/api/v1/flashProductRelation';

  describe('GET /api/v1/flashProductRelation/list', () => {
    it('分页查询商品关联 → 200', async () => {
      mockService.listRelation.mockResolvedValue({
        list: [],
        total: 0,
        pageNum: 1,
        pageSize: 5,
        totalPage: 0,
      });

      const res = await request(app.getHttpServer())
        .get(`${relationBase}/list`)
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

  describe('POST /api/v1/flashProductRelation/create', () => {
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
        .post(`${relationBase}/create`)
        .set('Authorization', bearerHeader(token))
        .send(dto)
        .expect(201);

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
        .post(`${relationBase}/create`)
        .set('Authorization', bearerHeader(token))
        .send(dto)
        .expect(201);

      expect(res.body.code).toBe(200);
      // flashPromotionPrice 为 null/undefined 时应传 undefined
      expect(mockService.createRelation).toHaveBeenCalledWith([
        expect.objectContaining({ flashPromotionPrice: undefined }),
      ]);
    });
  });

  describe('POST /api/v1/flashProductRelation/update/:id', () => {
    it('修改关联信息（含价格）→ 201', async () => {
      mockService.updateRelation.mockResolvedValue(undefined);

      const res = await request(app.getHttpServer())
        .post(`${relationBase}/update/1`)
        .set('Authorization', bearerHeader(token))
        .send({ flashPromotionPrice: 88.8, flashPromotionCount: 100 })
        .expect(201);

      expect(res.body.code).toBe(200);
      // 验证 price 被转为 string
      expect(mockService.updateRelation).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ flashPromotionPrice: '88.8' }),
      );
    });

    it('修改关联信息（不含价格）→ 201', async () => {
      mockService.updateRelation.mockResolvedValue(undefined);

      const res = await request(app.getHttpServer())
        .post(`${relationBase}/update/1`)
        .set('Authorization', bearerHeader(token))
        .send({ flashPromotionCount: 200 })
        .expect(201);

      expect(res.body.code).toBe(200);
      expect(mockService.updateRelation).toHaveBeenCalled();
    });
  });

  describe('POST /api/v1/flash/update/status/:id', () => {
    it('修改活动上下线状态 → 201', async () => {
      mockService.updateFlashStatus.mockResolvedValue(undefined);

      const res = await request(app.getHttpServer())
        .post(`${flashBase}/update/status/1`)
        .set('Authorization', bearerHeader(token))
        .query({ status: '1' })
        .expect(201);

      expect(res.body.code).toBe(200);
    });
  });

  describe('GET /api/v1/flashSession/selectList', () => {
    it('获取全部可选场次 → 200', async () => {
      mockService.selectList.mockResolvedValue([
        { id: 1, name: '08:00 场', productCount: 5 },
      ]);

      const res = await request(app.getHttpServer())
        .get(`${sessionBase}/selectList`)
        .set('Authorization', bearerHeader(token))
        .query({ flashPromotionId: '1' })
        .expect(200);

      expect(res.body.code).toBe(200);
    });
  });

  describe('POST /api/v1/flashSession/update/status/:id', () => {
    it('修改场次启用状态 → 201', async () => {
      mockService.updateSessionStatus.mockResolvedValue(undefined);

      const res = await request(app.getHttpServer())
        .post(`${sessionBase}/update/status/1`)
        .set('Authorization', bearerHeader(token))
        .query({ status: '1' })
        .expect(201);

      expect(res.body.code).toBe(200);
    });
  });

  describe('POST /api/v1/flashSession/delete/:id', () => {
    it('删除场次 → 201', async () => {
      mockService.deleteSession.mockResolvedValue(undefined);

      const res = await request(app.getHttpServer())
        .post(`${sessionBase}/delete/1`)
        .set('Authorization', bearerHeader(token))
        .expect(201);

      expect(res.body.code).toBe(200);
    });
  });
});
