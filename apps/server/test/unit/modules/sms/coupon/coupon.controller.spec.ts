import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  CouponController,
  CouponHistoryController,
} from '@/modules/sms/coupon/coupon.controller';

const mockService = {
  create: vi.fn(),
  list: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  detail: vi.fn(),
  listHistory: vi.fn(),
};

describe('CouponController', () => {
  let controller: CouponController;

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new CouponController(mockService as any);
  });

  describe('create', () => {
    it('调用 couponService.create 并返回结果', async () => {
      const dto = { name: '满100减10' };
      const expected = { id: 1 };
      mockService.create.mockResolvedValue(expected);

      const result = await controller.create(dto as any);

      expect(mockService.create).toHaveBeenCalledWith(dto);
      expect(result).toBe(expected);
    });
  });

  describe('list', () => {
    it('调用 couponService.list 并返回分页结果', async () => {
      const query = { page: 1, limit: 10 };
      const expected = { list: [], total: 0 };
      mockService.list.mockResolvedValue(expected);

      const result = await controller.list(query as any);

      expect(mockService.list).toHaveBeenCalledWith(query);
      expect(result).toBe(expected);
    });
  });

  describe('update', () => {
    it('调用 couponService.update 并返回受影响行数', async () => {
      const dto = { name: '满200减20' };
      mockService.update.mockResolvedValue(1);

      const result = await controller.update(1, dto as any);

      expect(mockService.update).toHaveBeenCalledWith(1, dto);
      expect(result).toBe(1);
    });
  });

  describe('delete', () => {
    it('调用 couponService.delete 并返回受影响行数', async () => {
      mockService.delete.mockResolvedValue(1);

      const result = await controller.delete(1);

      expect(mockService.delete).toHaveBeenCalledWith(1);
      expect(result).toBe(1);
    });
  });

  describe('getItem', () => {
    it('调用 couponService.detail 并返回优惠券详情', async () => {
      const expected = { id: 1, name: '满100减10' };
      mockService.detail.mockResolvedValue(expected);

      const result = await controller.getItem(1);

      expect(mockService.detail).toHaveBeenCalledWith(1);
      expect(result).toBe(expected);
    });
  });
});

describe('CouponHistoryController', () => {
  let controller: CouponHistoryController;

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new CouponHistoryController(mockService as any);
  });

  describe('list', () => {
    it('调用 couponService.listHistory 并返回分页结果', async () => {
      const query = { page: 1, limit: 10, couponId: 1 };
      const expected = { list: [], total: 0 };
      mockService.listHistory.mockResolvedValue(expected);

      const result = await controller.list(query as any);

      expect(mockService.listHistory).toHaveBeenCalledWith(query);
      expect(result).toBe(expected);
    });
  });
});
