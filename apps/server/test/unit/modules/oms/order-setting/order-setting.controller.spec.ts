import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OrderSettingController } from '@/modules/oms/order-setting/order-setting.controller';

describe('OrderSettingController', () => {
  let controller: OrderSettingController;
  const mockService = {
    update: vi.fn(),
    getItem: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new OrderSettingController(mockService as any);
  });

  describe('update', () => {
    it('调用 service.update 并返回受影响行数', async () => {
      const dto = { flashOrderOvertime: 60 } as any;
      mockService.update.mockResolvedValue(1);

      const result = await controller.update(1, dto);

      expect(mockService.update).toHaveBeenCalledWith(1, dto);
      expect(result).toBe(1);
    });
  });

  describe('getItem', () => {
    it('调用 service.getItem 并返回订单设置详情', async () => {
      const expected = { id: 1, flashOrderOvertime: 60 };
      mockService.getItem.mockResolvedValue(expected);

      const result = await controller.getItem(1);

      expect(mockService.getItem).toHaveBeenCalledWith(1);
      expect(result).toBe(expected);
    });
  });
});
