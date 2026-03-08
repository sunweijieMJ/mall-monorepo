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

import { PreferenceAreaService } from '@/modules/cms/preference-area/preference-area.service';
import { PreferenceAreaController } from '@/modules/cms/preference-area/preference-area.controller';

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
  controllers: [PreferenceAreaController],
  providers: [{ provide: PreferenceAreaService, useValue: mockService }],
})
class TestModule {}

describe('PreferenceArea API (e2e)', () => {
  let app: INestApplication;
  const token = generateAdminToken();

  beforeAll(async () => {
    app = await createTestApp(TestModule);
  });

  afterAll(() => app?.close());
  beforeEach(() => vi.clearAllMocks());

  const baseUrl = '/api/v1/admin/cms/preference-areas';

  describe('GET /list', () => {
    it('查询优选专区列表 → 200', async () => {
      mockService.list.mockResolvedValue([{ id: 1, name: '精选推荐' }]);

      const res = await request(app.getHttpServer())
        .get(`${baseUrl}/list`)
        .set('Authorization', bearerHeader(token))
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
    it('创建优选专区 → 201', async () => {
      mockService.create.mockResolvedValue({ id: 1, name: '新品专区' });

      const res = await request(app.getHttpServer())
        .post(`${baseUrl}/create`)
        .set('Authorization', bearerHeader(token))
        .send({ name: '新品专区' })
        .expect(200);

      expect(res.body.code).toBe(200);
    });
  });

  describe('PUT /update/:id', () => {
    it('更新优选专区 → 200', async () => {
      mockService.update.mockResolvedValue(undefined);

      const res = await request(app.getHttpServer())
        .put(`${baseUrl}/update/1`)
        .set('Authorization', bearerHeader(token))
        .send({ name: '修改后的专区' })
        .expect(200);

      expect(res.body.code).toBe(200);
    });
  });

  describe('DELETE /delete', () => {
    it('批量删除优选专区 → 200', async () => {
      mockService.delete.mockResolvedValue(undefined);

      const res = await request(app.getHttpServer())
        .delete(`${baseUrl}/delete`)
        .set('Authorization', bearerHeader(token))
        .send({ ids: [1, 2] })
        .expect(200);

      expect(res.body.code).toBe(200);
      expect(mockService.delete).toHaveBeenCalledWith([1, 2]);
    });
  });

  describe('GET /product-list', () => {
    it('查询优选专区关联商品列表 → 200', async () => {
      mockService.getProductList.mockResolvedValue({
        list: [{ id: 1, name: '商品B' }],
        total: 1,
      });

      const res = await request(app.getHttpServer())
        .get(`${baseUrl}/product-list`)
        .set('Authorization', bearerHeader(token))
        .query({ preferenceAreaId: 1, pageNum: 1, pageSize: 10 })
        .expect(200);

      expect(res.body.code).toBe(200);
    });
  });
});
