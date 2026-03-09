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

import { CollectionService } from '@/modules/portal/collection/collection.service';
import { CollectionController } from '@/modules/portal/collection/collection.controller';

import { createTestApp } from '../helpers/create-test-app';
import { TestPassportModule } from '../helpers/test-passport.module';
import { generateMemberToken, bearerHeader } from '../helpers/jwt.helper';

const mockService = {
  add: vi.fn(),
  delete: vi.fn(),
  list: vi.fn(),
  clear: vi.fn(),
  getDetail: vi.fn(),
};

@Module({
  imports: [TestPassportModule],
  controllers: [CollectionController],
  providers: [{ provide: CollectionService, useValue: mockService }],
})
class TestCollectionModule {}

describe('Collection API (e2e)', () => {
  let app: INestApplication;
  const token = generateMemberToken();

  beforeAll(async () => {
    app = await createTestApp(TestCollectionModule);
  });

  afterAll(() => app?.close());
  beforeEach(() => vi.clearAllMocks());

  const baseUrl = '/api/v1/portal/collections';

  describe('POST /create', () => {
    it('收藏商品 → 201', async () => {
      mockService.add.mockResolvedValue(undefined);

      const res = await request(app.getHttpServer())
        .post(baseUrl)
        .set('Authorization', bearerHeader(token))
        .send({ productId: 1, productName: '测试商品' })
        .expect(200);

      expect(res.body.code).toBe(200);
      expect(mockService.add).toHaveBeenCalled();
    });
  });

  describe('DELETE /:productId', () => {
    it('取消收藏商品 → 200', async () => {
      mockService.delete.mockResolvedValue(undefined);

      const res = await request(app.getHttpServer())
        .delete(`${baseUrl}/1`)
        .set('Authorization', bearerHeader(token))
        .expect(200);

      expect(res.body.code).toBe(200);
    });
  });

  describe('GET /', () => {
    it('分页查询收藏列表 → 200', async () => {
      mockService.list.mockResolvedValue({
        list: [{ id: 1, productName: '测试商品' }],
        total: 1,
      });

      const res = await request(app.getHttpServer())
        .get(baseUrl)
        .set('Authorization', bearerHeader(token))
        .query({ pageNum: 1, pageSize: 10 })
        .expect(200);

      expect(res.body.code).toBe(200);
    });
  });

  describe('DELETE /clear', () => {
    it('清空全部收藏 → 200', async () => {
      mockService.clear.mockResolvedValue(undefined);

      const res = await request(app.getHttpServer())
        .delete(`${baseUrl}/clear`)
        .set('Authorization', bearerHeader(token))
        .expect(200);

      expect(res.body.code).toBe(200);
    });
  });

  describe('GET /:productId', () => {
    it('查询单条收藏详情 → 200', async () => {
      mockService.getDetail.mockResolvedValue({
        id: 1,
        productName: '测试商品',
      });

      const res = await request(app.getHttpServer())
        .get(`${baseUrl}/1`)
        .set('Authorization', bearerHeader(token))
        .expect(200);

      expect(res.body.code).toBe(200);
    });
  });

  describe('无 token', () => {
    it('GET / → 401', async () => {
      const res = await request(app.getHttpServer()).get(baseUrl).expect(401);

      expect(res.body.code).toBe(401);
    });
  });
});
