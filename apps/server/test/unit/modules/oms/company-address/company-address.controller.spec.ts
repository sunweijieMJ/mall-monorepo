import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CompanyAddressController } from '@/modules/oms/company-address/company-address.controller';

describe('CompanyAddressController', () => {
  let controller: CompanyAddressController;
  const mockService = {
    create: vi.fn(),
    list: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    getItem: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new CompanyAddressController(mockService as any);
  });

  describe('create', () => {
    it('调用 service.create 并返回结果', async () => {
      const dto = { name: '公司地址' } as any;
      const expected = { id: 1, ...dto };
      mockService.create.mockResolvedValue(expected);

      const result = await controller.create(dto);

      expect(mockService.create).toHaveBeenCalledWith(dto);
      expect(result).toBe(expected);
    });
  });

  describe('list', () => {
    it('调用 service.list 并返回地址列表', async () => {
      const expected = [{ id: 1 }];
      mockService.list.mockResolvedValue(expected);

      const result = await controller.list();

      expect(mockService.list).toHaveBeenCalled();
      expect(result).toBe(expected);
    });
  });

  describe('update', () => {
    it('调用 service.update 并返回受影响行数', async () => {
      const dto = { name: '更新地址' } as any;
      mockService.update.mockResolvedValue(1);

      const result = await controller.update(1, dto);

      expect(mockService.update).toHaveBeenCalledWith(1, dto);
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
    it('调用 service.getItem 并返回详情', async () => {
      const expected = { id: 1, name: '公司地址' };
      mockService.getItem.mockResolvedValue(expected);

      const result = await controller.getItem(1);

      expect(mockService.getItem).toHaveBeenCalledWith(1);
      expect(result).toBe(expected);
    });
  });
});
