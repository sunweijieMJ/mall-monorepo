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

import { ReturnApplyService } from '@/modules/oms/return-apply/return-apply.service';
import {
  ReturnApplyController,
  PortalReturnApplyController,
} from '@/modules/oms/return-apply/return-apply.controller';

import { createTestApp } from '../helpers/create-test-app';
import { TestPassportModule } from '../helpers/test-passport.module';
import { generateAdminToken, bearerHeader } from '../helpers/jwt.helper';

const mockReturnApplyService = {
  list: vi.fn(),
  detail: vi.fn(),
  updateStatus: vi.fn(),
  handle: vi.fn(),
  confirmReceive: vi.fn(),
  delete: vi.fn(),
  portalCreate: vi.fn(),
  portalList: vi.fn(),
};

@Module({
  imports: [TestPassportModule],
  controllers: [ReturnApplyController, PortalReturnApplyController],
  providers: [
    { provide: ReturnApplyService, useValue: mockReturnApplyService },
  ],
})
class TestReturnApplyModule {}

describe('ReturnApply API (e2e)', () => {
  let app: INestApplication;
  const token = generateAdminToken();

  beforeAll(async () => {
    app = await createTestApp(TestReturnApplyModule);
  });

  afterAll(() => app?.close());
  beforeEach(() => vi.clearAllMocks());

  // ReturnApplyController: @Controller({ path: 'admin/oms/returns', version: '1' })
  const baseUrl = '/api/v1/admin/oms/returns';

  describe('GET /list', () => {
    it('获取退货申请列表 → 200', async () => {
      mockReturnApplyService.list.mockResolvedValue({
        list: [{ id: 1, orderSn: '202501010001' }],
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
  });

  describe('GET /:id', () => {
    it('获取退货申请详情 → 200', async () => {
      mockReturnApplyService.detail.mockResolvedValue({
        id: 1,
        orderSn: '202501010001',
        memberUsername: 'test-user',
      });

      const res = await request(app.getHttpServer())
        .get(`${baseUrl}/1`)
        .set('Authorization', bearerHeader(token))
        .expect(200);

      expect(res.body.code).toBe(200);
      expect(res.body.data).toHaveProperty('orderSn', '202501010001');
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
