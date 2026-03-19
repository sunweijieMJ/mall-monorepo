import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AdminRoleController } from '@/modules/ums/admin-role/admin-role.controller';

describe('AdminRoleController', () => {
  let controller: AdminRoleController;
  const mockService = {
    create: vi.fn(),
    delete: vi.fn(),
    list: vi.fn(),
    listAll: vi.fn(),
    update: vi.fn(),
    updateStatus: vi.fn(),
    getItem: vi.fn(),
    listMenu: vi.fn(),
    listResource: vi.fn(),
    allocMenu: vi.fn(),
    allocResource: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new AdminRoleController(mockService as any);
  });

  describe('create', () => {
    it('调用 service.create 并返回结果', async () => {
      const dto = { name: '超级管理员' } as any;
      const expected = { id: 1, ...dto };
      mockService.create.mockResolvedValue(expected);

      const result = await controller.create(dto);

      expect(mockService.create).toHaveBeenCalledWith(dto);
      expect(result).toBe(expected);
    });
  });

  describe('batchDelete', () => {
    it('提取 dto.ids 调用 service.delete', async () => {
      const dto = { ids: [1, 2, 3] };
      mockService.delete.mockResolvedValue(3);

      const result = await controller.batchDelete(dto);

      expect(mockService.delete).toHaveBeenCalledWith([1, 2, 3]);
      expect(result).toBe(3);
    });
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

  describe('listAll', () => {
    it('调用 service.listAll 并返回所有角色', async () => {
      const expected = [{ id: 1 }];
      mockService.listAll.mockResolvedValue(expected);

      const result = await controller.listAll();

      expect(mockService.listAll).toHaveBeenCalled();
      expect(result).toBe(expected);
    });
  });

  describe('update', () => {
    it('调用 service.update 并返回受影响行数', async () => {
      const dto = { name: '编辑角色' } as any;
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

  describe('getItem', () => {
    it('调用 service.getItem 并返回角色详情', async () => {
      const expected = { id: 1, name: '超级管理员' };
      mockService.getItem.mockResolvedValue(expected);

      const result = await controller.getItem(1);

      expect(mockService.getItem).toHaveBeenCalledWith(1);
      expect(result).toBe(expected);
    });
  });

  describe('listMenu', () => {
    it('调用 service.listMenu 并返回角色菜单列表', async () => {
      const expected = [{ id: 1, title: '商品管理' }];
      mockService.listMenu.mockResolvedValue(expected);

      const result = await controller.listMenu(1);

      expect(mockService.listMenu).toHaveBeenCalledWith(1);
      expect(result).toBe(expected);
    });
  });

  describe('listResource', () => {
    it('调用 service.listResource 并返回角色资源列表', async () => {
      const expected = [{ id: 1, name: '商品管理' }];
      mockService.listResource.mockResolvedValue(expected);

      const result = await controller.listResource(1);

      expect(mockService.listResource).toHaveBeenCalledWith(1);
      expect(result).toBe(expected);
    });
  });

  describe('allocMenu', () => {
    it('调用 service.allocMenu 并返回受影响行数', async () => {
      const dto = { menuIds: [1, 2, 3] };
      mockService.allocMenu.mockResolvedValue(3);

      const result = await controller.allocMenu(1, dto);

      expect(mockService.allocMenu).toHaveBeenCalledWith(1, [1, 2, 3]);
      expect(result).toBe(3);
    });
  });

  describe('allocResource', () => {
    it('调用 service.allocResource 并返回受影响行数', async () => {
      const dto = { resourceIds: [1, 2, 3] };
      mockService.allocResource.mockResolvedValue(3);

      const result = await controller.allocResource(1, dto);

      expect(mockService.allocResource).toHaveBeenCalledWith(1, [1, 2, 3]);
      expect(result).toBe(3);
    });
  });
});
