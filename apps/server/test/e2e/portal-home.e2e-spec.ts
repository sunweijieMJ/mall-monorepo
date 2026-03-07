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

import { HomeService } from '@/modules/portal/home/home.service';
import { HomeController } from '@/modules/portal/home/home.controller';

import { createTestApp } from '../helpers/create-test-app';
import { TestPassportModule } from '../helpers/test-passport.module';

const mockService = {
  getHomeContent: vi.fn(),
};

@Module({
  imports: [TestPassportModule],
  controllers: [HomeController],
  providers: [{ provide: HomeService, useValue: mockService }],
})
class TestHomeModule {}

describe('Portal Home API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp(TestHomeModule);
  });

  afterAll(() => app?.close());
  beforeEach(() => vi.clearAllMocks());

  const baseUrl = '/api/v1/portal/home';

  describe('GET /content', () => {
    it('获取首页数据（@Public）→ 200', async () => {
      mockService.getHomeContent.mockResolvedValue({
        advertiseList: [],
        brandList: [],
        newProductList: [],
        hotProductList: [],
        subjectList: [],
      });

      const res = await request(app.getHttpServer())
        .get(`${baseUrl}/content`)
        .expect(200);

      expect(res.body.code).toBe(200);
      expect(res.body.data).toHaveProperty('advertiseList');
      expect(mockService.getHomeContent).toHaveBeenCalled();
    });
  });
});
