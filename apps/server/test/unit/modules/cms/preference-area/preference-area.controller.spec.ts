import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PreferenceAreaController } from '@/modules/cms/preference-area/preference-area.controller';

describe('PreferenceAreaController', () => {
  let controller: PreferenceAreaController;
  const mockService = {
    create: vi.fn(),
    delete: vi.fn(),
    list: vi.fn(),
    getProductList: vi.fn(),
    update: vi.fn(),
    getItem: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new PreferenceAreaController(mockService as any);
  });

  describe('create', () => {
    it('调用 service.create 并返回结果', async () => {
      const dto = { name: '新品推荐' } as any;
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
      mockService.delete.mockResolvedValue(undefined);

      const result = await controller.batchDelete(dto);

      expect(mockService.delete).toHaveBeenCalledWith([1, 2, 3]);
      expect(result).toBeUndefined();
    });
  });

  describe('list', () => {
    it('调用 service.list 并返回全部列表', async () => {
      const expected = [{ id: 1 }];
      mockService.list.mockResolvedValue(expected);

      const result = await controller.list();

      expect(mockService.list).toHaveBeenCalled();
      expect(result).toBe(expected);
    });
  });

  describe('getProductList', () => {
    it('调用 service.getProductList 并返回分页结果', async () => {
      const query = { pageNum: 1, pageSize: 10 } as any;
      const expected = { list: [], total: 0 };
      mockService.getProductList.mockResolvedValue(expected);

      const result = await controller.getProductList(1, query);

      expect(mockService.getProductList).toHaveBeenCalledWith(1, query);
      expect(result).toBe(expected);
    });
  });

  describe('update', () => {
    it('调用 service.update（返回 void）', async () => {
      const dto = { name: '更新专区' } as any;
      mockService.update.mockResolvedValue(undefined);

      const result = await controller.update(1, dto);

      expect(mockService.update).toHaveBeenCalledWith(1, dto);
      expect(result).toBeUndefined();
    });
  });

  describe('getItem', () => {
    it('调用 service.getItem 并返回详情', async () => {
      const expected = { id: 1, name: '优选专区' };
      mockService.getItem.mockResolvedValue(expected);

      const result = await controller.getItem(1);

      expect(mockService.getItem).toHaveBeenCalledWith(1);
      expect(result).toBe(expected);
    });
  });
});
