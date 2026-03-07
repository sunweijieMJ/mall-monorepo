import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CartService } from '@/modules/portal/cart/cart.service';
import { CartItemEntity } from '@/modules/portal/cart/infrastructure/persistence/relational/entities/cart-item.entity';
import { SkuStockEntity } from '@/modules/pms/sku-stock/infrastructure/persistence/relational/entities/sku-stock.entity';
import { ProductEntity } from '@/modules/pms/product/infrastructure/persistence/relational/entities/product.entity';
import { createMockRepository } from '../../../../helpers/mock.factory';

const cartItemFixture = (overrides = {}) =>
  ({
    id: 1,
    memberId: 1,
    productId: 100,
    productSkuId: 200,
    productQuantity: 2,
    productPrice: '99.00',
    deleteStatus: 1,
    ...overrides,
  }) as unknown as CartItemEntity;

const skuFixture = (overrides = {}) =>
  ({
    id: 200,
    productId: 100,
    price: '99.00',
    stock: 50,
    lockStock: 5,
    spData: '[{"key":"颜色","value":"红色"}]',
    ...overrides,
  }) as unknown as SkuStockEntity;

const productFixture = {
  id: 100,
  name: '测试商品',
  brandName: '品牌A',
  productSn: 'SN001',
  pic: 'pic.jpg',
  productCategoryId: 10,
} as unknown as ProductEntity;

describe('CartService', () => {
  let service: CartService;
  const mockCartRepo = createMockRepository();
  const mockSkuRepo = createMockRepository();
  const mockProductRepo = createMockRepository();

  beforeEach(async () => {
    vi.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        CartService,
        { provide: getRepositoryToken(CartItemEntity), useValue: mockCartRepo },
        { provide: getRepositoryToken(SkuStockEntity), useValue: mockSkuRepo },
        {
          provide: getRepositoryToken(ProductEntity),
          useValue: mockProductRepo,
        },
      ],
    }).compile();
    service = module.get(CartService);
  });

  // ======================== getCartList ========================

  describe('getCartList', () => {
    it('空购物车 → 返回空数组', async () => {
      mockCartRepo.find.mockResolvedValue([]);
      const result = await service.getCartList(1);
      expect(result).toEqual([]);
    });

    it('库存充足 → deleteStatus 不变', async () => {
      const item = cartItemFixture();
      mockCartRepo.find.mockResolvedValue([item]);
      mockSkuRepo.find.mockResolvedValue([skuFixture()]); // stock=50, lockStock=5

      const result = await service.getCartList(1);

      expect(result[0].deleteStatus).toBe(1); // 未被标记
    });

    it('库存不足 → deleteStatus 标记为 0', async () => {
      const item = cartItemFixture();
      mockCartRepo.find.mockResolvedValue([item]);
      mockSkuRepo.find.mockResolvedValue([
        skuFixture({ stock: 10, lockStock: 10 }), // 可用库存 = 0
      ]);

      const result = await service.getCartList(1);

      expect(result[0].deleteStatus).toBe(0);
    });
  });

  // ======================== add ========================

  describe('add', () => {
    const addDto = { productId: 100, productSkuId: 200, quantity: 1 };

    it('相同 SKU 已存在 → 数量累加', async () => {
      const existing = cartItemFixture({ productQuantity: 3 });
      mockCartRepo.findOne.mockResolvedValue(existing);
      mockCartRepo.save.mockResolvedValue({ ...existing, productQuantity: 4 });

      const result = await service.add(1, addDto);

      expect(result.productQuantity).toBe(4);
    });

    it('新 SKU → 创建新条目', async () => {
      mockCartRepo.findOne.mockResolvedValue(null); // 无现有条目
      mockSkuRepo.findOne.mockResolvedValue(skuFixture());
      mockProductRepo.findOne.mockResolvedValue(productFixture);
      mockCartRepo.save.mockResolvedValue(cartItemFixture());

      await service.add(1, addDto);

      expect(mockCartRepo.save).toHaveBeenCalled();
    });

    it('SKU 不存在 → 404', async () => {
      mockCartRepo.findOne.mockResolvedValue(null);
      mockSkuRepo.findOne.mockResolvedValue(null);

      await expect(service.add(1, addDto)).rejects.toThrow(NotFoundException);
    });

    it('商品不存在 → 404', async () => {
      mockCartRepo.findOne.mockResolvedValue(null);
      mockSkuRepo.findOne.mockResolvedValue(skuFixture());
      mockProductRepo.findOne.mockResolvedValue(null);

      await expect(service.add(1, addDto)).rejects.toThrow(NotFoundException);
    });
  });

  // ======================== updateQuantity ========================

  describe('updateQuantity', () => {
    it('条目存在 → 更新数量', async () => {
      mockCartRepo.findOne.mockResolvedValue(cartItemFixture());
      mockCartRepo.update.mockResolvedValue({});

      await service.updateQuantity(1, 1, 5);

      expect(mockCartRepo.update).toHaveBeenCalledWith(1, {
        productQuantity: 5,
      });
    });

    it('条目不存在或非本人 → 404', async () => {
      mockCartRepo.findOne.mockResolvedValue(null);

      await expect(service.updateQuantity(1, 999, 5)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ======================== updateAttr ========================

  describe('updateAttr', () => {
    it('目标 SKU 已存在同款 → 合并数量', async () => {
      const original = cartItemFixture({ id: 1, productQuantity: 2 });
      const existing = cartItemFixture({
        id: 2,
        productSkuId: 300,
        productQuantity: 3,
      });
      mockCartRepo.findOne
        .mockResolvedValueOnce(original) // 查原条目
        .mockResolvedValueOnce(existing); // 查目标 SKU 是否已在购物车
      mockSkuRepo.findOne.mockResolvedValue(skuFixture({ id: 300, stock: 50 }));
      mockCartRepo.save.mockResolvedValue({});
      mockCartRepo.delete.mockResolvedValue({});

      await service.updateAttr(1, { id: 1, productSkuId: 300 });

      // 合并后数量 = 3 + 2 = 5
      expect(mockCartRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ productQuantity: 5 }),
      );
      // 删除原条目
      expect(mockCartRepo.delete).toHaveBeenCalledWith({ id: 1 });
    });

    it('目标 SKU 不在购物车 → 更新当前条目', async () => {
      const original = cartItemFixture();
      mockCartRepo.findOne
        .mockResolvedValueOnce(original)
        .mockResolvedValueOnce(null); // 目标 SKU 不在购物车
      mockSkuRepo.findOne.mockResolvedValue(skuFixture({ id: 300 }));
      mockCartRepo.save.mockResolvedValue({});

      await service.updateAttr(1, { id: 1, productSkuId: 300 });

      expect(mockCartRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ productSkuId: 300 }),
      );
    });

    it('库存不足 → 400', async () => {
      const original = cartItemFixture({ productQuantity: 10 });
      mockCartRepo.findOne.mockResolvedValueOnce(original);
      mockSkuRepo.findOne.mockResolvedValue(
        skuFixture({ stock: 5, lockStock: 0 }), // 可用 5，需要 10
      );

      await expect(
        service.updateAttr(1, { id: 1, productSkuId: 300 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('购物车条目不存在 → 404', async () => {
      mockCartRepo.findOne.mockResolvedValueOnce(null);

      await expect(
        service.updateAttr(1, { id: 999, productSkuId: 300 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ======================== delete ========================

  describe('delete', () => {
    it('批量删除购物车条目', async () => {
      const qb = mockCartRepo.createQueryBuilder();
      qb.delete = vi.fn().mockReturnValue(qb);
      mockCartRepo.createQueryBuilder.mockReturnValue(qb);
      qb.execute.mockResolvedValue({ affected: 2 });

      await service.delete(1, [1, 2]);

      expect(qb.delete).toHaveBeenCalled();
      expect(qb.where).toHaveBeenCalledWith(
        'id IN (:...ids) AND member_id = :memberId',
        { ids: [1, 2], memberId: 1 },
      );
      expect(qb.execute).toHaveBeenCalled();
    });
  });

  // ======================== clear ========================

  describe('clear', () => {
    it('清空购物车', async () => {
      mockCartRepo.delete.mockResolvedValue({ affected: 5 });

      await service.clear(1);

      expect(mockCartRepo.delete).toHaveBeenCalledWith({ memberId: 1 });
    });
  });

  // ======================== getCount ========================

  describe('getCount', () => {
    it('返回有效商品数量', async () => {
      mockCartRepo.count.mockResolvedValue(3);

      const result = await service.getCount(1);

      expect(result).toBe(3);
      expect(mockCartRepo.count).toHaveBeenCalledWith({
        where: { memberId: 1, deleteStatus: 1 },
      });
    });
  });

  // ======================== getCartProduct ========================

  describe('getCartProduct', () => {
    it('返回商品信息 + SKU 列表', async () => {
      mockProductRepo.findOne.mockResolvedValue(productFixture);
      mockSkuRepo.find.mockResolvedValue([skuFixture()]);

      const result = await service.getCartProduct(100);

      expect(result.name).toBe('测试商品');
      expect(result.skuStockList).toHaveLength(1);
    });

    it('商品不存在 → 404', async () => {
      mockProductRepo.findOne.mockResolvedValue(null);

      await expect(service.getCartProduct(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
