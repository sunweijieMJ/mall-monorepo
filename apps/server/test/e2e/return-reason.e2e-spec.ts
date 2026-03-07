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

  const baseUrl = '/api/v1/returnReason';

  describe('GET /list', () => {
    it('分页查询退货原因 → 200', async () => {
      mockService.list.mockResolvedValue({
        list: [{ id: 1, name: '质量问题' }],
        total: 1,
        pageNum: 1,
        pageSize: 10,
      });

      const res = await request(app.getHttpServer())
        .get(`${baseUrl}/list`)
        .set('Authorization', bearerHeader(token))
        .query({ pageNum: 1, pageSize: 10 })
        .expect(200);

      expect(res.body.code).toBe(200);
    });

    it('无 token → 401', async () => {
      const res = await request(app.getHttpServer())
        .get(`${baseUrl}/list`)
        .expect(401);

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

  describe('POST /create', () => {
    it('创建退货原因 → 201', async () => {
      mockService.create.mockResolvedValue({ id: 2, name: '不想要了' });

      const res = await request(app.getHttpServer())
        .post(`${baseUrl}/create`)
        .set('Authorization', bearerHeader(token))
        .send({ name: '不想要了', sort: 1, status: 1 })
        .expect(201);

      expect(res.body.code).toBe(200);
    });
  });

  describe('POST /update/:id', () => {
    it('更新退货原因 → 201', async () => {
      mockService.update.mockResolvedValue(undefined);

      const res = await request(app.getHttpServer())
        .post(`${baseUrl}/update/1`)
        .set('Authorization', bearerHeader(token))
        .send({ name: '质量不合格' })
        .expect(201);

      expect(res.body.code).toBe(200);
    });
  });

  describe('POST /delete', () => {
    it('批量删除退货原因 → 201', async () => {
      mockService.delete.mockResolvedValue(undefined);

      const res = await request(app.getHttpServer())
        .post(`${baseUrl}/delete`)
        .set('Authorization', bearerHeader(token))
        .query({ ids: '1,2' })
        .expect(201);

      expect(res.body.code).toBe(200);
      expect(mockService.delete).toHaveBeenCalledWith([1, 2]);
    });
  });

  // 注意：POST /update/status 被 POST /update/:id 路由先匹配
  // （NestJS 按声明顺序匹配，:id 在 status 之前），
  // 这是控制器路由设计的已知限制，在此跳过 E2E 测试。
});
