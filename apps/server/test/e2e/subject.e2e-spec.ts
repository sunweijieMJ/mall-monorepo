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

import { SubjectService } from '@/modules/cms/subject/subject.service';
import { SubjectController } from '@/modules/cms/subject/subject.controller';

import { createTestApp } from '../helpers/create-test-app';
import { TestPassportModule } from '../helpers/test-passport.module';
import { generateAdminToken, bearerHeader } from '../helpers/jwt.helper';

const mockService = {
  list: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  getProductList: vi.fn(),
};

@Module({
  imports: [TestPassportModule],
  controllers: [SubjectController],
  providers: [{ provide: SubjectService, useValue: mockService }],
})
class TestModule {}

describe('Subject API (e2e)', () => {
  let app: INestApplication;
  const token = generateAdminToken();

  beforeAll(async () => {
    app = await createTestApp(TestModule);
  });

  afterAll(() => app?.close());
  beforeEach(() => vi.clearAllMocks());

  const baseUrl = '/api/v1/admin/cms/subjects';

  describe('GET /list', () => {
    it('分页查询专题列表 → 200', async () => {
      mockService.list.mockResolvedValue({
        list: [{ id: 1, title: '春季新品' }],
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

  describe('POST /create', () => {
    it('创建专题 → 201', async () => {
      mockService.create.mockResolvedValue({ id: 1, title: '新专题' });

      const res = await request(app.getHttpServer())
        .post(`${baseUrl}/create`)
        .set('Authorization', bearerHeader(token))
        .send({ title: '新专题', categoryName: '手机' })
        .expect(201);

      expect(res.body.code).toBe(200);
    });
  });

  describe('PUT /update/:id', () => {
    it('更新专题 → 200', async () => {
      mockService.update.mockResolvedValue(undefined);

      const res = await request(app.getHttpServer())
        .put(`${baseUrl}/update/1`)
        .set('Authorization', bearerHeader(token))
        .send({ title: '修改后专题' })
        .expect(200);

      expect(res.body.code).toBe(200);
    });
  });

  describe('DELETE /delete', () => {
    it('批量删除专题 → 200', async () => {
      mockService.delete.mockResolvedValue(undefined);

      const res = await request(app.getHttpServer())
        .delete(`${baseUrl}/delete`)
        .set('Authorization', bearerHeader(token))
        .query({ ids: '1,2' })
        .expect(200);

      expect(res.body.code).toBe(200);
      expect(mockService.delete).toHaveBeenCalledWith([1, 2]);
    });
  });

  describe('GET /productList', () => {
    it('查询专题关联商品列表 → 200', async () => {
      mockService.getProductList.mockResolvedValue({
        list: [{ id: 1, name: '商品A' }],
        total: 1,
      });

      const res = await request(app.getHttpServer())
        .get(`${baseUrl}/productList`)
        .set('Authorization', bearerHeader(token))
        .query({ subjectId: 1, pageNum: 1, pageSize: 10 })
        .expect(200);

      expect(res.body.code).toBe(200);
    });
  });
});
