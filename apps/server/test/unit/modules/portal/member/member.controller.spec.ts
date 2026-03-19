import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  MemberInfoController,
  MemberAddressController,
  MemberCouponController,
  PortalCouponController,
} from '@/modules/portal/member/member.controller';

const mockService = {
  getCurrentMember: vi.fn(),
  updateInfo: vi.fn(),
  listAddress: vi.fn(),
  getAddress: vi.fn(),
  addAddress: vi.fn(),
  updateAddress: vi.fn(),
  deleteAddress: vi.fn(),
  addCoupon: vi.fn(),
  listCouponObjects: vi.fn(),
  listMemberCoupons: vi.fn(),
  listCouponsByProduct: vi.fn(),
  listCartCoupons: vi.fn(),
  listAvailableCoupons: vi.fn(),
};

const user = { sub: 1 };

describe('MemberInfoController', () => {
  let controller: MemberInfoController;

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new MemberInfoController(mockService as any);
  });

  describe('getInfo', () => {
    it('调用 memberService.getCurrentMember 并返回会员信息', async () => {
      const expected = { id: 1, nickname: 'test' };
      mockService.getCurrentMember.mockResolvedValue(expected);

      const result = await controller.getInfo(user as any);

      expect(mockService.getCurrentMember).toHaveBeenCalledWith(1);
      expect(result).toBe(expected);
    });
  });

  describe('updateInfo', () => {
    it('调用 memberService.updateInfo 并返回受影响行数', async () => {
      const dto = { nickname: 'new' };
      mockService.updateInfo.mockResolvedValue(1);

      const result = await controller.updateInfo(dto as any, user as any);

      expect(mockService.updateInfo).toHaveBeenCalledWith(1, dto);
      expect(result).toBe(1);
    });
  });
});

describe('MemberAddressController', () => {
  let controller: MemberAddressController;

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new MemberAddressController(mockService as any);
  });

  describe('list', () => {
    it('调用 memberService.listAddress 并返回地址列表', async () => {
      const expected = [{ id: 1 }];
      mockService.listAddress.mockResolvedValue(expected);

      const result = await controller.list(user as any);

      expect(mockService.listAddress).toHaveBeenCalledWith(1);
      expect(result).toBe(expected);
    });
  });

  describe('getItem', () => {
    it('调用 memberService.getAddress 并返回地址详情', async () => {
      const expected = { id: 10 };
      mockService.getAddress.mockResolvedValue(expected);

      const result = await controller.getItem(10, user as any);

      expect(mockService.getAddress).toHaveBeenCalledWith(10, 1);
      expect(result).toBe(expected);
    });
  });

  describe('create', () => {
    it('调用 memberService.addAddress 并返回受影响行数', async () => {
      const dto = { name: '张三', phone: '13800000000' };
      mockService.addAddress.mockResolvedValue(1);

      const result = await controller.create(dto as any, user as any);

      expect(mockService.addAddress).toHaveBeenCalledWith(1, dto);
      expect(result).toBe(1);
    });
  });

  describe('update', () => {
    it('调用 memberService.updateAddress 并返回受影响行数', async () => {
      const dto = { name: '李四' };
      mockService.updateAddress.mockResolvedValue(1);

      const result = await controller.update(10, dto as any, user as any);

      expect(mockService.updateAddress).toHaveBeenCalledWith(10, 1, dto);
      expect(result).toBe(1);
    });
  });

  describe('delete', () => {
    it('调用 memberService.deleteAddress 并返回受影响行数', async () => {
      mockService.deleteAddress.mockResolvedValue(1);

      const result = await controller.delete(10, user as any);

      expect(mockService.deleteAddress).toHaveBeenCalledWith(10, 1);
      expect(result).toBe(1);
    });
  });
});

describe('MemberCouponController', () => {
  let controller: MemberCouponController;

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new MemberCouponController(mockService as any);
  });

  describe('create', () => {
    it('调用 memberService.addCoupon 并返回受影响行数', async () => {
      mockService.addCoupon.mockResolvedValue(1);

      const result = await controller.create(5, user as any);

      expect(mockService.addCoupon).toHaveBeenCalledWith(1, 5);
      expect(result).toBe(1);
    });
  });

  describe('listCouponObjects', () => {
    it('调用 memberService.listCouponObjects 并返回优惠券列表', async () => {
      const expected = { list: [], total: 0 };
      const query = { page: 1, limit: 10 };
      mockService.listCouponObjects.mockResolvedValue(expected);

      const result = await controller.listCouponObjects(
        user as any,
        0,
        query as any,
      );

      expect(mockService.listCouponObjects).toHaveBeenCalledWith(1, 0, query);
      expect(result).toBe(expected);
    });
  });

  describe('listMemberCoupons', () => {
    it('调用 memberService.listMemberCoupons 并返回历史记录', async () => {
      const expected = { list: [], total: 0 };
      const query = { page: 1, limit: 10 };
      mockService.listMemberCoupons.mockResolvedValue(expected);

      const result = await controller.listMemberCoupons(
        user as any,
        1,
        query as any,
      );

      expect(mockService.listMemberCoupons).toHaveBeenCalledWith(1, 1, query);
      expect(result).toBe(expected);
    });
  });

  describe('listCouponsByProduct', () => {
    it('调用 memberService.listCouponsByProduct 并返回可用优惠券', async () => {
      const expected = [{ id: 1 }];
      mockService.listCouponsByProduct.mockResolvedValue(expected);

      const result = await controller.listCouponsByProduct(10, user as any);

      expect(mockService.listCouponsByProduct).toHaveBeenCalledWith(1, 10);
      expect(result).toBe(expected);
    });
  });

  describe('listCartCoupons', () => {
    it('调用 memberService.listCartCoupons 并返回可用优惠券', async () => {
      const expected = [{ id: 1 }];
      mockService.listCartCoupons.mockResolvedValue(expected);

      const result = await controller.listCartCoupons(user as any, [1, 2]);

      expect(mockService.listCartCoupons).toHaveBeenCalledWith(1, [1, 2]);
      expect(result).toBe(expected);
    });

    it('当 cartIds 为空数组时直接返回空数组', async () => {
      const result = await controller.listCartCoupons(user as any, []);

      expect(mockService.listCartCoupons).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });
});

describe('PortalCouponController', () => {
  let controller: PortalCouponController;

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new PortalCouponController(mockService as any);
  });

  describe('listAvailableCoupons', () => {
    it('调用 memberService.listAvailableCoupons 并返回分页结果', async () => {
      const query = { page: 1, limit: 10 };
      const expected = { list: [], total: 0 };
      mockService.listAvailableCoupons.mockResolvedValue(expected);

      const result = await controller.listAvailableCoupons(query as any);

      expect(mockService.listAvailableCoupons).toHaveBeenCalledWith(1, 10);
      expect(result).toBe(expected);
    });
  });
});
