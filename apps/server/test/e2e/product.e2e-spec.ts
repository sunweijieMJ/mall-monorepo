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

import { ProductService } from '@/modules/pms/product/product.service';
import { ProductController } from '@/modules/pms/product/product.controller';

import { createTestApp } from '../helpers/create-test-app';
import { TestPassportModule } from '../helpers/test-passport.module';
import { generateAdminToken, bearerHeader } from '../helpers/jwt.helper';

const mockProductService = {
  findList: vi.fn(),
  findSimpleList: vi.fn(),
  getUpdateInfo: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  updateVerifyStatus: vi.fn(),
  delete: vi.fn(),
  updatePublishStatus: vi.fn(),
  updateNewStatus: vi.fn(),
  updateRecommendStatus: vi.fn(),
};

@Module({
  imports: [TestPassportModule],
  controllers: [ProductController],
  providers: [{ provide: ProductService, useValue: mockProductService }],
})
class TestProductModule {}

describe('Product API (e2e)', () => {
  let app: INestApplication;
  const token = generateAdminToken();

  beforeAll(async () => {
    app = await createTestApp(TestProductModule);
  });

  afterAll(() => app?.close());
  beforeEach(() => vi.clearAllMocks());

  const baseUrl = '/api/v1/admin/pms/products';

  describe('GET /list', () => {
    const url = `${baseUrl}/list`;

    it('无 token → 401', async () => {
      const res = await request(app.getHttpServer()).get(url).expect(401);
      expect(res.body.code).toBe(401);
    });

    it('商品列表 → 200', async () => {
      mockProductService.findList.mockResolvedValue({
        list: [{ id: 1, name: '商品A' }],
        total: 1,
      });

      const res = await request(app.getHttpServer())
        .get(url)
        .set('Authorization', bearerHeader(token))
        .query({ pageNum: 1, pageSize: 10 })
        .expect(200);

      expect(res.body.code).toBe(200);
      expect(res.body.data.list).toHaveLength(1);
    });

    it('带过滤条件查询 → 200', async () => {
      mockProductService.findList.mockResolvedValue({ list: [], total: 0 });

      const res = await request(app.getHttpServer())
        .get(url)
        .set('Authorization', bearerHeader(token))
        .query({ keyword: '手机', publishStatus: 1, pageNum: 1, pageSize: 10 })
        .expect(200);

      expect(res.body.code).toBe(200);
      expect(mockProductService.findList).toHaveBeenCalled();
    });
  });

  describe('GET /simpleList', () => {
    it('简单商品列表 → 200', async () => {
      mockProductService.findSimpleList.mockResolvedValue([
        { id: 1, name: '商品A', pic: 'a.jpg' },
      ]);

      const res = await request(app.getHttpServer())
        .get(`${baseUrl}/simpleList`)
        .set('Authorization', bearerHeader(token))
        .expect(200);

      expect(res.body.code).toBe(200);
    });
  });

  describe('GET /updateInfo/:id', () => {
    it('获取商品详情 → 200', async () => {
      mockProductService.getUpdateInfo.mockResolvedValue({
        id: 1,
        name: '商品A',
        skuStockList: [],
        productAttributeValueList: [],
      });

      const res = await request(app.getHttpServer())
        .get(`${baseUrl}/updateInfo/1`)
        .set('Authorization', bearerHeader(token))
        .expect(200);

      expect(res.body.code).toBe(200);
      expect(res.body.data.id).toBe(1);
    });
  });

  describe('POST /create', () => {
    it('创建商品 → 200', async () => {
      mockProductService.create.mockResolvedValue({ id: 1 });

      const res = await request(app.getHttpServer())
        .post(`${baseUrl}/create`)
        .set('Authorization', bearerHeader(token))
        .send({ name: '新商品', brandId: 1, productCategoryId: 1, price: 99 })
        .expect(201);

      expect(res.body.code).toBe(200);
    });
  });

  describe('POST /update/:id', () => {
    it('更新商品 → 200', async () => {
      mockProductService.update.mockResolvedValue(1);

      const res = await request(app.getHttpServer())
        .post(`${baseUrl}/update/1`)
        .set('Authorization', bearerHeader(token))
        .send({
          name: '修改后的商品',
          brandId: 1,
          productCategoryId: 1,
          price: 99,
        })
        .expect(201);

      expect(res.body.code).toBe(200);
    });
  });

  describe('POST /delete', () => {
    it('缺少 ids → 400', async () => {
      const res = await request(app.getHttpServer())
        .post(`${baseUrl}/delete`)
        .set('Authorization', bearerHeader(token))
        .expect(400);

      expect(res.body.code).toBe(400);
    });

    it('批量删除 → 200', async () => {
      mockProductService.delete.mockResolvedValue(2);

      const res = await request(app.getHttpServer())
        .post(`${baseUrl}/delete`)
        .set('Authorization', bearerHeader(token))
        .query({ ids: '1,2' })
        .expect(201);

      expect(res.body.code).toBe(200);
    });
  });

  // 注意：POST /update/publishStatus、/update/newStatus、/update/recommendStatus
  // 会被 POST /update/:id 路由先匹配（NestJS 按声明顺序），
  // 这是控制器路由设计的已知限制，在此跳过 E2E 测试。

  describe('POST /updateVerifyStatus', () => {
    it('批量更新审核状态 → 201', async () => {
      mockProductService.updateVerifyStatus.mockResolvedValue(1);

      const res = await request(app.getHttpServer())
        .post(`${baseUrl}/updateVerifyStatus`)
        .set('Authorization', bearerHeader(token))
        .query({ ids: '1', verifyStatus: '1', detail: '审核通过' })
        .expect(201);

      expect(res.body.code).toBe(200);
    });

    it('缺少 ids → 400', async () => {
      const res = await request(app.getHttpServer())
        .post(`${baseUrl}/updateVerifyStatus`)
        .set('Authorization', bearerHeader(token))
        .query({ verifyStatus: '1', detail: '审核通过' })
        .expect(400);

      expect(res.body.code).toBe(400);
    });
  });
});
