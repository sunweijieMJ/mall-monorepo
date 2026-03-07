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

  // AdminUserController: @Controller('admin')，无版本号
  const baseUrl = '/api/admin';

  describe('GET /list', () => {
    it('获取管理员列表 → 200', async () => {
      mockAdminUserService.list.mockResolvedValue({
        list: [{ id: 1, username: 'admin' }],
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

  describe('POST /update/:id', () => {
    it('修改管理员信息 → 201', async () => {
      mockAdminUserService.update.mockResolvedValue(1);

      const res = await request(app.getHttpServer())
        .post(`${baseUrl}/update/1`)
        .set('Authorization', bearerHeader(token))
        .send({ nickName: '新昵称', email: 'test@test.com' })
        .expect(201);

      expect(res.body.code).toBe(200);
    });
  });

  describe('POST /updateStatus/:id', () => {
    it('修改帐号状态 → 201', async () => {
      mockAdminUserService.updateStatus.mockResolvedValue(1);

      const res = await request(app.getHttpServer())
        .post(`${baseUrl}/updateStatus/1`)
        .set('Authorization', bearerHeader(token))
        .query({ status: '1' })
        .expect(201);

      expect(res.body.code).toBe(200);
    });
  });

  describe('POST /delete/:id', () => {
    it('删除管理员 → 201', async () => {
      mockAdminUserService.delete.mockResolvedValue(1);

      const res = await request(app.getHttpServer())
        .post(`${baseUrl}/delete/1`)
        .set('Authorization', bearerHeader(token))
        .expect(201);

      expect(res.body.code).toBe(200);
      expect(mockAdminUserService.delete).toHaveBeenCalledWith(1);
    });
  });

  describe('POST /updatePassword', () => {
    it('修改密码 → 201', async () => {
      mockAdminUserService.updatePassword.mockResolvedValue(1);

      const res = await request(app.getHttpServer())
        .post(`${baseUrl}/updatePassword`)
        .set('Authorization', bearerHeader(token))
        .send({
          username: 'admin',
          oldPassword: 'OldPass123',
          newPassword: 'NewPass123',
        })
        .expect(201);

      expect(res.body.code).toBe(200);
    });
  });

  describe('POST /role/update', () => {
    it('分配角色（有 roleIds）→ 201', async () => {
      mockAdminUserService.updateRole.mockResolvedValue(undefined);

      const res = await request(app.getHttpServer())
        .post(`${baseUrl}/role/update`)
        .set('Authorization', bearerHeader(token))
        .query({ adminId: '1', roleIds: '1,2,3' })
        .expect(201);

      expect(res.body.code).toBe(200);
      expect(mockAdminUserService.updateRole).toHaveBeenCalledWith(
        1,
        [1, 2, 3],
      );
    });

    it('分配角色（无 roleIds）→ 201，传空数组', async () => {
      mockAdminUserService.updateRole.mockResolvedValue(undefined);

      const res = await request(app.getHttpServer())
        .post(`${baseUrl}/role/update`)
        .set('Authorization', bearerHeader(token))
        .query({ adminId: '1' })
        .expect(201);

      expect(res.body.code).toBe(200);
      expect(mockAdminUserService.updateRole).toHaveBeenCalledWith(1, []);
    });
  });

  describe('GET /role/:adminId', () => {
    it('获取用户角色列表 → 200', async () => {
      mockAdminUserService.getRoleList.mockResolvedValue([
        { id: 1, name: '超级管理员' },
      ]);

      const res = await request(app.getHttpServer())
        .get(`${baseUrl}/role/1`)
        .set('Authorization', bearerHeader(token))
        .expect(200);

      expect(res.body.code).toBe(200);
      expect(res.body.data).toHaveLength(1);
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
