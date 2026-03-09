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

import { AdminUserService } from '@/modules/ums/admin-user/admin-user.service';
import { AdminUserController } from '@/modules/ums/admin-user/admin-user.controller';

import { createTestApp } from '../helpers/create-test-app';
import { TestPassportModule } from '../helpers/test-passport.module';
import { generateAdminToken, bearerHeader } from '../helpers/jwt.helper';

const mockAdminUserService = {
  list: vi.fn(),
  getItem: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  updateStatus: vi.fn(),
  updatePassword: vi.fn(),
  updateRole: vi.fn(),
  getRoleList: vi.fn(),
};

@Module({
  imports: [TestPassportModule],
  controllers: [AdminUserController],
  providers: [{ provide: AdminUserService, useValue: mockAdminUserService }],
})
class TestAdminUserModule {}

describe('AdminUser API (e2e)', () => {
  let app: INestApplication;
  const token = generateAdminToken();

  beforeAll(async () => {
    app = await createTestApp(TestAdminUserModule);
  });

  afterAll(() => app?.close());
  beforeEach(() => vi.clearAllMocks());

  const baseUrl = '/api/v1/admin/ums/admins';

  describe('GET /', () => {
    it('获取管理员列表 → 200', async () => {
      mockAdminUserService.list.mockResolvedValue({
        list: [{ id: 1, username: 'admin' }],
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
  });

  describe('GET /:id', () => {
    it('获取管理员详情 → 200', async () => {
      mockAdminUserService.getItem.mockResolvedValue({
        id: 1,
        username: 'admin',
      });

      const res = await request(app.getHttpServer())
        .get(`${baseUrl}/1`)
        .set('Authorization', bearerHeader(token))
        .expect(200);

      expect(res.body.code).toBe(200);
      expect(res.body.data).toHaveProperty('username', 'admin');
    });
  });

  describe('PUT /:id', () => {
    it('修改管理员信息 → 200', async () => {
      mockAdminUserService.update.mockResolvedValue(1);

      const res = await request(app.getHttpServer())
        .put(`${baseUrl}/1`)
        .set('Authorization', bearerHeader(token))
        .send({ nickName: '新昵称', email: 'test@test.com' })
        .expect(200);

      expect(res.body.code).toBe(200);
    });
  });

  describe('PUT /:id/status', () => {
    it('修改帐号状态 → 200', async () => {
      mockAdminUserService.updateStatus.mockResolvedValue(1);

      const res = await request(app.getHttpServer())
        .put(`${baseUrl}/1/status`)
        .set('Authorization', bearerHeader(token))
        .send({ status: 1 })
        .expect(200);

      expect(res.body.code).toBe(200);
    });
  });

  describe('DELETE /:id', () => {
    it('删除管理员 → 200', async () => {
      mockAdminUserService.delete.mockResolvedValue(1);

      const res = await request(app.getHttpServer())
        .delete(`${baseUrl}/1`)
        .set('Authorization', bearerHeader(token))
        .expect(200);

      expect(res.body.code).toBe(200);
      expect(mockAdminUserService.delete).toHaveBeenCalledWith(1);
    });
  });

  describe('PUT /password', () => {
    it('修改密码 → 200', async () => {
      mockAdminUserService.updatePassword.mockResolvedValue(1);

      const res = await request(app.getHttpServer())
        .put(`${baseUrl}/password`)
        .set('Authorization', bearerHeader(token))
        .send({
          username: 'admin',
          oldPassword: 'OldPass123',
          newPassword: 'NewPass123',
        })
        .expect(200);

      expect(res.body.code).toBe(200);
    });
  });

  describe('PUT /:adminId/roles', () => {
    it('分配角色（有 roleIds）→ 200', async () => {
      mockAdminUserService.updateRole.mockResolvedValue(undefined);

      const res = await request(app.getHttpServer())
        .put(`${baseUrl}/1/roles`)
        .set('Authorization', bearerHeader(token))
        .send({ roleIds: [1, 2, 3] })
        .expect(200);

      expect(res.body.code).toBe(200);
      expect(mockAdminUserService.updateRole).toHaveBeenCalledWith(
        1,
        [1, 2, 3],
      );
    });

    it('分配角色（无 roleIds）→ 200，传空数组', async () => {
      mockAdminUserService.updateRole.mockResolvedValue(undefined);

      const res = await request(app.getHttpServer())
        .put(`${baseUrl}/1/roles`)
        .set('Authorization', bearerHeader(token))
        .send({ roleIds: [] })
        .expect(200);

      expect(res.body.code).toBe(200);
      expect(mockAdminUserService.updateRole).toHaveBeenCalledWith(1, []);
    });
  });

  describe('GET /:id/roles', () => {
    it('获取用户角色列表 → 200', async () => {
      mockAdminUserService.getRoleList.mockResolvedValue([
        { id: 1, name: '超级管理员' },
      ]);

      const res = await request(app.getHttpServer())
        .get(`${baseUrl}/1/roles`)
        .set('Authorization', bearerHeader(token))
        .expect(200);

      expect(res.body.code).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });
  });

  describe('无 token', () => {
    it('GET / → 401', async () => {
      const res = await request(app.getHttpServer()).get(baseUrl).expect(401);

      expect(res.body.code).toBe(401);
    });
  });
});
