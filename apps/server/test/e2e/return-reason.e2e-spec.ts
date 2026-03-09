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

import { ReturnReasonService } from '@/modules/oms/return-reason/return-reason.service';
import { ReturnReasonController } from '@/modules/oms/return-reason/return-reason.controller';

import { createTestApp } from '../helpers/create-test-app';
import { TestPassportModule } from '../helpers/test-passport.module';
import { generateAdminToken, bearerHeader } from '../helpers/jwt.helper';

const mockService = {
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  updateStatus: vi.fn(),
  list: vi.fn(),
  getItem: vi.fn(),
};

@Module({
  imports: [TestPassportModule],
  controllers: [ReturnReasonController],
  providers: [{ provide: ReturnReasonService, useValue: mockService }],
})
class TestModule {}

describe('ReturnReason API (e2e)', () => {
  let app: INestApplication;
  const token = generateAdminToken();

  beforeAll(async () => {
    app = await createTestApp(TestModule);
  });

  afterAll(() => app?.close());
  beforeEach(() => vi.clearAllMocks());

  const baseUrl = '/api/v1/admin/oms/return-reasons';

  describe('GET /', () => {
    it('分页查询退货原因 → 200', async () => {
      mockService.list.mockResolvedValue({
        list: [{ id: 1, name: '质量问题' }],
        total: 1,
        pageNum: 1,
        pageSize: 10,
      });

      const res = await request(app.getHttpServer())
        .get(baseUrl)
        .set('Authorization', bearerHeader(token))
        .query({ pageNum: 1, pageSize: 10 })
        .expect(200);

      expect(res.body.code).toBe(200);
    });

    it('无 token → 401', async () => {
      const res = await request(app.getHttpServer()).get(baseUrl).expect(401);

      expect(res.body.code).toBe(401);
    });
  });

  describe('GET /:id', () => {
    it('获取退货原因详情 → 200', async () => {
      mockService.getItem.mockResolvedValue({ id: 1, name: '质量问题' });

      const res = await request(app.getHttpServer())
        .get(`${baseUrl}/1`)
        .set('Authorization', bearerHeader(token))
        .expect(200);

      expect(res.body.code).toBe(200);
      expect(res.body.data).toHaveProperty('name', '质量问题');
    });
  });

  describe('POST /', () => {
    it('创建退货原因 → 200', async () => {
      mockService.create.mockResolvedValue({ id: 2, name: '不想要了' });

      const res = await request(app.getHttpServer())
        .post(baseUrl)
        .set('Authorization', bearerHeader(token))
        .send({ name: '不想要了', sort: 1, status: 1 })
        .expect(200);

      expect(res.body.code).toBe(200);
    });
  });

  describe('PUT /:id', () => {
    it('更新退货原因 → 200', async () => {
      mockService.update.mockResolvedValue(undefined);

      const res = await request(app.getHttpServer())
        .put(`${baseUrl}/1`)
        .set('Authorization', bearerHeader(token))
        .send({ name: '质量不合格' })
        .expect(200);

      expect(res.body.code).toBe(200);
    });
  });

  describe('POST /batch-delete', () => {
    it('批量删除退货原因 → 200', async () => {
      mockService.delete.mockResolvedValue(undefined);

      const res = await request(app.getHttpServer())
        .post(`${baseUrl}/batch-delete`)
        .set('Authorization', bearerHeader(token))
        .send({ ids: [1, 2] })
        .expect(200);

      expect(res.body.code).toBe(200);
      expect(mockService.delete).toHaveBeenCalledWith([1, 2]);
    });
  });

  describe('PUT /batch-status', () => {
    it('批量更新退货原因状态 → 200', async () => {
      mockService.updateStatus.mockResolvedValue(undefined);

      const res = await request(app.getHttpServer())
        .put(`${baseUrl}/batch-status`)
        .set('Authorization', bearerHeader(token))
        .send({ ids: [1, 2], status: 0 })
        .expect(200);

      expect(res.body.code).toBe(200);
      expect(mockService.updateStatus).toHaveBeenCalledWith([1, 2], 0);
    });
  });
});
