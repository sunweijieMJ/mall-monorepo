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

import { BrandService } from '@/modules/pms/brand/brand.service';
import {
  BrandController,
  PortalBrandController,
} from '@/modules/pms/brand/brand.controller';

import { createTestApp } from '../helpers/create-test-app';
import { TestPassportModule } from '../helpers/test-passport.module';
import { generateAdminToken, bearerHeader } from '../helpers/jwt.helper';

const mockBrandService = {
  findList: vi.fn(),
  findAll: vi.fn(),
  getItem: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
  updateShowStatus: vi.fn(),
  updateFactoryStatus: vi.fn(),
  recommendList: vi.fn(),
  getProductList: vi.fn(),
};

@Module({
  imports: [TestPassportModule],
  controllers: [BrandController, PortalBrandController],
  providers: [{ provide: BrandService, useValue: mockBrandService }],
})
class TestBrandModule {}

describe('Brand API (e2e)', () => {
  let app: INestApplication;
  const token = generateAdminToken();

  beforeAll(async () => {
    app = await createTestApp(TestBrandModule);
  });

  afterAll(() => app?.close());
  beforeEach(() => vi.clearAllMocks());

  // BrandController: @Controller('brand')，无版本号
  const baseUrl = '/api/brand';

  describe('GET /list', () => {
    const url = `${baseUrl}/list`;

    it('获取品牌列表 → 200', async () => {
      mockBrandService.findList.mockResolvedValue({
        list: [{ id: 1, name: '测试品牌' }],
        total: 1,
        pageNum: 1,
        pageSize: 10,
      });

      const res = await request(app.getHttpServer())
        .get(url)
        .set('Authorization', bearerHeader(token))
        .query({ pageNum: 1, pageSize: 10 })
        .expect(200);

      expect(res.body.code).toBe(200);
    });

    it('无 token → 401', async () => {
      const res = await request(app.getHttpServer()).get(url).expect(401);
      expect(res.body.code).toBe(401);
    });
  });

  describe('GET /:id', () => {
    it('获取品牌详情 → 200', async () => {
      mockBrandService.getItem.mockResolvedValue({
        id: 1,
        name: '测试品牌',
      });

      const res = await request(app.getHttpServer())
        .get(`${baseUrl}/1`)
        .set('Authorization', bearerHeader(token))
        .expect(200);

      expect(res.body.code).toBe(200);
      expect(res.body.data).toHaveProperty('name', '测试品牌');
    });
  });

  describe('POST /create', () => {
    it('创建品牌 → 200', async () => {
      mockBrandService.create.mockResolvedValue({ id: 1 });

      const res = await request(app.getHttpServer())
        .post(`${baseUrl}/create`)
        .set('Authorization', bearerHeader(token))
        .send({ name: '新品牌', firstLetter: 'X', sort: 0 })
        .expect(200);

      expect(res.body.code).toBe(200);
    });
  });

  describe('POST /delete', () => {
    it('批量删除品牌 → 200', async () => {
      mockBrandService.remove.mockResolvedValue(1);

      const res = await request(app.getHttpServer())
        .post(`${baseUrl}/delete`)
        .set('Authorization', bearerHeader(token))
        .query({ ids: '1,2' })
        .expect(200);

      expect(res.body.code).toBe(200);
    });
  });

  describe('GET /listAll', () => {
    it('获取所有品牌 → 200', async () => {
      mockBrandService.findAll.mockResolvedValue([
        { id: 1, name: '品牌A' },
        { id: 2, name: '品牌B' },
      ]);

      const res = await request(app.getHttpServer())
        .get(`${baseUrl}/listAll`)
        .set('Authorization', bearerHeader(token))
        .expect(200);

      expect(res.body.code).toBe(200);
      expect(res.body.data).toHaveLength(2);
    });
  });
});
