import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AdminMenuController } from '@/modules/ums/admin-menu/admin-menu.controller';

describe('AdminMenuController', () => {
  let controller: AdminMenuController;
  const mockService = {
    create: vi.fn(),
    list: vi.fn(),
    treeList: vi.fn(),
    update: vi.fn(),
    updateHidden: vi.fn(),
    delete: vi.fn(),
    getItem: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new AdminMenuController(mockService as any);
  });

  describe('create', () => {
    it('调用 service.create 并返回结果', async () => {
      const dto = { title: '商品管理' } as any;
      const expected = { id: 1, ...dto };
      mockService.create.mockResolvedValue(expected);

      const result = await controller.create(dto);

      expect(mockService.create).toHaveBeenCalledWith(dto);
      expect(result).toBe(expected);
    });
  });

  describe('list', () => {
    it('调用 service.list 并返回分页结果', async () => {
      const q = { page: 1, limit: 10 } as any;
      const expected = { list: [], total: 0 };
      mockService.list.mockResolvedValue(expected);

      const result = await controller.list(0, q);

      expect(mockService.list).toHaveBeenCalledWith(0, q);
      expect(result).toBe(expected);
    });
  });

  describe('treeList', () => {
    it('调用 service.treeList 并返回树形结构', async () => {
      const expected = [{ id: 1, children: [] }];
      mockService.treeList.mockResolvedValue(expected);

      const result = await controller.treeList();

      expect(mockService.treeList).toHaveBeenCalled();
      expect(result).toBe(expected);
    });
  });

  describe('update', () => {
    it('调用 service.update 并返回受影响行数', async () => {
      const dto = { title: '用户管理' } as any;
      mockService.update.mockResolvedValue(1);

      const result = await controller.update(1, dto);

      expect(mockService.update).toHaveBeenCalledWith(1, dto);
      expect(result).toBe(1);
    });
  });

  describe('updateHiddenStatus', () => {
    it('调用 service.updateHidden 并返回受影响行数', async () => {
      const dto = { hidden: 1 };
      mockService.updateHidden.mockResolvedValue(1);

      const result = await controller.updateHiddenStatus(1, dto);

      expect(mockService.updateHidden).toHaveBeenCalledWith(1, 1);
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
    it('调用 service.getItem 并返回菜单详情', async () => {
      const expected = { id: 1, title: '商品管理' };
      mockService.getItem.mockResolvedValue(expected);

      const result = await controller.getItem(1);

      expect(mockService.getItem).toHaveBeenCalledWith(1);
      expect(result).toBe(expected);
    });
  });
});
