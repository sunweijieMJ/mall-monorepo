import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MemberLevelController } from '@/modules/ums/member-level/member-level.controller';

describe('MemberLevelController', () => {
  let controller: MemberLevelController;
  const mockService = {
    create: vi.fn(),
    delete: vi.fn(),
    list: vi.fn(),
    update: vi.fn(),
    getItem: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new MemberLevelController(mockService as any);
  });

  describe('create', () => {
    it('调用 service.create 并返回结果', async () => {
      const dto = { name: '黄金会员' } as any;
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
    it('调用 service.list 并返回会员等级列表', async () => {
      const expected = [{ id: 1, name: '黄金会员' }];
      mockService.list.mockResolvedValue(expected);

      const result = await controller.list(1);

      expect(mockService.list).toHaveBeenCalledWith(1);
      expect(result).toBe(expected);
    });
  });

  describe('update', () => {
    it('调用 service.update 并返回更新后的实体', async () => {
      const dto = { name: '白银会员' } as any;
      const expected = { id: 1, name: '白银会员' };
      mockService.update.mockResolvedValue(expected);

      const result = await controller.update(1, dto);

      expect(mockService.update).toHaveBeenCalledWith(1, dto);
      expect(result).toBe(expected);
    });
  });

  describe('getItem', () => {
    it('调用 service.getItem 并返回会员等级详情', async () => {
      const expected = { id: 1, name: '黄金会员' };
      mockService.getItem.mockResolvedValue(expected);

      const result = await controller.getItem(1);

      expect(mockService.getItem).toHaveBeenCalledWith(1);
      expect(result).toBe(expected);
    });
  });
});
