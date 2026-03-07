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

import { OssService } from '@/modules/oss/oss.service';
import { OssController } from '@/modules/oss/oss.controller';

import { createTestApp } from '../helpers/create-test-app';
import { TestPassportModule } from '../helpers/test-passport.module';
import { generateAdminToken, bearerHeader } from '../helpers/jwt.helper';

const mockOssService = {
  getPolicy: vi.fn(),
};

@Module({
  imports: [TestPassportModule],
  controllers: [OssController],
  providers: [{ provide: OssService, useValue: mockOssService }],
})
class TestOssModule {}

describe('OSS API (e2e)', () => {
  let app: INestApplication;
  const token = generateAdminToken();

  beforeAll(async () => {
    app = await createTestApp(TestOssModule);
  });

  afterAll(() => app?.close());
  beforeEach(() => vi.clearAllMocks());

  const baseUrl = '/api/v1/admin/aliyun/oss';

  describe('GET /policy', () => {
    it('获取OSS上传策略 → 200', async () => {
      mockOssService.getPolicy.mockReturnValue({
        accessId: 'test-access-id',
        policy: 'test-policy',
        signature: 'test-signature',
        dir: 'mall/',
        host: 'https://oss.example.com',
      });

      const res = await request(app.getHttpServer())
        .get(`${baseUrl}/policy`)
        .set('Authorization', bearerHeader(token))
        .expect(200);

      expect(res.body.code).toBe(200);
      expect(res.body.data).toHaveProperty('policy');
    });

    it('无 token → 401', async () => {
      const res = await request(app.getHttpServer())
        .get(`${baseUrl}/policy`)
        .expect(401);

      expect(res.body.code).toBe(401);
    });
  });
});
