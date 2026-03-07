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

import { MemberLevelService } from '@/modules/ums/member-level/member-level.service';
import { MemberLevelController } from '@/modules/ums/member-level/member-level.controller';

import { createTestApp } from '../helpers/create-test-app';
import { TestPassportModule } from '../helpers/test-passport.module';
import { generateAdminToken, bearerHeader } from '../helpers/jwt.helper';

const mockService = {
  list: vi.fn(),
  getItem: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

@Module({
  imports: [TestPassportModule],
  controllers: [MemberLevelController],
  providers: [{ provide: MemberLevelService, useValue: mockService }],
})
class TestMemberLevelModule {}

describe('MemberLevel API (e2e)', () => {
  let app: INestApplication;
  const token = generateAdminToken();

  beforeAll(async () => {
    app = await createTestApp(TestMemberLevelModule);
  });

  afterAll(() => app?.close());
  beforeEach(() => vi.clearAllMocks());

  const baseUrl = '/api/v1/admin/ums/member-levels';

  describe('GET /list', () => {
    it('获取会员等级列表 → 200', async () => {
      mockService.list.mockResolvedValue([
        { id: 1, name: '普通会员', defaultStatus: 1 },
      ]);

      const res = await request(app.getHttpServer())
        .get(`${baseUrl}/list`)
        .set('Authorization', bearerHeader(token))
        .expect(200);

      expect(res.body.code).toBe(200);
      expect(mockService.list).toHaveBeenCalledWith(undefined);
    });

    it('按 defaultStatus 过滤 → 200', async () => {
      mockService.list.mockResolvedValue([]);

      const res = await request(app.getHttpServer())
        .get(`${baseUrl}/list`)
        .set('Authorization', bearerHeader(token))
        .query({ defaultStatus: '1' })
        .expect(200);

      expect(res.body.code).toBe(200);
      expect(mockService.list).toHaveBeenCalledWith(1);
    });
  });

  describe('GET /:id', () => {
    it('获取单个会员等级 → 200', async () => {
      mockService.getItem.mockResolvedValue({
        id: 1,
        name: '普通会员',
      });

      const res = await request(app.getHttpServer())
        .get(`${baseUrl}/1`)
        .set('Authorization', bearerHeader(token))
        .expect(200);

      expect(res.body.code).toBe(200);
      expect(res.body.data).toHaveProperty('name', '普通会员');
    });
  });

  describe('POST /create', () => {
    it('创建会员等级 → 201', async () => {
      mockService.create.mockResolvedValue({ id: 2 });

      const res = await request(app.getHttpServer())
        .post(`${baseUrl}/create`)
        .set('Authorization', bearerHeader(token))
        .send({ name: 'VIP', growthPoint: 1000 })
        .expect(201);

      expect(res.body.code).toBe(200);
    });
  });

  describe('PUT /update/:id', () => {
    it('更新会员等级 → 200', async () => {
      mockService.update.mockResolvedValue(undefined);

      const res = await request(app.getHttpServer())
        .put(`${baseUrl}/update/1`)
        .set('Authorization', bearerHeader(token))
        .send({ name: 'SVIP' })
        .expect(200);

      expect(res.body.code).toBe(200);
    });
  });

  describe('DELETE /delete', () => {
    it('批量删除会员等级 → 200', async () => {
      mockService.delete.mockResolvedValue(undefined);

      const res = await request(app.getHttpServer())
        .delete(`${baseUrl}/delete`)
        .set('Authorization', bearerHeader(token))
        .query({ ids: '1,2' })
        .expect(200);

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
