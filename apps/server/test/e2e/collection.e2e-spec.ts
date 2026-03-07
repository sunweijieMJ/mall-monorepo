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

  const baseUrl = '/api/v1/portal/collection';

  describe('POST /add', () => {
    it('收藏商品 → 201', async () => {
      mockService.add.mockResolvedValue(undefined);

      const res = await request(app.getHttpServer())
        .post(`${baseUrl}/add`)
        .set('Authorization', bearerHeader(token))
        .send({ productId: 1, productName: '测试商品' })
        .expect(201);

      expect(res.body.code).toBe(200);
      expect(mockService.add).toHaveBeenCalled();
    });
  });

  describe('DELETE /delete', () => {
    it('取消收藏商品 → 200', async () => {
      mockService.delete.mockResolvedValue(undefined);

      const res = await request(app.getHttpServer())
        .delete(`${baseUrl}/delete`)
        .set('Authorization', bearerHeader(token))
        .query({ productId: '1' })
        .expect(200);

      expect(res.body.code).toBe(200);
    });
  });

  describe('GET /list', () => {
    it('分页查询收藏列表 → 200', async () => {
      mockService.list.mockResolvedValue({
        list: [{ id: 1, productName: '测试商品' }],
        total: 1,
      });

      const res = await request(app.getHttpServer())
        .get(`${baseUrl}/list`)
        .set('Authorization', bearerHeader(token))
        .query({ pageNum: 1, pageSize: 10 })
        .expect(200);

      expect(res.body.code).toBe(200);
    });
  });

  describe('POST /clear', () => {
    it('清空全部收藏 → 201', async () => {
      mockService.clear.mockResolvedValue(undefined);

      const res = await request(app.getHttpServer())
        .post(`${baseUrl}/clear`)
        .set('Authorization', bearerHeader(token))
        .expect(201);

      expect(res.body.code).toBe(200);
    });
  });

  describe('GET /detail', () => {
    it('查询单条收藏详情 → 200', async () => {
      mockService.getDetail.mockResolvedValue({
        id: 1,
        productName: '测试商品',
      });

      const res = await request(app.getHttpServer())
        .get(`${baseUrl}/detail`)
        .set('Authorization', bearerHeader(token))
        .query({ productId: '1' })
        .expect(200);

      expect(res.body.code).toBe(200);
    });
  });

  describe('无 token', () => {
    it('GET /list → 401', async () => {
      const res = await request(app.getHttpServer())
        .get(`${baseUrl}/list`)
        .expect(401);

      expect(res.body.code).toBe(401);
    });
  });
});
