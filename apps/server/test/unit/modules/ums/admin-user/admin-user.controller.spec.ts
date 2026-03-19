import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AdminUserController } from '@/modules/ums/admin-user/admin-user.controller';

describe('AdminUserController', () => {
  let controller: AdminUserController;
  const mockService = {
    list: vi.fn(),
    updatePassword: vi.fn(),
    update: vi.fn(),
    updateStatus: vi.fn(),
    updateRole: vi.fn(),
    resetPassword: vi.fn(),
    delete: vi.fn(),
    getItem: vi.fn(),
    getRoleList: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new AdminUserController(mockService as any);
  });

  describe('list', () => {
    it('调用 service.list 并返回分页结果', async () => {
      const q = { page: 1, limit: 10 } as any;
      const expected = { list: [], total: 0 };
      mockService.list.mockResolvedValue(expected);

      const result = await controller.list('admin', q);

      expect(mockService.list).toHaveBeenCalledWith('admin', q);
      expect(result).toBe(expected);
    });
  });

  describe('updatePassword', () => {
    it('从 @CurrentUser 获取用户名并调用 service.updatePassword', async () => {
      const user = { sub: 1, username: 'admin' } as any;
      const dto = { oldPassword: '123456', newPassword: '654321' };
      mockService.updatePassword.mockResolvedValue(1);

      const result = await controller.updatePassword(user, dto);

      expect(mockService.updatePassword).toHaveBeenCalledWith({
        username: 'admin',
        ...dto,
      });
      expect(result).toBe(1);
    });
  });

  describe('update', () => {
    it('调用 service.update 并返回受影响行数', async () => {
      const dto = { nickName: '管理员' } as any;
      mockService.update.mockResolvedValue(1);

      const result = await controller.update(1, dto);

      expect(mockService.update).toHaveBeenCalledWith(1, dto);
      expect(result).toBe(1);
    });
  });

  describe('updateStatus', () => {
    it('调用 service.updateStatus 并返回受影响行数', async () => {
      const dto = { status: 1 };
      mockService.updateStatus.mockResolvedValue(1);

      const result = await controller.updateStatus(1, dto);

      expect(mockService.updateStatus).toHaveBeenCalledWith(1, 1);
      expect(result).toBe(1);
    });
  });

  describe('updateRole', () => {
    it('提取 dto.roleIds 调用 service.updateRole', async () => {
      const dto = { roleIds: [1, 2, 3] };
      mockService.updateRole.mockResolvedValue(3);

      const result = await controller.updateRole(1, dto);

      expect(mockService.updateRole).toHaveBeenCalledWith(1, [1, 2, 3]);
      expect(result).toBe(3);
    });
  });

  describe('resetPassword', () => {
    it('提取 dto.newPassword 调用 service.resetPassword', async () => {
      const dto = { newPassword: 'newpass123' };
      mockService.resetPassword.mockResolvedValue(1);

      const result = await controller.resetPassword(1, dto);

      expect(mockService.resetPassword).toHaveBeenCalledWith(1, 'newpass123');
      expect(result).toBe(1);
    });
  });

  describe('delete', () => {
    it('调用 service.delete 并返回受影响行数', async () => {
      mockService.delete.mockResolvedValue(1);

      const result = await controller.delete(1);

      expect(mockService.delete).toHaveBeenCalledWith(1);
      expect(result).toBe(1);
    });
  });

  describe('getItem', () => {
    it('调用 service.getItem 并返回用户详情', async () => {
      const expected = { id: 1, username: 'admin' };
      mockService.getItem.mockResolvedValue(expected);

      const result = await controller.getItem(1);

      expect(mockService.getItem).toHaveBeenCalledWith(1);
      expect(result).toBe(expected);
    });
  });

  describe('getRoleList', () => {
    it('调用 service.getRoleList 并返回用户角色列表', async () => {
      const expected = [{ id: 1, name: '超级管理员' }];
      mockService.getRoleList.mockResolvedValue(expected);

      const result = await controller.getRoleList(1);

      expect(mockService.getRoleList).toHaveBeenCalledWith(1);
      expect(result).toBe(expected);
    });
  });
});
