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

import { ReadHistoryService } from '@/modules/portal/read-history/read-history.service';
import { ReadHistoryController } from '@/modules/portal/read-history/read-history.controller';

import { createTestApp } from '../helpers/create-test-app';
import { TestPassportModule } from '../helpers/test-passport.module';
import { generateMemberToken, bearerHeader } from '../helpers/jwt.helper';

const mockService = {
  save: vi.fn(),
  list: vi.fn(),
  clear: vi.fn(),
};

@Module({
  imports: [TestPassportModule],
  controllers: [ReadHistoryController],
  providers: [{ provide: ReadHistoryService, useValue: mockService }],
})
class TestReadHistoryModule {}

describe('ReadHistory API (e2e)', () => {
  let app: INestApplication;
  const token = generateMemberToken();

  beforeAll(async () => {
    app = await createTestApp(TestReadHistoryModule);
  });

  afterAll(() => app?.close());
  beforeEach(() => vi.clearAllMocks());

  const baseUrl = '/api/v1/portal/read-history';

  describe('POST /add', () => {
    it('保存浏览历史 → 201', async () => {
      mockService.save.mockResolvedValue(undefined);

      const res = await request(app.getHttpServer())
        .post(`${baseUrl}/add`)
        .set('Authorization', bearerHeader(token))
        .send({ productId: 1, productName: '测试商品' })
        .expect(201);

      expect(res.body.code).toBe(200);
      expect(mockService.save).toHaveBeenCalled();
    });
  });

  describe('GET /list', () => {
    it('分页查询浏览历史 → 200', async () => {
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
    it('清空浏览历史 → 201', async () => {
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
