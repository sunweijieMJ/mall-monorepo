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

import { CompanyAddressService } from '@/modules/oms/company-address/company-address.service';
import { CompanyAddressController } from '@/modules/oms/company-address/company-address.controller';

import { createTestApp } from '../helpers/create-test-app';
import { TestPassportModule } from '../helpers/test-passport.module';
import { generateAdminToken, bearerHeader } from '../helpers/jwt.helper';

const mockService = {
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  list: vi.fn(),
  getItem: vi.fn(),
};

@Module({
  imports: [TestPassportModule],
  controllers: [CompanyAddressController],
  providers: [{ provide: CompanyAddressService, useValue: mockService }],
})
class TestModule {}

describe('CompanyAddress API (e2e)', () => {
  let app: INestApplication;
  const token = generateAdminToken();

  beforeAll(async () => {
    app = await createTestApp(TestModule);
  });

  afterAll(() => app?.close());
  beforeEach(() => vi.clearAllMocks());

  const baseUrl = '/api/v1/companyAddress';

  describe('GET /list', () => {
    it('获取地址列表 → 200', async () => {
      mockService.list.mockResolvedValue([{ id: 1, addressName: '总部' }]);

      const res = await request(app.getHttpServer())
        .get(`${baseUrl}/list`)
        .set('Authorization', bearerHeader(token))
        .expect(200);

      expect(res.body.code).toBe(200);
      expect(mockService.list).toHaveBeenCalled();
    });

    it('无 token → 401', async () => {
      const res = await request(app.getHttpServer())
        .get(`${baseUrl}/list`)
        .expect(401);

      expect(res.body.code).toBe(401);
    });
  });

  describe('GET /:id', () => {
    it('获取地址详情 → 200', async () => {
      mockService.getItem.mockResolvedValue({ id: 1, addressName: '总部' });

      const res = await request(app.getHttpServer())
        .get(`${baseUrl}/1`)
        .set('Authorization', bearerHeader(token))
        .expect(200);

      expect(res.body.code).toBe(200);
      expect(res.body.data).toHaveProperty('addressName', '总部');
    });
  });

  describe('POST /create', () => {
    it('创建地址 → 201', async () => {
      mockService.create.mockResolvedValue({ id: 2, addressName: '分部' });

      const res = await request(app.getHttpServer())
        .post(`${baseUrl}/create`)
        .set('Authorization', bearerHeader(token))
        .send({
          addressName: '分部',
          name: '张三',
          phone: '13800138000',
          province: '广东省',
          city: '深圳市',
          region: '南山区',
          detailAddress: '科技园路1号',
        })
        .expect(201);

      expect(res.body.code).toBe(200);
      expect(mockService.create).toHaveBeenCalled();
    });
  });

  describe('POST /update/:id', () => {
    it('更新地址 → 201', async () => {
      mockService.update.mockResolvedValue(undefined);

      const res = await request(app.getHttpServer())
        .post(`${baseUrl}/update/1`)
        .set('Authorization', bearerHeader(token))
        .send({ addressName: '修改后的总部' })
        .expect(201);

      expect(res.body.code).toBe(200);
      expect(mockService.update).toHaveBeenCalledWith(1, expect.any(Object));
    });
  });

  describe('POST /delete/:id', () => {
    it('删除地址 → 201', async () => {
      mockService.delete.mockResolvedValue(undefined);

      const res = await request(app.getHttpServer())
        .post(`${baseUrl}/delete/1`)
        .set('Authorization', bearerHeader(token))
        .expect(201);

      expect(res.body.code).toBe(200);
      expect(mockService.delete).toHaveBeenCalledWith(1);
    });
  });
});
