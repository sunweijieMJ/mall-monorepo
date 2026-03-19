import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CartController } from '@/modules/portal/cart/cart.controller';

describe('CartController', () => {
  let controller: CartController;
  const mockCartService = {
    add: vi.fn(),
    delete: vi.fn(),
    getCartList: vi.fn(),
    getCount: vi.fn(),
    getCartProduct: vi.fn(),
    clear: vi.fn(),
    updateQuantity: vi.fn(),
    updateAttr: vi.fn(),
  };
  const mockOrderService = {
    listCartPromotion: vi.fn(),
  };
  const user = { sub: 1 };

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new CartController(
      mockCartService as any,
      mockOrderService as any,
    );
  });

  describe('create', () => {
    it('调用 cartService.add 并返回结果', async () => {
      const dto = { productId: 1, productSkuId: 1, quantity: 2 };
      const expected = { id: 1 };
      mockCartService.add.mockResolvedValue(expected);

      const result = await controller.create(user as any, dto as any);

      expect(mockCartService.add).toHaveBeenCalledWith(1, dto);
      expect(result).toBe(expected);
    });
  });

  describe('delete', () => {
    it('调用 cartService.delete 并传入 dto.ids', async () => {
      const dto = { ids: [1, 2, 3] };
      mockCartService.delete.mockResolvedValue(3);

      const result = await controller.delete(user as any, dto as any);

      expect(mockCartService.delete).toHaveBeenCalledWith(1, [1, 2, 3]);
      expect(result).toBe(3);
    });
  });

  describe('list', () => {
    it('调用 cartService.getCartList 并返回列表', async () => {
      const expected = [{ id: 1 }];
      mockCartService.getCartList.mockResolvedValue(expected);

      const result = await controller.list(user as any);

      expect(mockCartService.getCartList).toHaveBeenCalledWith(1);
      expect(result).toBe(expected);
    });
  });

  describe('count', () => {
    it('调用 cartService.getCount 并返回数量', async () => {
      mockCartService.getCount.mockResolvedValue(5);

      const result = await controller.count(user as any);

      expect(mockCartService.getCount).toHaveBeenCalledWith(1);
      expect(result).toBe(5);
    });
  });

  describe('promotionList', () => {
    it('调用 orderService.listCartPromotion 并返回促销列表', async () => {
      const cartIds = [1, 2];
      const expected = [{ id: 1 }];
      mockOrderService.listCartPromotion.mockResolvedValue(expected);

      const result = await controller.promotionList(user as any, cartIds);

      expect(mockOrderService.listCartPromotion).toHaveBeenCalledWith(
        1,
        cartIds,
      );
      expect(result).toBe(expected);
    });
  });

  describe('cartProduct', () => {
    it('调用 cartService.getCartProduct 并返回商品规格', async () => {
      const expected = { productId: 10 };
      mockCartService.getCartProduct.mockResolvedValue(expected);

      const result = await controller.cartProduct(10);

      expect(mockCartService.getCartProduct).toHaveBeenCalledWith(10);
      expect(result).toBe(expected);
    });
  });

  describe('clear', () => {
    it('调用 cartService.clear 并返回受影响行数', async () => {
      mockCartService.clear.mockResolvedValue(3);

      const result = await controller.clear(user as any);

      expect(mockCartService.clear).toHaveBeenCalledWith(1);
      expect(result).toBe(3);
    });
  });

  describe('updateQuantity', () => {
    it('调用 cartService.updateQuantity 并返回受影响行数', async () => {
      const dto = { productQuantity: 5 };
      mockCartService.updateQuantity.mockResolvedValue(1);

      const result = await controller.updateQuantity(
        10,
        user as any,
        dto as any,
      );

      expect(mockCartService.updateQuantity).toHaveBeenCalledWith(1, 10, 5);
      expect(result).toBe(1);
    });
  });

  describe('updateAttr', () => {
    it('调用 cartService.updateAttr 并返回受影响行数', async () => {
      const dto = { productSkuId: 2 };
      mockCartService.updateAttr.mockResolvedValue(1);

      const result = await controller.updateAttr(10, user as any, dto as any);

      expect(mockCartService.updateAttr).toHaveBeenCalledWith(1, 10, dto);
      expect(result).toBe(1);
    });
  });
});
