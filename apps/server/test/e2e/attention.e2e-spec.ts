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

import { AttentionService } from '@/modules/portal/attention/attention.service';
import { AttentionController } from '@/modules/portal/attention/attention.controller';

import { createTestApp } from '../helpers/create-test-app';
import { TestPassportModule } from '../helpers/test-passport.module';
import { generateMemberToken, bearerHeader } from '../helpers/jwt.helper';

const mockService = {
  add: vi.fn(),
  delete: vi.fn(),
  list: vi.fn(),
  clear: vi.fn(),
};

@Module({
  imports: [TestPassportModule],
  controllers: [AttentionController],
  providers: [{ provide: AttentionService, useValue: mockService }],
})
class TestAttentionModule {}

describe('Attention API (e2e)', () => {
  let app: INestApplication;
  const token = generateMemberToken();

  beforeAll(async () => {
    app = await createTestApp(TestAttentionModule);
  });

  afterAll(() => app?.close());
  beforeEach(() => vi.clearAllMocks());

  const baseUrl = '/api/v1/portal/attention';

  describe('POST /add', () => {
    it('关注品牌 → 201', async () => {
      mockService.add.mockResolvedValue(undefined);

      const res = await request(app.getHttpServer())
        .post(`${baseUrl}/add`)
        .set('Authorization', bearerHeader(token))
        .send({ brandId: 1, brandName: '测试品牌' })
        .expect(201);

      expect(res.body.code).toBe(200);
      expect(mockService.add).toHaveBeenCalled();
    });
  });

  describe('DELETE /delete', () => {
    it('取消关注品牌 → 200', async () => {
      mockService.delete.mockResolvedValue(undefined);

      const res = await request(app.getHttpServer())
        .delete(`${baseUrl}/delete`)
        .set('Authorization', bearerHeader(token))
        .query({ brandId: '1' })
        .expect(200);

      expect(res.body.code).toBe(200);
    });
  });

  describe('GET /list', () => {
    it('分页查询已关注品牌 → 200', async () => {
      mockService.list.mockResolvedValue({
        list: [{ id: 1, brandName: '测试品牌' }],
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
    it('清空全部关注记录 → 201', async () => {
      mockService.clear.mockResolvedValue(undefined);

      const res = await request(app.getHttpServer())
        .post(`${baseUrl}/clear`)
        .set('Authorization', bearerHeader(token))
        .expect(201);

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
