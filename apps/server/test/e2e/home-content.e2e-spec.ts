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
  const advertiseBase = '/api/v1/admin/sms/home-advertises';

  describe('GET /api/v1/admin/sms/home-advertises/list', () => {
    const url = `${advertiseBase}/list`;

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

  describe('POST /api/v1/admin/sms/home-advertises/create', () => {
    it('添加广告 → 201', async () => {
      const dto = {
        name: '新广告',
        pic: 'https://example.com/ad.jpg',
        url: 'https://example.com',
      };
      mockService.createAdvertise.mockResolvedValue({ id: 1, ...dto });

      const res = await request(app.getHttpServer())
        .post(`${advertiseBase}/create`)
        .set('Authorization', bearerHeader(token))
        .send(dto)
        .expect(201);

      expect(res.body.code).toBe(200);
      expect(mockService.createAdvertise).toHaveBeenCalled();
    });
  });

  describe('POST /api/v1/admin/sms/home-advertises/update/:id', () => {
    it('修改广告 → 201', async () => {
      mockService.updateAdvertise.mockResolvedValue(undefined);

      const res = await request(app.getHttpServer())
        .post(`${advertiseBase}/update/1`)
        .set('Authorization', bearerHeader(token))
        .send({ name: '修改后的广告' })
        .expect(201);

      expect(res.body.code).toBe(200);
      expect(mockService.updateAdvertise).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ name: '修改后的广告' }),
      );
    });
  });

  describe('POST /api/v1/admin/sms/home-advertises/delete', () => {
    it('批量删除广告 → 201', async () => {
      mockService.deleteAdvertise.mockResolvedValue(undefined);

      const res = await request(app.getHttpServer())
        .post(`${advertiseBase}/delete`)
        .set('Authorization', bearerHeader(token))
        .send({ ids: [1, 2] })
        .expect(201);

      expect(res.body.code).toBe(200);
      expect(mockService.deleteAdvertise).toHaveBeenCalledWith([1, 2]);
    });
  });

  describe('GET /api/v1/admin/sms/home-advertises/list (带过滤)', () => {
    it('带 name/type/endTime 过滤 → 200', async () => {
      mockService.listAdvertise.mockResolvedValue({
        list: [],
        total: 0,
        pageNum: 1,
        pageSize: 5,
        totalPage: 0,
      });

      const res = await request(app.getHttpServer())
        .get(`${advertiseBase}/list`)
        .set('Authorization', bearerHeader(token))
        .query({
          pageNum: 1,
          pageSize: 5,
          name: '春',
          type: '1',
          endTime: '2026-12-31',
        })
        .expect(200);

      expect(res.body.code).toBe(200);
      // 验证可选参数被正确转换
      expect(mockService.listAdvertise).toHaveBeenCalledWith(
        expect.objectContaining({ name: '春', type: 1, endTime: '2026-12-31' }),
      );
    });
  });

  describe('POST /api/v1/admin/sms/home-advertises/update/status/:id', () => {
    it('修改上下线状态 → 201', async () => {
      mockService.updateAdvertiseStatus.mockResolvedValue(undefined);

      const res = await request(app.getHttpServer())
        .post(`${advertiseBase}/update/status/1`)
        .set('Authorization', bearerHeader(token))
        .query({ status: '1' })
        .expect(201);

      expect(res.body.code).toBe(200);
    });
  });

  // ---- 首页品牌推荐 ----
  const brandBase = '/api/v1/admin/sms/home-brands';

  describe('GET /api/v1/admin/sms/home-brands/list', () => {
    it('分页查询推荐品牌 → 200', async () => {
      mockService.listHomeBrand.mockResolvedValue({
        list: [{ id: 1, brandName: 'Nike' }],
        total: 1,
        pageNum: 1,
        pageSize: 5,
        totalPage: 1,
      });

      const res = await request(app.getHttpServer())
        .get(`${brandBase}/list`)
        .set('Authorization', bearerHeader(token))
        .query({ pageNum: 1, pageSize: 5 })
        .expect(200);

      expect(res.body.code).toBe(200);
      expect(mockService.listHomeBrand).toHaveBeenCalled();
    });
  });

  describe('POST /api/v1/admin/sms/home-brands/create', () => {
    it('批量添加推荐品牌 → 201', async () => {
      const dto = [{ brandId: 1, brandName: 'Nike' }];
      mockService.createHomeBrand.mockResolvedValue([{ id: 1, ...dto[0] }]);

      const res = await request(app.getHttpServer())
        .post(`${brandBase}/create`)
        .set('Authorization', bearerHeader(token))
        .send(dto)
        .expect(201);

      expect(res.body.code).toBe(200);
      expect(mockService.createHomeBrand).toHaveBeenCalled();
    });
  });

  describe('GET /api/v1/admin/sms/home-brands/list (带过滤)', () => {
    it('带 recommendStatus 过滤 → 200', async () => {
      mockService.listHomeBrand.mockResolvedValue({
        list: [],
        total: 0,
        pageNum: 1,
        pageSize: 5,
        totalPage: 0,
      });

      const res = await request(app.getHttpServer())
        .get(`${brandBase}/list`)
        .set('Authorization', bearerHeader(token))
        .query({ pageNum: 1, pageSize: 5, recommendStatus: '1' })
        .expect(200);

      expect(res.body.code).toBe(200);
      expect(mockService.listHomeBrand).toHaveBeenCalledWith(
        expect.objectContaining({ recommendStatus: 1 }),
      );
    });
  });

  describe('POST /api/v1/admin/sms/home-brands/update/recommendStatus', () => {
    it('批量修改推荐状态 → 201', async () => {
      mockService.updateHomeBrandStatus.mockResolvedValue(undefined);

      const res = await request(app.getHttpServer())
        .post(`${brandBase}/update/recommendStatus`)
        .set('Authorization', bearerHeader(token))
        .query({ ids: '1,2', recommendStatus: '1' })
        .expect(201);

      expect(res.body.code).toBe(200);
    });
  });

  describe('POST /api/v1/admin/sms/home-brands/update/sort/:id', () => {
    it('修改排序 → 201', async () => {
      mockService.updateHomeBrandSort.mockResolvedValue(undefined);

      const res = await request(app.getHttpServer())
        .post(`${brandBase}/update/sort/1`)
        .set('Authorization', bearerHeader(token))
        .query({ sort: '10' })
        .expect(201);

      expect(res.body.code).toBe(200);
    });
  });

  // ---- 首页专题推荐 ----
  const subjectBase = '/api/v1/admin/sms/home-subjects';

  describe('GET /api/v1/admin/sms/home-subjects/list', () => {
    it('分页查询推荐专题 → 200', async () => {
      mockService.listSubject.mockResolvedValue({
        list: [{ id: 1, subjectName: '数码专题' }],
        total: 1,
        pageNum: 1,
        pageSize: 5,
        totalPage: 1,
      });

      const res = await request(app.getHttpServer())
        .get(`${subjectBase}/list`)
        .set('Authorization', bearerHeader(token))
        .query({ pageNum: 1, pageSize: 5 })
        .expect(200);

      expect(res.body.code).toBe(200);
      expect(mockService.listSubject).toHaveBeenCalled();
    });
  });

  describe('POST /api/v1/admin/sms/home-subjects/create', () => {
    it('批量添加推荐专题 → 201', async () => {
      const dto = [{ subjectId: 10, subjectName: '数码专题' }];
      mockService.createSubject.mockResolvedValue([{ id: 1, ...dto[0] }]);

      const res = await request(app.getHttpServer())
        .post(`${subjectBase}/create`)
        .set('Authorization', bearerHeader(token))
        .send(dto)
        .expect(201);

      expect(res.body.code).toBe(200);
      expect(mockService.createSubject).toHaveBeenCalled();
    });
  });

  describe('GET /api/v1/admin/sms/home-subjects/list (带过滤)', () => {
    it('带 recommendStatus 过滤 → 200', async () => {
      mockService.listSubject.mockResolvedValue({
        list: [],
        total: 0,
        pageNum: 1,
        pageSize: 5,
        totalPage: 0,
      });

      const res = await request(app.getHttpServer())
        .get(`${subjectBase}/list`)
        .set('Authorization', bearerHeader(token))
        .query({ pageNum: 1, pageSize: 5, recommendStatus: '0' })
        .expect(200);

      expect(res.body.code).toBe(200);
      expect(mockService.listSubject).toHaveBeenCalledWith(
        expect.objectContaining({ recommendStatus: 0 }),
      );
    });
  });

  describe('POST /api/v1/admin/sms/home-subjects/update/recommendStatus', () => {
    it('批量修改推荐状态 → 201', async () => {
      mockService.updateSubjectStatus.mockResolvedValue(undefined);

      const res = await request(app.getHttpServer())
        .post(`${subjectBase}/update/recommendStatus`)
        .set('Authorization', bearerHeader(token))
        .query({ ids: '1', recommendStatus: '1' })
        .expect(201);

      expect(res.body.code).toBe(200);
    });
  });

  // ---- 新品推荐 ----
  const newProductBase = '/api/v1/admin/sms/home-new-products';

  describe('GET /api/v1/admin/sms/home-new-products/list', () => {
    it('分页查询新品推荐 → 200', async () => {
      mockService.listNewProduct.mockResolvedValue({
        list: [{ id: 1, productName: '新品手机' }],
        total: 1,
        pageNum: 1,
        pageSize: 5,
        totalPage: 1,
      });

      const res = await request(app.getHttpServer())
        .get(`${newProductBase}/list`)
        .set('Authorization', bearerHeader(token))
        .query({ pageNum: 1, pageSize: 5 })
        .expect(200);

      expect(res.body.code).toBe(200);
      expect(mockService.listNewProduct).toHaveBeenCalled();
    });
  });

  describe('GET /api/v1/admin/sms/home-new-products/list (带过滤)', () => {
    it('带 recommendStatus 过滤 → 200', async () => {
      mockService.listNewProduct.mockResolvedValue({
        list: [],
        total: 0,
        pageNum: 1,
        pageSize: 5,
        totalPage: 0,
      });

      const res = await request(app.getHttpServer())
        .get(`${newProductBase}/list`)
        .set('Authorization', bearerHeader(token))
        .query({ pageNum: 1, pageSize: 5, recommendStatus: '1' })
        .expect(200);

      expect(res.body.code).toBe(200);
      expect(mockService.listNewProduct).toHaveBeenCalledWith(
        expect.objectContaining({ recommendStatus: 1 }),
      );
    });
  });

  describe('POST /api/v1/admin/sms/home-new-products/update/recommendStatus', () => {
    it('批量修改推荐状态 → 201', async () => {
      mockService.updateNewProductStatus.mockResolvedValue(undefined);

      const res = await request(app.getHttpServer())
        .post(`${newProductBase}/update/recommendStatus`)
        .set('Authorization', bearerHeader(token))
        .query({ ids: '1,2', recommendStatus: '0' })
        .expect(201);

      expect(res.body.code).toBe(200);
    });
  });

  // ---- 人气推荐 ----
  const hotProductBase = '/api/v1/admin/sms/home-recommend-products';

  describe('GET /api/v1/admin/sms/home-recommend-products/list', () => {
    it('分页查询人气推荐 → 200', async () => {
      mockService.listHotProduct.mockResolvedValue({
        list: [{ id: 1, productName: '爆款手机' }],
        total: 1,
        pageNum: 1,
        pageSize: 5,
        totalPage: 1,
      });

      const res = await request(app.getHttpServer())
        .get(`${hotProductBase}/list`)
        .set('Authorization', bearerHeader(token))
        .query({ pageNum: 1, pageSize: 5 })
        .expect(200);

      expect(res.body.code).toBe(200);
      expect(mockService.listHotProduct).toHaveBeenCalled();
    });
  });

  describe('GET /api/v1/admin/sms/home-recommend-products/list (带过滤)', () => {
    it('带 recommendStatus 过滤 → 200', async () => {
      mockService.listHotProduct.mockResolvedValue({
        list: [],
        total: 0,
        pageNum: 1,
        pageSize: 5,
        totalPage: 0,
      });

      const res = await request(app.getHttpServer())
        .get(`${hotProductBase}/list`)
        .set('Authorization', bearerHeader(token))
        .query({ pageNum: 1, pageSize: 5, recommendStatus: '1' })
        .expect(200);

      expect(res.body.code).toBe(200);
      expect(mockService.listHotProduct).toHaveBeenCalledWith(
        expect.objectContaining({ recommendStatus: 1 }),
      );
    });
  });

  describe('POST /api/v1/admin/sms/home-recommend-products/update/recommendStatus', () => {
    it('批量修改推荐状态 → 201', async () => {
      mockService.updateHotProductStatus.mockResolvedValue(undefined);

      const res = await request(app.getHttpServer())
        .post(`${hotProductBase}/update/recommendStatus`)
        .set('Authorization', bearerHeader(token))
        .query({ ids: '1', recommendStatus: '1' })
        .expect(201);

      expect(res.body.code).toBe(200);
    });
  });
});
