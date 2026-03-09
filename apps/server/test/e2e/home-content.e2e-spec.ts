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

import { HomeContentService } from '@/modules/sms/home-content/home-content.service';
import {
  HomeAdvertiseController,
  HomeBrandController,
  HomeSubjectController,
  HomeNewProductController,
  HomeRecommendProductController,
} from '@/modules/sms/home-content/home-content.controller';

import { createTestApp } from '../helpers/create-test-app';
import { TestPassportModule } from '../helpers/test-passport.module';
import { generateAdminToken, bearerHeader } from '../helpers/jwt.helper';

// mock 所有 HomeContentService 方法
const mockService = {
  // 首页广告
  listAdvertise: vi.fn(),
  getAdvertiseItem: vi.fn(),
  createAdvertise: vi.fn(),
  updateAdvertise: vi.fn(),
  deleteAdvertise: vi.fn(),
  updateAdvertiseStatus: vi.fn(),
  // 首页品牌推荐
  listHomeBrand: vi.fn(),
  createHomeBrand: vi.fn(),
  deleteHomeBrand: vi.fn(),
  updateHomeBrandStatus: vi.fn(),
  updateHomeBrandSort: vi.fn(),
  // 首页专题推荐
  listSubject: vi.fn(),
  createSubject: vi.fn(),
  deleteSubject: vi.fn(),
  updateSubjectStatus: vi.fn(),
  updateSubjectSort: vi.fn(),
  // 新品推荐
  listNewProduct: vi.fn(),
  createNewProduct: vi.fn(),
  deleteNewProduct: vi.fn(),
  updateNewProductStatus: vi.fn(),
  updateNewProductSort: vi.fn(),
  // 人气推荐
  listHotProduct: vi.fn(),
  createHotProduct: vi.fn(),
  deleteHotProduct: vi.fn(),
  updateHotProductStatus: vi.fn(),
  updateHotProductSort: vi.fn(),
};

@Module({
  imports: [TestPassportModule],
  controllers: [
    HomeAdvertiseController,
    HomeBrandController,
    HomeSubjectController,
    HomeNewProductController,
    HomeRecommendProductController,
  ],
  providers: [{ provide: HomeContentService, useValue: mockService }],
})
class TestHomeContentModule {}

describe('HomeContent API (e2e)', () => {
  let app: INestApplication;
  const token = generateAdminToken();

  beforeAll(async () => {
    app = await createTestApp(TestHomeContentModule);
  });

  afterAll(() => app?.close());
  beforeEach(() => vi.clearAllMocks());

  // ---- 首页广告 ----
  const advertiseBase = '/api/v1/admin/sms/home-ads';

  describe('GET /api/v1/admin/sms/home-ads', () => {
    const url = advertiseBase;

    it('无 token → 401', async () => {
      const res = await request(app.getHttpServer()).get(url).expect(401);
      expect(res.body.code).toBe(401);
    });

    it('分页查询首页广告 → 200', async () => {
      mockService.listAdvertise.mockResolvedValue({
        list: [{ id: 1, name: '春季广告' }],
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
      expect(mockService.listAdvertise).toHaveBeenCalled();
    });
  });

  describe('POST /api/v1/admin/sms/home-ads', () => {
    it('添加广告 → 201', async () => {
      const dto = {
        name: '新广告',
        pic: 'https://example.com/ad.jpg',
        url: 'https://example.com',
      };
      mockService.createAdvertise.mockResolvedValue({ id: 1, ...dto });

      const res = await request(app.getHttpServer())
        .post(advertiseBase)
        .set('Authorization', bearerHeader(token))
        .send(dto)
        .expect(200);

      expect(res.body.code).toBe(200);
      expect(mockService.createAdvertise).toHaveBeenCalled();
    });
  });

  describe('PUT /api/v1/admin/sms/home-ads/:id', () => {
    it('修改广告 → 200', async () => {
      mockService.updateAdvertise.mockResolvedValue(undefined);

      const res = await request(app.getHttpServer())
        .put(`${advertiseBase}/1`)
        .set('Authorization', bearerHeader(token))
        .send({ name: '修改后的广告' })
        .expect(200);

      expect(res.body.code).toBe(200);
      expect(mockService.updateAdvertise).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ name: '修改后的广告' }),
      );
    });
  });

  describe('POST /api/v1/admin/sms/home-ads/batch-delete', () => {
    it('批量删除广告 → 200', async () => {
      mockService.deleteAdvertise.mockResolvedValue(undefined);

      const res = await request(app.getHttpServer())
        .post(`${advertiseBase}/batch-delete`)
        .set('Authorization', bearerHeader(token))
        .send({ ids: [1, 2] })
        .expect(200);

      expect(res.body.code).toBe(200);
      expect(mockService.deleteAdvertise).toHaveBeenCalledWith([1, 2]);
    });
  });

  describe('GET /api/v1/admin/sms/home-ads (带过滤)', () => {
    it('带 name/type/endTime 过滤 → 200', async () => {
      mockService.listAdvertise.mockResolvedValue({
        list: [],
        total: 0,
        pageNum: 1,
        pageSize: 5,
        totalPage: 0,
      });

      const res = await request(app.getHttpServer())
        .get(advertiseBase)
        .set('Authorization', bearerHeader(token))
        .query({
          pageNum: 1,
          pageSize: 5,
          keyword: '春',
          type: '1',
          endTime: '2026-12-31',
        })
        .expect(200);

      expect(res.body.code).toBe(200);
      // 验证可选参数被正确转换
      expect(mockService.listAdvertise).toHaveBeenCalledWith(
        expect.objectContaining({
          keyword: '春',
          type: 1,
          endTime: '2026-12-31',
        }),
      );
    });
  });

  describe('PUT /api/v1/admin/sms/home-ads/:id/status', () => {
    it('修改上下线状态 → 200', async () => {
      mockService.updateAdvertiseStatus.mockResolvedValue(undefined);

      const res = await request(app.getHttpServer())
        .put(`${advertiseBase}/1/status`)
        .set('Authorization', bearerHeader(token))
        .send({ status: 1 })
        .expect(200);

      expect(res.body.code).toBe(200);
    });
  });

  // ---- 首页品牌推荐 ----
  const brandBase = '/api/v1/admin/sms/home-brands';

  describe('GET /api/v1/admin/sms/home-brands', () => {
    it('分页查询推荐品牌 → 200', async () => {
      mockService.listHomeBrand.mockResolvedValue({
        list: [{ id: 1, brandName: 'Nike' }],
        total: 1,
        pageNum: 1,
        pageSize: 5,
        totalPage: 1,
      });

      const res = await request(app.getHttpServer())
        .get(brandBase)
        .set('Authorization', bearerHeader(token))
        .query({ pageNum: 1, pageSize: 5 })
        .expect(200);

      expect(res.body.code).toBe(200);
      expect(mockService.listHomeBrand).toHaveBeenCalled();
    });
  });

  describe('POST /api/v1/admin/sms/home-brands', () => {
    it('批量添加推荐品牌 → 201', async () => {
      const dto = [{ brandId: 1, brandName: 'Nike' }];
      mockService.createHomeBrand.mockResolvedValue([{ id: 1, ...dto[0] }]);

      const res = await request(app.getHttpServer())
        .post(brandBase)
        .set('Authorization', bearerHeader(token))
        .send(dto)
        .expect(200);

      expect(res.body.code).toBe(200);
      expect(mockService.createHomeBrand).toHaveBeenCalled();
    });
  });

  describe('GET /api/v1/admin/sms/home-brands (带过滤)', () => {
    it('带 recommendStatus 过滤 → 200', async () => {
      mockService.listHomeBrand.mockResolvedValue({
        list: [],
        total: 0,
        pageNum: 1,
        pageSize: 5,
        totalPage: 0,
      });

      const res = await request(app.getHttpServer())
        .get(brandBase)
        .set('Authorization', bearerHeader(token))
        .query({ pageNum: 1, pageSize: 5, recommendStatus: '1' })
        .expect(200);

      expect(res.body.code).toBe(200);
      expect(mockService.listHomeBrand).toHaveBeenCalledWith(
        expect.objectContaining({ recommendStatus: 1 }),
      );
    });
  });

  describe('PUT /api/v1/admin/sms/home-brands/batch-status', () => {
    it('批量修改推荐状态 → 200', async () => {
      mockService.updateHomeBrandStatus.mockResolvedValue(undefined);

      const res = await request(app.getHttpServer())
        .put(`${brandBase}/batch-status`)
        .set('Authorization', bearerHeader(token))
        .send({ ids: [1, 2], status: 1 })
        .expect(200);

      expect(res.body.code).toBe(200);
    });
  });

  describe('PUT /api/v1/admin/sms/home-brands/:id/sort', () => {
    it('修改排序 → 200', async () => {
      mockService.updateHomeBrandSort.mockResolvedValue(undefined);

      const res = await request(app.getHttpServer())
        .put(`${brandBase}/1/sort`)
        .set('Authorization', bearerHeader(token))
        .send({ sort: 10 })
        .expect(200);

      expect(res.body.code).toBe(200);
    });
  });

  // ---- 首页专题推荐 ----
  const subjectBase = '/api/v1/admin/sms/home-subjects';

  describe('GET /api/v1/admin/sms/home-subjects', () => {
    it('分页查询推荐专题 → 200', async () => {
      mockService.listSubject.mockResolvedValue({
        list: [{ id: 1, subjectName: '数码专题' }],
        total: 1,
        pageNum: 1,
        pageSize: 5,
        totalPage: 1,
      });

      const res = await request(app.getHttpServer())
        .get(subjectBase)
        .set('Authorization', bearerHeader(token))
        .query({ pageNum: 1, pageSize: 5 })
        .expect(200);

      expect(res.body.code).toBe(200);
      expect(mockService.listSubject).toHaveBeenCalled();
    });
  });

  describe('POST /api/v1/admin/sms/home-subjects', () => {
    it('批量添加推荐专题 → 201', async () => {
      const dto = [{ subjectId: 10, subjectName: '数码专题' }];
      mockService.createSubject.mockResolvedValue([{ id: 1, ...dto[0] }]);

      const res = await request(app.getHttpServer())
        .post(subjectBase)
        .set('Authorization', bearerHeader(token))
        .send(dto)
        .expect(200);

      expect(res.body.code).toBe(200);
      expect(mockService.createSubject).toHaveBeenCalled();
    });
  });

  describe('GET /api/v1/admin/sms/home-subjects (带过滤)', () => {
    it('带 recommendStatus 过滤 → 200', async () => {
      mockService.listSubject.mockResolvedValue({
        list: [],
        total: 0,
        pageNum: 1,
        pageSize: 5,
        totalPage: 0,
      });

      const res = await request(app.getHttpServer())
        .get(subjectBase)
        .set('Authorization', bearerHeader(token))
        .query({ pageNum: 1, pageSize: 5, recommendStatus: '0' })
        .expect(200);

      expect(res.body.code).toBe(200);
      expect(mockService.listSubject).toHaveBeenCalledWith(
        expect.objectContaining({ recommendStatus: 0 }),
      );
    });
  });

  describe('PUT /api/v1/admin/sms/home-subjects/batch-status', () => {
    it('批量修改推荐状态 → 200', async () => {
      mockService.updateSubjectStatus.mockResolvedValue(undefined);

      const res = await request(app.getHttpServer())
        .put(`${subjectBase}/batch-status`)
        .set('Authorization', bearerHeader(token))
        .send({ ids: [1], status: 1 })
        .expect(200);

      expect(res.body.code).toBe(200);
    });
  });

  // ---- 新品推荐 ----
  const newProductBase = '/api/v1/admin/sms/home-new-products';

  describe('GET /api/v1/admin/sms/home-new-products', () => {
    it('分页查询新品推荐 → 200', async () => {
      mockService.listNewProduct.mockResolvedValue({
        list: [{ id: 1, productName: '新品手机' }],
        total: 1,
        pageNum: 1,
        pageSize: 5,
        totalPage: 1,
      });

      const res = await request(app.getHttpServer())
        .get(newProductBase)
        .set('Authorization', bearerHeader(token))
        .query({ pageNum: 1, pageSize: 5 })
        .expect(200);

      expect(res.body.code).toBe(200);
      expect(mockService.listNewProduct).toHaveBeenCalled();
    });
  });

  describe('GET /api/v1/admin/sms/home-new-products (带过滤)', () => {
    it('带 recommendStatus 过滤 → 200', async () => {
      mockService.listNewProduct.mockResolvedValue({
        list: [],
        total: 0,
        pageNum: 1,
        pageSize: 5,
        totalPage: 0,
      });

      const res = await request(app.getHttpServer())
        .get(newProductBase)
        .set('Authorization', bearerHeader(token))
        .query({ pageNum: 1, pageSize: 5, recommendStatus: '1' })
        .expect(200);

      expect(res.body.code).toBe(200);
      expect(mockService.listNewProduct).toHaveBeenCalledWith(
        expect.objectContaining({ recommendStatus: 1 }),
      );
    });
  });

  describe('PUT /api/v1/admin/sms/home-new-products/batch-status', () => {
    it('批量修改推荐状态 → 200', async () => {
      mockService.updateNewProductStatus.mockResolvedValue(undefined);

      const res = await request(app.getHttpServer())
        .put(`${newProductBase}/batch-status`)
        .set('Authorization', bearerHeader(token))
        .send({ ids: [1, 2], status: 0 })
        .expect(200);

      expect(res.body.code).toBe(200);
    });
  });

  // ---- 人气推荐 ----
  const hotProductBase = '/api/v1/admin/sms/home-recommend-products';

  describe('GET /api/v1/admin/sms/home-recommend-products', () => {
    it('分页查询人气推荐 → 200', async () => {
      mockService.listHotProduct.mockResolvedValue({
        list: [{ id: 1, productName: '爆款手机' }],
        total: 1,
        pageNum: 1,
        pageSize: 5,
        totalPage: 1,
      });

      const res = await request(app.getHttpServer())
        .get(hotProductBase)
        .set('Authorization', bearerHeader(token))
        .query({ pageNum: 1, pageSize: 5 })
        .expect(200);

      expect(res.body.code).toBe(200);
      expect(mockService.listHotProduct).toHaveBeenCalled();
    });
  });

  describe('GET /api/v1/admin/sms/home-recommend-products (带过滤)', () => {
    it('带 recommendStatus 过滤 → 200', async () => {
      mockService.listHotProduct.mockResolvedValue({
        list: [],
        total: 0,
        pageNum: 1,
        pageSize: 5,
        totalPage: 0,
      });

      const res = await request(app.getHttpServer())
        .get(hotProductBase)
        .set('Authorization', bearerHeader(token))
        .query({ pageNum: 1, pageSize: 5, recommendStatus: '1' })
        .expect(200);

      expect(res.body.code).toBe(200);
      expect(mockService.listHotProduct).toHaveBeenCalledWith(
        expect.objectContaining({ recommendStatus: 1 }),
      );
    });
  });

  describe('PUT /api/v1/admin/sms/home-recommend-products/batch-status', () => {
    it('批量修改推荐状态 → 200', async () => {
      mockService.updateHotProductStatus.mockResolvedValue(undefined);

      const res = await request(app.getHttpServer())
        .put(`${hotProductBase}/batch-status`)
        .set('Authorization', bearerHeader(token))
        .send({ ids: [1], status: 1 })
        .expect(200);

      expect(res.body.code).toBe(200);
    });
  });
});
