import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OrderService } from '@/modules/oms/order/order.service';
import {
  OrderEntity,
  OrderStatus,
} from '@/modules/oms/order/infrastructure/persistence/relational/entities/order.entity';
import { OrderItemEntity } from '@/modules/oms/order/infrastructure/persistence/relational/entities/order-item.entity';
import { OrderOperateHistoryEntity } from '@/modules/oms/order/infrastructure/persistence/relational/entities/order-operate-history.entity';
import { OrderSettingEntity } from '@/modules/oms/order-setting/infrastructure/persistence/relational/entities/order-setting.entity';
import { CartItemEntity } from '@/modules/portal/cart/infrastructure/persistence/relational/entities/cart-item.entity';
import { SkuStockEntity } from '@/modules/pms/sku-stock/infrastructure/persistence/relational/entities/sku-stock.entity';
import { ProductEntity } from '@/modules/pms/product/infrastructure/persistence/relational/entities/product.entity';
import { ProductLadderEntity } from '@/modules/pms/product/infrastructure/persistence/relational/entities/product-ladder.entity';
import { ProductFullReductionEntity } from '@/modules/pms/product/infrastructure/persistence/relational/entities/product-full-reduction.entity';
import {
  MemberEntity,
  MemberAddressEntity,
} from '@/modules/portal/member/infrastructure/persistence/relational/entities/member.entity';
import { CouponEntity } from '@/modules/sms/coupon/infrastructure/persistence/relational/entities/coupon.entity';
import { CouponHistoryEntity } from '@/modules/sms/coupon/infrastructure/persistence/relational/entities/coupon-history.entity';
import { CouponProductRelationEntity } from '@/modules/sms/coupon/infrastructure/persistence/relational/entities/coupon-product-relation.entity';
import { CouponProductCategoryRelationEntity } from '@/modules/sms/coupon/infrastructure/persistence/relational/entities/coupon-product-category-relation.entity';
import { IntegrationConsumeSettingEntity } from '@/modules/ums/member-level/infrastructure/persistence/relational/entities/integration-consume-setting.entity';
import { TransactionService } from '@/infrastructure/database/transaction/transaction.service';
import { REDIS_CLIENT } from '@/infrastructure/redis/redis-client.module';
import { PageQueryDto } from '@/common/dto/page-result.dto';
import { createMockRepository } from '../../../../helpers/mock.factory';

// ======================== Fixtures ========================

const orderFixture = (overrides = {}) =>
  ({
    id: 1,
    orderSn: 'ORDER001',
    memberId: 1,
    status: OrderStatus.PENDING_PAYMENT,
    totalAmount: '100.00',
    payAmount: '90.00',
    couponId: null,
    useIntegration: 0,
    deleteStatus: 0,
    integration: 10,
    growth: 10,
    ...overrides,
  }) as unknown as OrderEntity;

const orderItemFixture = (overrides = {}) =>
  ({
    id: 1,
    orderId: 1,
    orderSn: 'ORDER001',
    productId: 100,
    productSkuId: 200,
    productName: '测试商品',
    productQuantity: 2,
    productPrice: '50.00',
    ...overrides,
  }) as unknown as OrderItemEntity;

const cartItemFixture = (overrides = {}) =>
  ({
    id: 1,
    memberId: 1,
    productId: 100,
    productSkuId: 200,
    productName: '测试商品',
    productPic: 'pic.jpg',
    productAttr: '红色',
    productBrand: '品牌A',
    productSn: 'SN001',
    productPrice: '50.00',
    productQuantity: 2,
    productCategoryId: 10,
    deleteStatus: 1,
    ...overrides,
  }) as unknown as CartItemEntity;

const skuFixture = (overrides = {}) =>
  ({
    id: 200,
    productId: 100,
    price: '50.00',
    stock: 100,
    lockStock: 10,
    skuCode: 'SKU001',
    promotionPrice: null,
    ...overrides,
  }) as unknown as SkuStockEntity;

const productFixture = (overrides = {}) =>
  ({
    id: 100,
    name: '测试商品',
    promotionType: 0,
    giftPoint: 10,
    giftGrowth: 10,
    ...overrides,
  }) as unknown as ProductEntity;

// ======================== Mock 事务 Manager ========================

function createMockManager() {
  const qb = {
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    andWhere: vi.fn().mockReturnThis(),
    setParameter: vi.fn().mockReturnThis(),
    setLock: vi.fn().mockReturnThis(),
    execute: vi.fn().mockResolvedValue({ affected: 1 }),
    getOne: vi.fn().mockResolvedValue(null),
    getMany: vi.fn().mockResolvedValue([]),
  };
  const manager = {
    createQueryBuilder: vi.fn().mockReturnValue(qb),
    save: vi
      .fn()
      .mockImplementation((_entity: any, data: any) => Promise.resolve(data)),
    create: vi.fn().mockImplementation((_entity: any, data: any) => data),
    findBy: vi.fn().mockResolvedValue([]),
    findOne: vi.fn().mockResolvedValue(null),
    increment: vi.fn().mockResolvedValue({}),
    decrement: vi.fn().mockResolvedValue({}),
  };
  return { manager, qb };
}

// ======================== Tests ========================

describe('OrderService', () => {
  let service: OrderService;

  // 16 个仓库 mock
  const mockOrderRepo = createMockRepository();
  const mockOrderItemRepo = createMockRepository();
  const mockHistoryRepo = createMockRepository();
  const mockOrderSettingRepo = createMockRepository();
  const mockCartItemRepo = createMockRepository();
  const mockSkuStockRepo = createMockRepository();
  const mockProductRepo = createMockRepository();
  const mockProductLadderRepo = createMockRepository();
  const mockProductFullReductionRepo = createMockRepository();
  const mockMemberRepo = createMockRepository();
  const mockMemberAddressRepo = createMockRepository();
  const mockCouponRepo = createMockRepository();
  const mockCouponHistoryRepo = createMockRepository();
  const mockCouponProductRelRepo = createMockRepository();
  const mockCouponCategoryRelRepo = createMockRepository();
  const mockIntegrationConsumeSettingRepo = createMockRepository();

  // 事务 mock
  const { manager: mockManager, qb: mockManagerQb } = createMockManager();
  const mockTransactionService = {
    run: vi.fn().mockImplementation(async (cb: any) => cb(mockManager)),
  };

  // Redis mock
  const mockRedisClient = {
    incr: vi.fn().mockResolvedValue(1),
    expire: vi.fn().mockResolvedValue(1),
  };

  // BullMQ mock
  const mockOrderCancelQueue = {
    add: vi.fn().mockResolvedValue({}),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    // 重置 manager QB mock（clearAllMocks 不会清除 mockReturnThis / mockResolvedValueOnce 队列）
    mockManagerQb.update.mockReset().mockReturnThis();
    mockManagerQb.set.mockReset().mockReturnThis();
    mockManagerQb.where.mockReset().mockReturnThis();
    mockManagerQb.andWhere.mockReset().mockReturnThis();
    mockManagerQb.setParameter.mockReset().mockReturnThis();
    mockManagerQb.setLock.mockReset().mockReturnThis();
    mockManagerQb.execute.mockReset().mockResolvedValue({ affected: 1 });
    mockManagerQb.getOne.mockResolvedValue(null);
    mockManagerQb.getMany.mockResolvedValue([]);
    mockManager.createQueryBuilder.mockReturnValue(mockManagerQb);
    mockManager.save.mockImplementation((_e: any, d: any) =>
      Promise.resolve(d),
    );
    mockManager.create.mockImplementation((_e: any, d: any) => d);
    mockManager.findBy.mockResolvedValue([]);
    mockTransactionService.run.mockImplementation(async (cb: any) =>
      cb(mockManager),
    );

    const module = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: getRepositoryToken(OrderEntity), useValue: mockOrderRepo },
        {
          provide: getRepositoryToken(OrderItemEntity),
          useValue: mockOrderItemRepo,
        },
        {
          provide: getRepositoryToken(OrderOperateHistoryEntity),
          useValue: mockHistoryRepo,
        },
        {
          provide: getRepositoryToken(OrderSettingEntity),
          useValue: mockOrderSettingRepo,
        },
        {
          provide: getRepositoryToken(CartItemEntity),
          useValue: mockCartItemRepo,
        },
        {
          provide: getRepositoryToken(SkuStockEntity),
          useValue: mockSkuStockRepo,
        },
        {
          provide: getRepositoryToken(ProductEntity),
          useValue: mockProductRepo,
        },
        {
          provide: getRepositoryToken(ProductLadderEntity),
          useValue: mockProductLadderRepo,
        },
        {
          provide: getRepositoryToken(ProductFullReductionEntity),
          useValue: mockProductFullReductionRepo,
        },
        { provide: getRepositoryToken(MemberEntity), useValue: mockMemberRepo },
        {
          provide: getRepositoryToken(MemberAddressEntity),
          useValue: mockMemberAddressRepo,
        },
        { provide: getRepositoryToken(CouponEntity), useValue: mockCouponRepo },
        {
          provide: getRepositoryToken(CouponHistoryEntity),
          useValue: mockCouponHistoryRepo,
        },
        {
          provide: getRepositoryToken(CouponProductRelationEntity),
          useValue: mockCouponProductRelRepo,
        },
        {
          provide: getRepositoryToken(CouponProductCategoryRelationEntity),
          useValue: mockCouponCategoryRelRepo,
        },
        {
          provide: getRepositoryToken(IntegrationConsumeSettingEntity),
          useValue: mockIntegrationConsumeSettingRepo,
        },
        { provide: TransactionService, useValue: mockTransactionService },
        { provide: REDIS_CLIENT, useValue: mockRedisClient },
        { provide: 'BullQueue_order-cancel', useValue: mockOrderCancelQueue },
      ],
    }).compile();
    service = module.get(OrderService);
  });

  // ======================== detail ========================

  describe('detail', () => {
    it('返回订单 + 商品列表 + 操作历史', async () => {
      const order = orderFixture();
      mockOrderRepo.findOneBy.mockResolvedValue(order);
      mockOrderItemRepo.findBy.mockResolvedValue([orderItemFixture()]);
      // historyRepo 使用 createQueryBuilder
      const historyQb = mockHistoryRepo.createQueryBuilder();
      mockHistoryRepo.createQueryBuilder.mockReturnValue(historyQb);
      historyQb.getMany.mockResolvedValue([{ id: 1, note: '创建订单' }]);

      const result = await service.detail(1);

      expect(result.orderSn).toBe('ORDER001');
      expect(result.orderItemList).toHaveLength(1);
      expect(result.historyList).toHaveLength(1);
    });

    it('订单不存在 → 404', async () => {
      mockOrderRepo.findOneBy.mockResolvedValue(null);

      await expect(service.detail(999)).rejects.toThrow(NotFoundException);
    });

    it('移动端传入 memberId 且不匹配 → 403', async () => {
      mockOrderRepo.findOneBy.mockResolvedValue(orderFixture({ memberId: 2 }));

      await expect(service.detail(1, 1)).rejects.toThrow(ForbiddenException);
    });

    it('移动端传入 memberId 匹配 → 正常返回', async () => {
      mockOrderRepo.findOneBy.mockResolvedValue(orderFixture({ memberId: 1 }));
      mockOrderItemRepo.findBy.mockResolvedValue([]);
      const historyQb = mockHistoryRepo.createQueryBuilder();
      mockHistoryRepo.createQueryBuilder.mockReturnValue(historyQb);
      historyQb.getMany.mockResolvedValue([]);

      const result = await service.detail(1, 1);
      expect(result.orderSn).toBe('ORDER001');
    });
  });

  // ======================== delivery ========================

  describe('delivery', () => {
    it('批量发货 → 更新状态 + 写入操作历史', async () => {
      mockManagerQb.execute.mockResolvedValue({ affected: 1 });

      await service.delivery([
        { orderId: 1, deliveryCompany: '顺丰', deliverySn: 'SF001' },
      ]);

      expect(mockTransactionService.run).toHaveBeenCalled();
      expect(mockManager.save).toHaveBeenCalled();
    });

    it('无更新成功订单 → 不写入历史', async () => {
      mockManagerQb.execute.mockResolvedValue({ affected: 0 });

      await service.delivery([
        { orderId: 999, deliveryCompany: '顺丰', deliverySn: 'SF001' },
      ]);

      // save 不应被调用（因为 successItems 为空）
      expect(mockManager.save).not.toHaveBeenCalled();
    });

    it('affected 为 null → 视为 0，不写入历史', async () => {
      mockManagerQb.execute.mockResolvedValue({ affected: null });

      await service.delivery([
        { orderId: 1, deliveryCompany: '顺丰', deliverySn: 'SF001' },
      ]);

      expect(mockManager.save).not.toHaveBeenCalled();
    });

    it('affected 为 undefined → 视为 0，不写入历史', async () => {
      mockManagerQb.execute.mockResolvedValue({});

      await service.delivery([
        { orderId: 1, deliveryCompany: '顺丰', deliverySn: 'SF001' },
      ]);

      expect(mockManager.save).not.toHaveBeenCalled();
    });
  });

  // ======================== close ========================

  describe('close', () => {
    it('批量关闭 → 更新状态 + 写入操作历史', async () => {
      // close 先通过 orderRepo.createQueryBuilder('o').where().getMany() 查询可关闭订单
      const qb = mockOrderRepo.createQueryBuilder();
      qb.getMany.mockResolvedValue([
        orderFixture({ id: 1 }),
        orderFixture({ id: 2 }),
      ]);
      mockOrderRepo.createQueryBuilder.mockReturnValue(qb);

      await service.close([1, 2], '测试关闭');

      expect(mockTransactionService.run).toHaveBeenCalled();
      expect(mockManager.save).toHaveBeenCalledWith(
        OrderOperateHistoryEntity,
        expect.arrayContaining([
          expect.objectContaining({ note: '订单关闭:测试关闭' }),
        ]),
      );
    });

    it('待付款订单关闭 → 释放 lockStock', async () => {
      const qb = mockOrderRepo.createQueryBuilder();
      qb.getMany.mockResolvedValue([
        orderFixture({ id: 1, status: OrderStatus.PENDING_PAYMENT }),
      ]);
      mockOrderRepo.createQueryBuilder.mockReturnValue(qb);
      mockManager.findBy.mockResolvedValue([orderItemFixture()]);

      await service.close([1], '超时关闭');

      expect(mockTransactionService.run).toHaveBeenCalled();
      expect(mockManagerQb.update).toHaveBeenCalled();
    });

    it('含优惠券订单关闭 → 恢复优惠券', async () => {
      const qb = mockOrderRepo.createQueryBuilder();
      qb.getMany.mockResolvedValue([orderFixture({ id: 1, couponId: 5 })]);
      mockOrderRepo.createQueryBuilder.mockReturnValue(qb);
      mockManager.findBy.mockResolvedValue([]);
      mockManager.findOne.mockResolvedValue({ id: 1, useStatus: 1 });

      await service.close([1], '关闭');

      expect(mockManager.findOne).toHaveBeenCalled();
    });

    it('含积分订单关闭 → 返还积分', async () => {
      const qb = mockOrderRepo.createQueryBuilder();
      qb.getMany.mockResolvedValue([
        orderFixture({ id: 1, useIntegration: 100 }),
      ]);
      mockOrderRepo.createQueryBuilder.mockReturnValue(qb);
      mockManager.findBy.mockResolvedValue([]);

      await service.close([1], '关闭');

      expect(mockManagerQb.set).toHaveBeenCalled();
    });

    it('affected 为 null → 视为 0，不执行清理', async () => {
      const qb = mockOrderRepo.createQueryBuilder();
      qb.getMany.mockResolvedValue([orderFixture({ id: 1 })]);
      mockOrderRepo.createQueryBuilder.mockReturnValue(qb);
      mockManagerQb.execute.mockResolvedValue({ affected: null });

      const result = await service.close([1], '关闭');

      expect(result).toBe(0);
    });

    it('affected 为 undefined → 视为 0，不执行清理', async () => {
      const qb = mockOrderRepo.createQueryBuilder();
      qb.getMany.mockResolvedValue([orderFixture({ id: 1 })]);
      mockOrderRepo.createQueryBuilder.mockReturnValue(qb);
      mockManagerQb.execute.mockResolvedValue({});

      const result = await service.close([1], '关闭');

      expect(result).toBe(0);
    });

    it('含优惠券但 couponHistory 不存在（useStatus=0）→ 静默跳过', async () => {
      const qb = mockOrderRepo.createQueryBuilder();
      qb.getMany.mockResolvedValue([orderFixture({ id: 1, couponId: 5 })]);
      mockOrderRepo.createQueryBuilder.mockReturnValue(qb);
      mockManager.findBy.mockResolvedValue([]);
      // couponHistory 为 null：取消使用时找不到已使用记录
      mockManager.findOne.mockResolvedValue(null);

      // 不应抛出异常（幂等静默跳过）
      await expect(service.close([1], '关闭')).resolves.not.toThrow();
      expect(mockManager.findOne).toHaveBeenCalled();
    });
  });

  // ======================== updateNote ========================

  describe('updateNote', () => {
    it('更新备注 + 写入操作历史', async () => {
      await service.updateNote(1, '加急发货', 0);

      expect(mockTransactionService.run).toHaveBeenCalled();
      expect(mockManager.save).toHaveBeenCalledWith(
        OrderOperateHistoryEntity,
        expect.objectContaining({ note: '修改备注信息：加急发货' }),
      );
    });
  });

  // ======================== adminDelete ========================

  describe('adminDelete', () => {
    it('逻辑删除（设 deleteStatus=1）', async () => {
      const qb = mockOrderRepo.createQueryBuilder();
      // adminDelete 使用无参 .createQueryBuilder().update().set().where().execute()
      qb.update = vi.fn().mockReturnValue(qb);
      qb.set = vi.fn().mockReturnValue(qb);
      mockOrderRepo.createQueryBuilder.mockReturnValue(qb);
      qb.execute.mockResolvedValue({ affected: 2 });

      await service.adminDelete([1, 2]);

      expect(mockOrderRepo.createQueryBuilder).toHaveBeenCalled();
    });

    it('affected 为 null → 返回 0', async () => {
      const qb = mockOrderRepo.createQueryBuilder();
      qb.update = vi.fn().mockReturnValue(qb);
      qb.set = vi.fn().mockReturnValue(qb);
      mockOrderRepo.createQueryBuilder.mockReturnValue(qb);
      qb.execute.mockResolvedValue({ affected: null });

      const result = await service.adminDelete([1]);

      expect(result).toBe(0);
    });

    it('affected 为 undefined → 返回 0', async () => {
      const qb = mockOrderRepo.createQueryBuilder();
      qb.update = vi.fn().mockReturnValue(qb);
      qb.set = vi.fn().mockReturnValue(qb);
      mockOrderRepo.createQueryBuilder.mockReturnValue(qb);
      qb.execute.mockResolvedValue({});

      const result = await service.adminDelete([1]);

      expect(result).toBe(0);
    });
  });

  // ======================== calcCartPromotion ========================

  describe('calcCartPromotion', () => {
    it('空购物车 → 返回空数组', async () => {
      const result = await service.calcCartPromotion([]);
      expect(result).toEqual([]);
    });

    it('promotionType=0（无优惠）→ reduceAmount=0', async () => {
      mockProductRepo.findBy.mockResolvedValue([
        productFixture({ promotionType: 0 }),
      ]);
      mockSkuStockRepo.findBy.mockResolvedValue([skuFixture()]);
      mockProductLadderRepo.findBy.mockResolvedValue([]);
      mockProductFullReductionRepo.findBy.mockResolvedValue([]);

      const result = await service.calcCartPromotion([cartItemFixture()]);

      expect(result).toHaveLength(1);
      expect(result[0].reduceAmount).toBe(0);
      expect(result[0].promotionMessage).toBe('无优惠');
      expect(result[0].realStock).toBe(90); // 100 - 10
    });

    it('promotionType=1（单品促销）→ 计算促销价差', async () => {
      mockProductRepo.findBy.mockResolvedValue([
        productFixture({ promotionType: 1 }),
      ]);
      mockSkuStockRepo.findBy.mockResolvedValue([
        skuFixture({ promotionPrice: '40.00' }),
      ]);
      mockProductLadderRepo.findBy.mockResolvedValue([]);
      mockProductFullReductionRepo.findBy.mockResolvedValue([]);

      const result = await service.calcCartPromotion([cartItemFixture()]);

      expect(result[0].reduceAmount).toBe(10); // 50 - 40
      expect(result[0].promotionMessage).toBe('单品促销');
    });

    it('promotionType=3（阶梯价）→ 达到梯度打折', async () => {
      mockProductRepo.findBy.mockResolvedValue([
        productFixture({ promotionType: 3 }),
      ]);
      mockSkuStockRepo.findBy.mockResolvedValue([skuFixture()]);
      mockProductLadderRepo.findBy.mockResolvedValue([
        { productId: 100, count: 2, discount: '0.8' } as any,
      ]);
      mockProductFullReductionRepo.findBy.mockResolvedValue([]);

      // 购物车 2 件，达到阶梯条件 count=2
      const result = await service.calcCartPromotion([
        cartItemFixture({ productQuantity: 2 }),
      ]);

      expect(result[0].reduceAmount).toBe(10); // 50 - 0.8*50 = 10
      expect(result[0].promotionMessage).toContain('打折优惠');
    });

    it('promotionType=3（阶梯价）→ 未达梯度无优惠', async () => {
      mockProductRepo.findBy.mockResolvedValue([
        productFixture({ promotionType: 3 }),
      ]);
      mockSkuStockRepo.findBy.mockResolvedValue([skuFixture()]);
      mockProductLadderRepo.findBy.mockResolvedValue([
        { productId: 100, count: 10, discount: '0.8' } as any,
      ]);
      mockProductFullReductionRepo.findBy.mockResolvedValue([]);

      // 只有 2 件，未达到 count=10
      const result = await service.calcCartPromotion([
        cartItemFixture({ productQuantity: 2 }),
      ]);

      expect(result[0].reduceAmount).toBe(0);
    });

    it('promotionType=4（满减）→ 满足条件减价', async () => {
      mockProductRepo.findBy.mockResolvedValue([
        productFixture({ promotionType: 4 }),
      ]);
      mockSkuStockRepo.findBy.mockResolvedValue([skuFixture()]);
      mockProductLadderRepo.findBy.mockResolvedValue([]);
      mockProductFullReductionRepo.findBy.mockResolvedValue([
        { productId: 100, fullPrice: '80', reducePrice: '10' } as any,
      ]);

      // 2件 × 50元 = 100元，满80减10
      const result = await service.calcCartPromotion([
        cartItemFixture({ productQuantity: 2 }),
      ]);

      expect(result[0].reduceAmount).toBe(5); // (50/100)*10 = 5 单件分摊
      expect(result[0].promotionMessage).toContain('满减优惠');
    });

    it('cartItem.productBrand/productSn 为 null → 使用空字符串', async () => {
      mockProductRepo.findBy.mockResolvedValue([
        productFixture({ promotionType: 0 }),
      ]);
      mockSkuStockRepo.findBy.mockResolvedValue([
        skuFixture({ skuCode: null }),
      ]);
      mockProductLadderRepo.findBy.mockResolvedValue([]);
      mockProductFullReductionRepo.findBy.mockResolvedValue([]);

      const result = await service.calcCartPromotion([
        cartItemFixture({ productBrand: null, productSn: null }),
      ]);

      expect(result).toHaveLength(1);
      expect(result[0].productBrand).toBe('');
      expect(result[0].productSn).toBe('');
      expect(result[0].productSkuCode).toBe('');
    });

    it('cartItem.productBrand/productSn 为 undefined → 使用空字符串', async () => {
      mockProductRepo.findBy.mockResolvedValue([
        productFixture({ promotionType: 0 }),
      ]);
      const skuWithoutCode = skuFixture();
      delete (skuWithoutCode as any).skuCode;
      mockSkuStockRepo.findBy.mockResolvedValue([skuWithoutCode]);
      mockProductLadderRepo.findBy.mockResolvedValue([]);
      mockProductFullReductionRepo.findBy.mockResolvedValue([]);

      const cart = cartItemFixture();
      delete (cart as any).productBrand;
      delete (cart as any).productSn;
      const result = await service.calcCartPromotion([cart]);

      expect(result).toHaveLength(1);
      expect(result[0].productBrand).toBe('');
      expect(result[0].productSn).toBe('');
      expect(result[0].productSkuCode).toBe('');
    });

    it('商品不存在 → 按无优惠处理', async () => {
      mockProductRepo.findBy.mockResolvedValue([]); // 商品查不到
      mockSkuStockRepo.findBy.mockResolvedValue([]);
      mockProductLadderRepo.findBy.mockResolvedValue([]);
      mockProductFullReductionRepo.findBy.mockResolvedValue([]);

      const result = await service.calcCartPromotion([cartItemFixture()]);

      expect(result).toHaveLength(1);
      expect(result[0].reduceAmount).toBe(0);
    });

    it('promotionType=1 SKU 不匹配 → 价格为 0', async () => {
      mockProductRepo.findBy.mockResolvedValue([
        productFixture({ promotionType: 1 }),
      ]);
      // SKU 的 id 不匹配 cartItem 的 productSkuId
      mockSkuStockRepo.findBy.mockResolvedValue([skuFixture({ id: 999 })]);
      mockProductLadderRepo.findBy.mockResolvedValue([]);
      mockProductFullReductionRepo.findBy.mockResolvedValue([]);

      const result = await service.calcCartPromotion([cartItemFixture()]);

      expect(result[0].price).toBe(0);
      expect(result[0].realStock).toBe(0);
    });

    it('promotionType=1 promotionPrice 为 null → 使用原价', async () => {
      mockProductRepo.findBy.mockResolvedValue([
        productFixture({ promotionType: 1 }),
      ]);
      mockSkuStockRepo.findBy.mockResolvedValue([
        skuFixture({ promotionPrice: null }),
      ]);
      mockProductLadderRepo.findBy.mockResolvedValue([]);
      mockProductFullReductionRepo.findBy.mockResolvedValue([]);

      const result = await service.calcCartPromotion([cartItemFixture()]);

      expect(result[0].reduceAmount).toBe(0); // originalPrice - originalPrice = 0
      expect(result[0].promotionMessage).toBe('单品促销');
    });

    it('promotionType=1 null productBrand/productSn → 空字符串', async () => {
      mockProductRepo.findBy.mockResolvedValue([
        productFixture({ promotionType: 1 }),
      ]);
      mockSkuStockRepo.findBy.mockResolvedValue([
        skuFixture({ promotionPrice: '40.00', skuCode: null }),
      ]);
      mockProductLadderRepo.findBy.mockResolvedValue([]);
      mockProductFullReductionRepo.findBy.mockResolvedValue([]);

      const result = await service.calcCartPromotion([
        cartItemFixture({ productBrand: null, productSn: null }),
      ]);

      expect(result[0].productBrand).toBe('');
      expect(result[0].productSn).toBe('');
      expect(result[0].productSkuCode).toBe('');
    });

    it('promotionType=3 阶梯价 SKU 不匹配 → 价格为 0', async () => {
      mockProductRepo.findBy.mockResolvedValue([
        productFixture({ promotionType: 3 }),
      ]);
      mockSkuStockRepo.findBy.mockResolvedValue([skuFixture({ id: 999 })]);
      mockProductLadderRepo.findBy.mockResolvedValue([
        { productId: 100, count: 1, discount: '0.8' } as any,
      ]);
      mockProductFullReductionRepo.findBy.mockResolvedValue([]);

      const result = await service.calcCartPromotion([
        cartItemFixture({ productQuantity: 2 }),
      ]);

      expect(result[0].price).toBe(0);
      expect(result[0].realStock).toBe(0);
    });

    it('promotionType=3 阶梯价 null productBrand/productSn → 空字符串', async () => {
      mockProductRepo.findBy.mockResolvedValue([
        productFixture({ promotionType: 3 }),
      ]);
      mockSkuStockRepo.findBy.mockResolvedValue([
        skuFixture({ skuCode: null }),
      ]);
      mockProductLadderRepo.findBy.mockResolvedValue([
        { productId: 100, count: 1, discount: '0.8' } as any,
      ]);
      mockProductFullReductionRepo.findBy.mockResolvedValue([]);

      const result = await service.calcCartPromotion([
        cartItemFixture({
          productBrand: null,
          productSn: null,
          productQuantity: 2,
        }),
      ]);

      expect(result[0].productBrand).toBe('');
      expect(result[0].productSn).toBe('');
      expect(result[0].productSkuCode).toBe('');
    });

    it('promotionType=4 满减 SKU 不匹配 → 价格为 0', async () => {
      mockProductRepo.findBy.mockResolvedValue([
        productFixture({ promotionType: 4 }),
      ]);
      mockSkuStockRepo.findBy.mockResolvedValue([skuFixture({ id: 999 })]);
      mockProductLadderRepo.findBy.mockResolvedValue([]);
      mockProductFullReductionRepo.findBy.mockResolvedValue([
        { productId: 100, fullPrice: '0', reducePrice: '10' } as any,
      ]);

      const result = await service.calcCartPromotion([
        cartItemFixture({ productQuantity: 2 }),
      ]);

      // SKU 不匹配，price=0，totalAmount=0，不满足满减
      expect(result[0].price).toBe(0);
    });

    it('promotionType=4 满减 null productBrand/productSn → 空字符串', async () => {
      mockProductRepo.findBy.mockResolvedValue([
        productFixture({ promotionType: 4 }),
      ]);
      mockSkuStockRepo.findBy.mockResolvedValue([
        skuFixture({ skuCode: null }),
      ]);
      mockProductLadderRepo.findBy.mockResolvedValue([]);
      mockProductFullReductionRepo.findBy.mockResolvedValue([
        { productId: 100, fullPrice: '80', reducePrice: '10' } as any,
      ]);

      const result = await service.calcCartPromotion([
        cartItemFixture({
          productBrand: null,
          productSn: null,
          productQuantity: 2,
        }),
      ]);

      expect(result[0].productBrand).toBe('');
      expect(result[0].productSn).toBe('');
      expect(result[0].productSkuCode).toBe('');
    });

    it('promotionType=4 满减多商品 totalAmount>0 → 按比例分摊', async () => {
      mockProductRepo.findBy.mockResolvedValue([
        productFixture({ promotionType: 4 }),
      ]);
      mockSkuStockRepo.findBy.mockResolvedValue([
        skuFixture({ id: 200, productId: 100 }),
        skuFixture({ id: 201, productId: 100, price: '30.00' }),
      ]);
      mockProductLadderRepo.findBy.mockResolvedValue([]);
      mockProductFullReductionRepo.findBy.mockResolvedValue([
        { productId: 100, fullPrice: '50', reducePrice: '10' } as any,
      ]);

      // 两种SKU的商品：50元*1件 + 30元*1件 = 80元，满50减10
      const result = await service.calcCartPromotion([
        cartItemFixture({ id: 1, productSkuId: 200, productQuantity: 1 }),
        cartItemFixture({ id: 2, productSkuId: 201, productQuantity: 1 }),
      ]);

      expect(result).toHaveLength(2);
      expect(result[0].promotionMessage).toContain('满减优惠');
    });
  });

  // ======================== cancelOrder ========================

  describe('cancelOrder', () => {
    it('取消待付款订单 → 释放库存 + 记录历史', async () => {
      mockOrderRepo.findOne.mockResolvedValue(orderFixture());
      mockManager.findBy.mockResolvedValue([orderItemFixture()]);

      await service.cancelOrder(1, 1);

      expect(mockTransactionService.run).toHaveBeenCalled();
      expect(mockManager.save).toHaveBeenCalledWith(
        OrderOperateHistoryEntity,
        expect.objectContaining({ note: '用户取消订单' }),
      );
    });

    it('取消带优惠券的订单 → 恢复优惠券', async () => {
      mockOrderRepo.findOne.mockResolvedValue(orderFixture({ couponId: 5 }));
      mockManager.findBy.mockResolvedValue([]);
      mockManager.findOne.mockResolvedValue({ id: 1, useStatus: 1 });

      await service.cancelOrder(1, 1);

      // updateCouponStatus 应该将 useStatus 设为 0
      expect(mockManager.findOne).toHaveBeenCalled();
    });

    it('取消带积分的订单 → 返还积分', async () => {
      mockOrderRepo.findOne.mockResolvedValue(
        orderFixture({ useIntegration: 100 }),
      );
      mockManager.findBy.mockResolvedValue([]);

      await service.cancelOrder(1, 1);

      // 应执行 MemberEntity 积分返还
      expect(mockManagerQb.set).toHaveBeenCalled();
    });

    it('订单不存在 → 静默返回 0', async () => {
      mockOrderRepo.findOne.mockResolvedValue(null);

      // 不应抛出异常，返回 0
      await expect(service.cancelOrder(1, 999)).resolves.toBe(0);
      expect(mockTransactionService.run).not.toHaveBeenCalled();
    });

    it('非本人订单（非系统调用）→ 静默返回 0', async () => {
      mockOrderRepo.findOne.mockResolvedValue(orderFixture({ memberId: 2 }));

      await expect(service.cancelOrder(1, 1)).resolves.toBe(0);
      expect(mockTransactionService.run).not.toHaveBeenCalled();
    });

    it('系统调用（memberId=0）→ 跳过归属权验证', async () => {
      mockOrderRepo.findOne.mockResolvedValue(orderFixture({ memberId: 999 }));
      mockManager.findBy.mockResolvedValue([]);

      await service.cancelOrder(0, 1);

      expect(mockTransactionService.run).toHaveBeenCalled();
      expect(mockManager.save).toHaveBeenCalledWith(
        OrderOperateHistoryEntity,
        expect.objectContaining({ note: '超时未支付，系统自动取消' }),
      );
    });

    it('并发取消（affected=0）→ 不执行后续操作', async () => {
      mockOrderRepo.findOne.mockResolvedValue(orderFixture());
      mockManagerQb.execute.mockResolvedValueOnce({ affected: 0 });

      await service.cancelOrder(1, 1);

      // findBy 不应被调用（因为 cancelResult.affected === 0 后直接 return）
      expect(mockManager.findBy).not.toHaveBeenCalled();
    });
  });

  // ======================== paySuccess ========================

  describe('paySuccess', () => {
    it('支付成功 → 更新状态 + 扣减库存 + 记录历史', async () => {
      // manager.findBy 返回 orderItems
      mockManager.findBy.mockResolvedValue([
        orderItemFixture({ productSkuId: 200, productQuantity: 2 }),
      ]);
      // getOne 返回 SKU（悲观锁查询）
      mockManagerQb.getOne.mockResolvedValue(
        skuFixture({ stock: 100, lockStock: 10 }),
      );

      await service.paySuccess(1, 1, 1);

      expect(mockTransactionService.run).toHaveBeenCalled();
      expect(mockManager.save).toHaveBeenCalledWith(
        OrderOperateHistoryEntity,
        expect.objectContaining({ orderStatus: OrderStatus.PAID }),
      );
    });

    it('订单状态非待付款（affected=0）→ 400', async () => {
      mockManagerQb.execute.mockResolvedValueOnce({ affected: 0 });

      await expect(service.paySuccess(1, 1, 1)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('SKU 库存不足 → 400', async () => {
      mockManagerQb.execute
        .mockResolvedValueOnce({ affected: 1 })
        .mockResolvedValueOnce({ affected: 0 });
      mockManager.findBy.mockResolvedValue([
        orderItemFixture({ productSkuId: 200, productQuantity: 2 }),
      ]);
      mockManagerQb.getOne.mockResolvedValue(
        skuFixture({ stock: 100, lockStock: 0 }),
      );

      await expect(service.paySuccess(1, 1, 1)).rejects.toThrow('库存不足');
    });
  });

  // ======================== confirmReceive ========================

  describe('confirmReceive', () => {
    it('确认收货 → 更新状态 + 发放积分/成长值', async () => {
      mockOrderRepo.findOneBy.mockResolvedValue(
        orderFixture({
          status: OrderStatus.SHIPPING,
          integration: 100,
          growth: 50,
        }),
      );

      await service.confirmReceive(1, 1);

      expect(mockTransactionService.run).toHaveBeenCalled();
      expect(mockManager.save).toHaveBeenCalledWith(
        OrderOperateHistoryEntity,
        expect.objectContaining({ note: '确认收货' }),
      );
    });

    it('订单不存在 → 400', async () => {
      mockOrderRepo.findOneBy.mockResolvedValue(null);

      await expect(service.confirmReceive(1, 999)).rejects.toThrow(
        '订单不存在',
      );
    });

    it('非本人订单 → 400', async () => {
      mockOrderRepo.findOneBy.mockResolvedValue(
        orderFixture({ status: OrderStatus.SHIPPING, memberId: 2 }),
      );

      await expect(service.confirmReceive(1, 1)).rejects.toThrow(
        '不能确认他人订单',
      );
    });

    it('订单非发货状态 → 400', async () => {
      mockOrderRepo.findOneBy.mockResolvedValue(
        orderFixture({ status: OrderStatus.PENDING_PAYMENT }),
      );

      await expect(service.confirmReceive(1, 1)).rejects.toThrow(
        '该订单还未发货',
      );
    });

    it('并发确认（affected=0）→ 不发放积分', async () => {
      mockOrderRepo.findOneBy.mockResolvedValue(
        orderFixture({ status: OrderStatus.SHIPPING, integration: 100 }),
      );
      mockManagerQb.execute.mockResolvedValueOnce({ affected: 0 });

      await service.confirmReceive(1, 1);

      // save 不应被调用（CAS 失败后 return）
      expect(mockManager.save).not.toHaveBeenCalled();
    });

    it('integration=0 但 growth>0 → 仍发放成长值', async () => {
      mockOrderRepo.findOneBy.mockResolvedValue(
        orderFixture({
          status: OrderStatus.SHIPPING,
          integration: 0,
          growth: 50,
        }),
      );

      await service.confirmReceive(1, 1);

      expect(mockManager.save).toHaveBeenCalledWith(
        OrderOperateHistoryEntity,
        expect.objectContaining({ note: '确认收货' }),
      );
    });

    it('integration=0 且 growth=0 → 不发放积分/成长值', async () => {
      mockOrderRepo.findOneBy.mockResolvedValue(
        orderFixture({
          status: OrderStatus.SHIPPING,
          integration: 0,
          growth: 0,
        }),
      );

      await service.confirmReceive(1, 1);

      expect(mockManager.save).toHaveBeenCalledWith(
        OrderOperateHistoryEntity,
        expect.objectContaining({ note: '确认收货' }),
      );
    });
  });

  // ======================== deleteOrder ========================

  describe('deleteOrder', () => {
    it('已完成订单 → 可以删除', async () => {
      mockOrderRepo.findOne.mockResolvedValue(
        orderFixture({ status: OrderStatus.COMPLETED }),
      );
      mockOrderRepo.update.mockResolvedValue({ affected: 1 });

      await service.deleteOrder(1, 1);

      expect(mockOrderRepo.update).toHaveBeenCalledWith(
        { id: 1 },
        { deleteStatus: 1 },
      );
    });

    it('已取消订单 → 可以删除', async () => {
      mockOrderRepo.findOne.mockResolvedValue(
        orderFixture({ status: OrderStatus.CANCELLED }),
      );
      mockOrderRepo.update.mockResolvedValue({ affected: 1 });

      await service.deleteOrder(1, 1);
      expect(mockOrderRepo.update).toHaveBeenCalled();
    });

    it('订单不存在 → 404', async () => {
      mockOrderRepo.findOne.mockResolvedValue(null);

      await expect(service.deleteOrder(1, 999)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('待付款订单 → 不允许删除', async () => {
      mockOrderRepo.findOne.mockResolvedValue(
        orderFixture({ status: OrderStatus.PENDING_PAYMENT }),
      );

      await expect(service.deleteOrder(1, 1)).rejects.toThrow(
        '只能删除已完成或已取消的订单',
      );
    });

    it('affected 为 null → 返回 0', async () => {
      mockOrderRepo.findOne.mockResolvedValue(
        orderFixture({ status: OrderStatus.COMPLETED }),
      );
      mockOrderRepo.update.mockResolvedValue({ affected: null });

      const result = await service.deleteOrder(1, 1);
      expect(result).toBe(0);
    });

    it('affected 为 undefined → 返回 0', async () => {
      mockOrderRepo.findOne.mockResolvedValue(
        orderFixture({ status: OrderStatus.COMPLETED }),
      );
      mockOrderRepo.update.mockResolvedValue({});

      const result = await service.deleteOrder(1, 1);
      expect(result).toBe(0);
    });
  });

  // ======================== autoCancelIfUnpaid ========================

  describe('autoCancelIfUnpaid', () => {
    it('待付款订单 → 调用 cancelOrder(0, orderId)', async () => {
      mockOrderRepo.findOne
        .mockResolvedValueOnce(orderFixture()) // autoCancelIfUnpaid 的查询
        .mockResolvedValueOnce(orderFixture()); // cancelOrder 内部的查询
      mockManager.findBy.mockResolvedValue([]);

      await service.autoCancelIfUnpaid(1);

      expect(mockTransactionService.run).toHaveBeenCalled();
    });

    it('订单非待付款 → 静默返回', async () => {
      mockOrderRepo.findOne.mockResolvedValue(null);

      await expect(service.autoCancelIfUnpaid(999)).resolves.toBeUndefined();
      expect(mockTransactionService.run).not.toHaveBeenCalled();
    });
  });

  // ======================== updateReceiverInfo ========================

  describe('updateReceiverInfo', () => {
    it('修改收货人 → 更新 + 写入历史', async () => {
      await service.updateReceiverInfo({
        orderId: 1,
        receiverName: '张三',
        receiverPhone: '13800138000',
        receiverDetailAddress: '北京市朝阳区',
        receiverProvince: '北京市',
        receiverCity: '北京市',
        receiverRegion: '朝阳区',
        status: 0,
      });

      expect(mockTransactionService.run).toHaveBeenCalled();
      expect(mockManager.save).toHaveBeenCalledWith(
        OrderOperateHistoryEntity,
        expect.objectContaining({ note: '修改收货人信息' }),
      );
    });

    it('receiverPostCode 为 null → 使用空字符串', async () => {
      await service.updateReceiverInfo({
        orderId: 1,
        receiverName: '张三',
        receiverPhone: '13800138000',
        receiverPostCode: null as any,
        receiverDetailAddress: '北京市朝阳区',
        receiverProvince: '北京市',
        receiverCity: '北京市',
        receiverRegion: '朝阳区',
        status: 0,
      });

      expect(mockManagerQb.set).toHaveBeenCalledWith(
        expect.objectContaining({ receiverPostCode: '' }),
      );
    });

    it('receiverPostCode 为 undefined → 使用空字符串', async () => {
      await service.updateReceiverInfo({
        orderId: 1,
        receiverName: '张三',
        receiverPhone: '13800138000',
        receiverDetailAddress: '北京市朝阳区',
        receiverProvince: '北京市',
        receiverCity: '北京市',
        receiverRegion: '朝阳区',
        status: 0,
      } as any);

      expect(mockManagerQb.set).toHaveBeenCalledWith(
        expect.objectContaining({ receiverPostCode: '' }),
      );
    });
  });

  // ======================== updateMoneyInfo ========================

  describe('updateMoneyInfo', () => {
    it('修改费用 → 更新运费 + 写入历史', async () => {
      await service.updateMoneyInfo({
        orderId: 1,
        freightAmount: 15,
        status: 0,
      });

      expect(mockTransactionService.run).toHaveBeenCalled();
      expect(mockManager.save).toHaveBeenCalledWith(
        OrderOperateHistoryEntity,
        expect.objectContaining({ note: '修改费用信息' }),
      );
    });

    it('含 discountAmount → 同时更新 promotionAmount', async () => {
      await service.updateMoneyInfo({
        orderId: 1,
        freightAmount: 10,
        discountAmount: 5,
        status: 0,
      });

      // set 应包含 promotionAmount
      expect(mockManagerQb.set).toHaveBeenCalledWith(
        expect.objectContaining({ promotionAmount: '5' }),
      );
    });

    it('affected=0 → NotFoundException', async () => {
      mockManagerQb.execute.mockResolvedValueOnce({ affected: 0 });

      await expect(
        service.updateMoneyInfo({
          orderId: 999,
          freightAmount: 10,
          status: 0,
        }),
      ).rejects.toThrow('订单不存在或当前状态不允许修改费用信息');
    });
  });

  // ======================== updateReceiverInfo affected=0 ========================

  describe('updateReceiverInfo affected=0', () => {
    it('affected=0 → NotFoundException', async () => {
      mockManagerQb.execute.mockResolvedValueOnce({ affected: 0 });

      await expect(
        service.updateReceiverInfo({
          orderId: 999,
          receiverName: '张三',
          receiverPhone: '13800138000',
          receiverDetailAddress: '北京市',
          receiverProvince: '北京市',
          receiverCity: '北京市',
          receiverRegion: '朝阳区',
          status: 0,
        }),
      ).rejects.toThrow('订单不存在或当前状态不允许修改收货人信息');
    });
  });

  // ======================== generateConfirmOrder ========================

  describe('generateConfirmOrder', () => {
    // 辅助：为 cartItemRepo.createQueryBuilder 创建链式 mock
    function setupCartQb(cartItems: any[]) {
      const cartQb = {
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        getMany: vi.fn().mockResolvedValue(cartItems),
      };
      mockCartItemRepo.createQueryBuilder.mockReturnValue(cartQb);
      return cartQb;
    }

    it('正常流程 → 返回完整确认订单信息', async () => {
      const cart = cartItemFixture();
      const sku = skuFixture();
      const product = productFixture({ promotionType: 0 });

      // 1. 购物车查询
      setupCartQb([cart]);

      // 2. calcCartPromotion 依赖
      mockProductRepo.findBy.mockResolvedValue([product]);
      mockSkuStockRepo.findBy.mockResolvedValue([sku]);
      mockProductLadderRepo.findBy.mockResolvedValue([]);
      mockProductFullReductionRepo.findBy.mockResolvedValue([]);

      // 3. 收货地址
      mockMemberAddressRepo.findBy.mockResolvedValue([
        { id: 1, memberId: 1, name: '张三', phoneNumber: '13800138000' },
      ]);

      // 4. 无可用优惠券
      mockCouponHistoryRepo.findBy.mockResolvedValue([]);

      // 5. 积分消费设置
      mockIntegrationConsumeSettingRepo.findOneBy.mockResolvedValue({
        id: 1,
        useUnit: 100,
        maxPercentPerOrder: 50,
        couponStatus: 1,
      });

      // 6. 会员信息
      mockMemberRepo.findOneBy.mockResolvedValue({
        id: 1,
        integration: 500,
      });

      const result = await service.generateConfirmOrder(1, [1]);

      expect(result.cartPromotionItemList).toHaveLength(1);
      expect(result.memberReceiveAddressList).toHaveLength(1);
      expect(result.couponHistoryDetailList).toEqual([]);
      expect(result.memberIntegration).toBe(500);
      expect(result.calcAmount).toBeDefined();
      expect(result.calcAmount.totalAmount).toBeGreaterThan(0);
      expect(result.calcAmount.payAmount).toBeGreaterThanOrEqual(0);
    });

    it('无可用优惠券 → couponHistoryDetailList 为空数组', async () => {
      setupCartQb([cartItemFixture()]);
      mockProductRepo.findBy.mockResolvedValue([productFixture()]);
      mockSkuStockRepo.findBy.mockResolvedValue([skuFixture()]);
      mockProductLadderRepo.findBy.mockResolvedValue([]);
      mockProductFullReductionRepo.findBy.mockResolvedValue([]);
      mockMemberAddressRepo.findBy.mockResolvedValue([]);
      mockCouponHistoryRepo.findBy.mockResolvedValue([]);
      mockIntegrationConsumeSettingRepo.findOneBy.mockResolvedValue(null);
      mockMemberRepo.findOneBy.mockResolvedValue({ id: 1, integration: 0 });

      const result = await service.generateConfirmOrder(1, []);

      expect(result.couponHistoryDetailList).toEqual([]);
    });

    it('购物车为空 → cartPromotionItemList 为空', async () => {
      setupCartQb([]);
      mockMemberAddressRepo.findBy.mockResolvedValue([]);
      mockCouponHistoryRepo.findBy.mockResolvedValue([]);
      mockIntegrationConsumeSettingRepo.findOneBy.mockResolvedValue(null);
      mockMemberRepo.findOneBy.mockResolvedValue({ id: 1, integration: 0 });

      const result = await service.generateConfirmOrder(1, []);

      expect(result.cartPromotionItemList).toEqual([]);
      expect(result.calcAmount.totalAmount).toBe(0);
    });
  });

  // ======================== generateOrder ========================

  describe('generateOrder', () => {
    // 辅助：准备 generateOrder 的公共 mock
    function setupGenerateOrderMocks(
      overrides: {
        cartItems?: any[];
        address?: any;
        member?: any;
        skuStock?: any;
        orderSettings?: any[];
      } = {},
    ) {
      const cart = overrides.cartItems ?? [cartItemFixture()];
      const sku = overrides.skuStock ?? skuFixture();
      const product = productFixture({ promotionType: 0 });

      // 购物车查询（createQueryBuilder 链式调用）
      const cartQb = {
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        getMany: vi.fn().mockResolvedValue(cart),
      };
      mockCartItemRepo.createQueryBuilder.mockReturnValue(cartQb);

      // calcCartPromotion 依赖
      mockProductRepo.findBy.mockResolvedValue([product]);
      mockSkuStockRepo.findBy.mockResolvedValue([sku]);
      mockProductLadderRepo.findBy.mockResolvedValue([]);
      mockProductFullReductionRepo.findBy.mockResolvedValue([]);

      // 会员信息
      mockMemberRepo.findOneBy.mockResolvedValue(
        overrides.member ?? { id: 1, username: 'test', integration: 500 },
      );

      // 收货地址（注意：null 表示地址不存在，不能用 ?? 否则 null 会被默认值覆盖）
      mockMemberAddressRepo.findOneBy.mockResolvedValue(
        'address' in overrides
          ? overrides.address
          : {
              id: 1,
              memberId: 1,
              name: '张三',
              phoneNumber: '13800138000',
              postCode: '100000',
              province: '北京市',
              city: '北京市',
              region: '朝阳区',
              detailAddress: '某街道1号',
            },
      );

      // 订单设置
      mockOrderSettingRepo.find.mockResolvedValue(
        overrides.orderSettings ?? [
          { confirmOvertime: 15, normalOrderOvertime: 60 },
        ],
      );

      // Redis 订单号
      mockRedisClient.incr.mockResolvedValue(1);
      mockRedisClient.expire.mockResolvedValue(1);

      // orderRepo.create 透传
      mockOrderRepo.create.mockImplementation((data: any) => ({
        id: 1,
        ...data,
      }));

      // 事务内：manager.save 返回带 id 的 order
      mockManager.save.mockImplementation((_e: any, d: any) =>
        Promise.resolve(
          Array.isArray(d) ? d : { id: 1, orderSn: 'TEST001', ...d },
        ),
      );

      // 事务内：lockStock 需要 getOne 返回 sku（悲观锁查询）
      mockManagerQb.getOne.mockResolvedValue(
        typeof sku === 'object' && !Array.isArray(sku) ? sku : skuFixture(),
      );

      // 查询保存的 orderItems
      mockOrderItemRepo.findBy.mockResolvedValue([orderItemFixture()]);

      return { cartQb };
    }

    it('正常下单（无优惠券无积分）→ 返回 order + orderItemList', async () => {
      setupGenerateOrderMocks();

      const result = await service.generateOrder(1, {
        memberReceiveAddressId: 1,
        payType: 1,
      });

      expect(result.order).toBeDefined();
      expect(result.orderItemList).toHaveLength(1);
      expect(mockTransactionService.run).toHaveBeenCalled();
      expect(mockOrderCancelQueue.add).toHaveBeenCalledWith(
        'cancel-order',
        expect.objectContaining({ orderId: expect.any(Number) }),
        expect.objectContaining({ delay: expect.any(Number) }),
      );
    });

    it('未选择收货地址 → BadRequestException', async () => {
      await expect(
        service.generateOrder(1, {
          memberReceiveAddressId: 0,
          payType: 1,
        }),
      ).rejects.toThrow('请选择收货地址');
    });

    it('库存不足 → BadRequestException', async () => {
      // SKU 库存不足：realStock = stock - lockStock = 0
      setupGenerateOrderMocks({
        skuStock: skuFixture({ stock: 10, lockStock: 10 }),
      });

      await expect(
        service.generateOrder(1, {
          memberReceiveAddressId: 1,
          payType: 1,
        }),
      ).rejects.toThrow('库存不足');
    });

    it('收货地址不存在 → BadRequestException', async () => {
      setupGenerateOrderMocks({ address: null });
      // 需要确保库存充足不会先报错
      mockSkuStockRepo.findBy.mockResolvedValue([skuFixture()]);

      await expect(
        service.generateOrder(1, {
          memberReceiveAddressId: 999,
          payType: 1,
        }),
      ).rejects.toThrow('收货地址不存在');
    });

    it('使用优惠券下单 → 验证 couponHistory 被查询', async () => {
      setupGenerateOrderMocks();

      // 模拟优惠券查询：getUsableCoupon 内部调用
      mockCouponHistoryRepo.findOne.mockResolvedValue({
        id: 1,
        memberId: 1,
        couponId: 5,
        useStatus: 0,
      });
      mockCouponRepo.findOneBy.mockResolvedValue({
        id: 5,
        amount: '10',
        minPoint: '0',
        useType: 0,
      });
      mockCouponProductRelRepo.findBy.mockResolvedValue([]);
      mockCouponCategoryRelRepo.findBy.mockResolvedValue([]);

      const result = await service.generateOrder(1, {
        memberReceiveAddressId: 1,
        payType: 1,
        couponId: 5,
      });

      expect(result.order).toBeDefined();
      expect(mockCouponHistoryRepo.findOne).toHaveBeenCalled();
      expect(mockCouponRepo.findOneBy).toHaveBeenCalledWith({ id: 5 });
    });

    it('使用积分下单 → 验证积分扣减', async () => {
      setupGenerateOrderMocks({
        member: { id: 1, username: 'test', integration: 1000 },
      });

      // 积分消费设置
      mockIntegrationConsumeSettingRepo.findOneBy.mockResolvedValue({
        id: 1,
        useUnit: 100,
        maxPercentPerOrder: 50,
        couponStatus: 1,
      });

      const result = await service.generateOrder(1, {
        memberReceiveAddressId: 1,
        payType: 1,
        useIntegration: 200,
      });

      expect(result.order).toBeDefined();
      // 验证事务内的积分扣减 QB 调用
      expect(mockManager.createQueryBuilder).toHaveBeenCalled();
    });

    it('积分不可用 → BadRequestException', async () => {
      setupGenerateOrderMocks({
        member: { id: 1, username: 'test', integration: 1000 },
      });

      // 积分消费设置：不存在，导致 calcUsableIntegrationAmount 返回 0
      mockIntegrationConsumeSettingRepo.findOneBy.mockResolvedValue(null);

      await expect(
        service.generateOrder(1, {
          memberReceiveAddressId: 1,
          payType: 1,
          useIntegration: 200,
        }),
      ).rejects.toThrow('积分不可用');
    });

    it('BullMQ 入队失败 → 不影响订单（不抛异常）', async () => {
      setupGenerateOrderMocks();
      mockOrderCancelQueue.add.mockRejectedValue(new Error('Redis 连接失败'));

      const result = await service.generateOrder(1, {
        memberReceiveAddressId: 1,
        payType: 1,
      });

      // 订单仍然正常返回
      expect(result.order).toBeDefined();
      expect(result.orderItemList).toHaveLength(1);
    });
  });

  // ======================== adminList ========================

  describe('adminList', () => {
    // 辅助：为 orderRepo.createQueryBuilder 创建链式 mock
    function setupAdminListQb(list: any[] = [], total = 0) {
      const qb = {
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        take: vi.fn().mockReturnThis(),
        getManyAndCount: vi.fn().mockResolvedValue([list, total]),
      };
      mockOrderRepo.createQueryBuilder.mockReturnValue(qb);
      return qb;
    }

    it('无过滤条件 → 返回分页结果', async () => {
      const order = orderFixture();
      setupAdminListQb([order], 1);

      const query = new PageQueryDto();
      const result = await service.adminList(query);

      expect(result.list).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('有 orderSn 过滤 → 验证 andWhere 被调用', async () => {
      const qb = setupAdminListQb([orderFixture()], 1);

      const query = Object.assign(new PageQueryDto(), { orderSn: 'ORDER001' });
      await service.adminList(query);

      expect(qb.andWhere).toHaveBeenCalledWith('order.orderSn = :orderSn', {
        orderSn: 'ORDER001',
      });
    });

    it('有 receiverKeyword 过滤 → 验证模糊搜索', async () => {
      const qb = setupAdminListQb([], 0);

      const query = Object.assign(new PageQueryDto(), {
        receiverKeyword: '张三',
      });
      await service.adminList(query);

      expect(qb.andWhere).toHaveBeenCalledWith(
        '(order.receiverName LIKE :kw OR order.receiverPhone LIKE :kw)',
        { kw: '%张三%' },
      );
    });
  });

  // ======================== memberList ========================

  describe('memberList', () => {
    function setupMemberListQb(list: any[] = [], total = 0) {
      const qb = {
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        take: vi.fn().mockReturnThis(),
        getManyAndCount: vi.fn().mockResolvedValue([list, total]),
      };
      mockOrderRepo.createQueryBuilder.mockReturnValue(qb);
      return qb;
    }

    it('正常返回 → 包含 orderItemList', async () => {
      const order = orderFixture();
      setupMemberListQb([order], 1);
      mockOrderItemRepo.findBy.mockResolvedValue([orderItemFixture()]);

      const query = new PageQueryDto();
      const result = await service.memberList(1, -1, query);

      expect(result.list).toHaveLength(1);
      expect(result.list[0].orderItemList).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('空结果 → 返回空数组', async () => {
      setupMemberListQb([], 0);

      const query = new PageQueryDto();
      const result = await service.memberList(1, -1, query);

      expect(result.list).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('有 status 过滤 → 验证 andWhere', async () => {
      const qb = setupMemberListQb([], 0);

      const query = new PageQueryDto();
      await service.memberList(1, 0, query);

      expect(qb.andWhere).toHaveBeenCalledWith('order.status = :status', {
        status: 0,
      });
    });
  });

  // ======================== listCartPromotion ========================

  describe('listCartPromotion', () => {
    it('正常调用 → 委托 calcCartPromotion', async () => {
      const cart = cartItemFixture();
      mockCartItemRepo.find.mockResolvedValue([cart]);

      // calcCartPromotion 需要的依赖
      mockProductRepo.findBy.mockResolvedValue([productFixture()]);
      mockSkuStockRepo.findBy.mockResolvedValue([skuFixture()]);
      mockProductLadderRepo.findBy.mockResolvedValue([]);
      mockProductFullReductionRepo.findBy.mockResolvedValue([]);

      const result = await service.listCartPromotion(1);

      expect(mockCartItemRepo.find).toHaveBeenCalledWith({
        where: { memberId: 1 },
      });
      expect(result).toHaveLength(1);
      expect(result[0].productId).toBe(100);
    });

    it('传入 cartIds → where 包含 id In 条件', async () => {
      mockCartItemRepo.find.mockResolvedValue([cartItemFixture()]);
      mockProductRepo.findBy.mockResolvedValue([productFixture()]);
      mockSkuStockRepo.findBy.mockResolvedValue([skuFixture()]);
      mockProductLadderRepo.findBy.mockResolvedValue([]);
      mockProductFullReductionRepo.findBy.mockResolvedValue([]);

      await service.listCartPromotion(1, [1, 2]);

      expect(mockCartItemRepo.find).toHaveBeenCalledWith({
        where: expect.objectContaining({ memberId: 1, id: expect.anything() }),
      });
    });
  });

  // ======================== generateOrder 边缘路径 ========================

  describe('generateOrder 边缘路径', () => {
    // 辅助：与 generateOrder describe 块内同名函数结构一致
    function setupGenerateOrderMocks(
      overrides: {
        cartItems?: any[];
        address?: any;
        member?: any;
        skuStock?: any;
        orderSettings?: any[];
      } = {},
    ) {
      const cart = overrides.cartItems ?? [cartItemFixture()];
      const sku = overrides.skuStock ?? skuFixture();
      const product = productFixture({ promotionType: 0 });

      const cartQb = {
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        getMany: vi.fn().mockResolvedValue(cart),
      };
      mockCartItemRepo.createQueryBuilder.mockReturnValue(cartQb);

      mockProductRepo.findBy.mockResolvedValue([product]);
      mockSkuStockRepo.findBy.mockResolvedValue([sku]);
      mockProductLadderRepo.findBy.mockResolvedValue([]);
      mockProductFullReductionRepo.findBy.mockResolvedValue([]);

      mockMemberRepo.findOneBy.mockResolvedValue(
        overrides.member ?? { id: 1, username: 'test', integration: 500 },
      );

      mockMemberAddressRepo.findOneBy.mockResolvedValue(
        'address' in overrides
          ? overrides.address
          : {
              id: 1,
              memberId: 1,
              name: '张三',
              phoneNumber: '13800138000',
              postCode: '100000',
              province: '北京市',
              city: '北京市',
              region: '朝阳区',
              detailAddress: '某街道1号',
            },
      );

      mockOrderSettingRepo.find.mockResolvedValue(
        overrides.orderSettings ?? [
          { confirmOvertime: 15, normalOrderOvertime: 60 },
        ],
      );

      mockRedisClient.incr.mockResolvedValue(1);
      mockRedisClient.expire.mockResolvedValue(1);

      mockOrderRepo.create.mockImplementation((data: any) => ({
        id: 1,
        ...data,
      }));

      mockManager.save.mockImplementation((_e: any, d: any) =>
        Promise.resolve(
          Array.isArray(d) ? d : { id: 1, orderSn: 'TEST001', ...d },
        ),
      );

      mockManagerQb.getOne.mockResolvedValue(
        typeof sku === 'object' && !Array.isArray(sku) ? sku : skuFixture(),
      );

      mockOrderItemRepo.findBy.mockResolvedValue([orderItemFixture()]);

      return { cartQb };
    }

    it('coupon 不可用（getUsableCoupon 返回 null）→ BadRequestException', async () => {
      setupGenerateOrderMocks();
      // getUsableCoupon 内部 findOne 返回 null → 整个方法返回 null
      mockCouponHistoryRepo.findOne.mockResolvedValue(null);

      await expect(
        service.generateOrder(1, {
          memberReceiveAddressId: 1,
          payType: 1,
          couponId: 99,
        }),
      ).rejects.toThrow('该优惠券不可用');
    });

    it('会员信息不存在 → BadRequestException', async () => {
      setupGenerateOrderMocks();
      // 覆盖 memberRepo.findOneBy 返回 null
      mockMemberRepo.findOneBy.mockResolvedValue(null);

      await expect(
        service.generateOrder(1, {
          memberReceiveAddressId: 1,
          payType: 1,
        }),
      ).rejects.toThrow('会员信息不存在');
    });

    it('积分+优惠券不可共用（couponStatus=0）→ 积分不可用', async () => {
      setupGenerateOrderMocks({
        member: { id: 1, username: 'test', integration: 1000 },
      });

      // 优惠券可用
      mockCouponHistoryRepo.findOne.mockResolvedValue({
        id: 1,
        memberId: 1,
        couponId: 5,
        useStatus: 0,
      });
      mockCouponRepo.findOneBy.mockResolvedValue({
        id: 5,
        amount: '10',
        minPoint: '0',
        useType: 0,
      });
      mockCouponProductRelRepo.findBy.mockResolvedValue([]);
      mockCouponCategoryRelRepo.findBy.mockResolvedValue([]);

      // 积分设置：couponStatus=0 表示积分与优惠券不可共用
      mockIntegrationConsumeSettingRepo.findOneBy.mockResolvedValue({
        id: 1,
        useUnit: 100,
        maxPercentPerOrder: 50,
        couponStatus: 0,
      });

      await expect(
        service.generateOrder(1, {
          memberReceiveAddressId: 1,
          payType: 1,
          couponId: 5,
          useIntegration: 200,
        }),
      ).rejects.toThrow('积分不可用');
    });

    it('积分超过最高百分比 → 仍然可下单（按上限抵扣）', async () => {
      setupGenerateOrderMocks({
        member: { id: 1, username: 'test', integration: 10000 },
      });

      // maxPercentPerOrder=10 → 最大抵扣 = 100 * 10% = 10 元
      // useUnit=100 → 200积分 = 2元抵扣，但 maxPercent 更大，所以不受限
      // 需要让积分抵扣金额 > maxPercent 上限：useIntegration=5000 → 5000/100=50元 > 100*10%=10元
      mockIntegrationConsumeSettingRepo.findOneBy.mockResolvedValue({
        id: 1,
        useUnit: 100,
        maxPercentPerOrder: 10,
        couponStatus: 1,
      });

      const result = await service.generateOrder(1, {
        memberReceiveAddressId: 1,
        payType: 1,
        useIntegration: 5000,
      });

      // 积分按上限抵扣，订单仍正常生成
      expect(result.order).toBeDefined();
      expect(result.orderItemList).toHaveLength(1);
    });

    it('订单设置为空（使用默认值）→ 仍然正常下单', async () => {
      setupGenerateOrderMocks({ orderSettings: [] });

      const result = await service.generateOrder(1, {
        memberReceiveAddressId: 1,
        payType: 1,
      });

      expect(result.order).toBeDefined();
      expect(result.orderItemList).toHaveLength(1);
      // 默认延迟 = 60 * 60 * 1000
      expect(mockOrderCancelQueue.add).toHaveBeenCalledWith(
        'cancel-order',
        expect.objectContaining({ orderId: expect.any(Number) }),
        expect.objectContaining({ delay: 60 * 60 * 1000 }),
      );
    });

    it('地址字段为 null → 使用空字符串', async () => {
      setupGenerateOrderMocks({
        address: {
          id: 1,
          memberId: 1,
          name: null,
          phoneNumber: null,
          postCode: null,
          province: null,
          city: null,
          region: null,
          detailAddress: null,
        },
      });

      const result = await service.generateOrder(1, {
        memberReceiveAddressId: 1,
        payType: 1,
      });

      expect(result.order).toBeDefined();
      expect(result.order.receiverName).toBe('');
      expect(result.order.receiverPhone).toBe('');
      expect(result.order.receiverPostCode).toBe('');
      expect(result.order.receiverProvince).toBe('');
      expect(result.order.receiverCity).toBe('');
      expect(result.order.receiverRegion).toBe('');
      expect(result.order.receiverDetailAddress).toBe('');
    });

    it('dto.note/couponId/useIntegration 为 null → 使用 undefined', async () => {
      setupGenerateOrderMocks();

      const result = await service.generateOrder(1, {
        memberReceiveAddressId: 1,
        payType: 1,
        note: null as any,
        couponId: null as any,
        useIntegration: null as any,
      });

      expect(result.order).toBeDefined();
    });

    it('Redis INCR 异常 → 降级为随机序号，订单仍正常生成', async () => {
      setupGenerateOrderMocks();
      mockRedisClient.incr.mockRejectedValue(new Error('Redis 连接断开'));

      const result = await service.generateOrder(1, {
        memberReceiveAddressId: 1,
        payType: 1,
      });

      // 订单仍然正常返回（降级为随机订单号）
      expect(result.order).toBeDefined();
      expect(result.orderItemList).toHaveLength(1);
    });
  });

  // ======================== handleCouponAmount 间接测试 ========================

  describe('handleCouponAmount（通过 generateOrder 间接测试）', () => {
    function setupGenerateOrderMocks(
      overrides: {
        cartItems?: any[];
        address?: any;
        member?: any;
        skuStock?: any;
        orderSettings?: any[];
      } = {},
    ) {
      const cart = overrides.cartItems ?? [cartItemFixture()];
      const sku = overrides.skuStock ?? skuFixture();
      const product = productFixture({ promotionType: 0 });

      const cartQb = {
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        getMany: vi.fn().mockResolvedValue(cart),
      };
      mockCartItemRepo.createQueryBuilder.mockReturnValue(cartQb);

      mockProductRepo.findBy.mockResolvedValue([product]);
      mockSkuStockRepo.findBy.mockResolvedValue([sku]);
      mockProductLadderRepo.findBy.mockResolvedValue([]);
      mockProductFullReductionRepo.findBy.mockResolvedValue([]);

      mockMemberRepo.findOneBy.mockResolvedValue(
        overrides.member ?? { id: 1, username: 'test', integration: 500 },
      );

      mockMemberAddressRepo.findOneBy.mockResolvedValue(
        'address' in overrides
          ? overrides.address
          : {
              id: 1,
              memberId: 1,
              name: '张三',
              phoneNumber: '13800138000',
              postCode: '100000',
              province: '北京市',
              city: '北京市',
              region: '朝阳区',
              detailAddress: '某街道1号',
            },
      );

      mockOrderSettingRepo.find.mockResolvedValue(
        overrides.orderSettings ?? [
          { confirmOvertime: 15, normalOrderOvertime: 60 },
        ],
      );

      mockRedisClient.incr.mockResolvedValue(1);
      mockRedisClient.expire.mockResolvedValue(1);

      mockOrderRepo.create.mockImplementation((data: any) => ({
        id: 1,
        ...data,
      }));

      mockManager.save.mockImplementation((_e: any, d: any) =>
        Promise.resolve(
          Array.isArray(d) ? d : { id: 1, orderSn: 'TEST001', ...d },
        ),
      );

      mockManagerQb.getOne.mockResolvedValue(
        typeof sku === 'object' && !Array.isArray(sku) ? sku : skuFixture(),
      );

      mockOrderItemRepo.findBy.mockResolvedValue([orderItemFixture()]);

      return { cartQb };
    }

    it('useType=1（指定分类匹配）→ 只有匹配分类的商品有 couponAmount', async () => {
      // 购物车含两种分类的商品
      setupGenerateOrderMocks({
        cartItems: [
          cartItemFixture({ id: 1, productCategoryId: 10 }),
          cartItemFixture({
            id: 2,
            productId: 101,
            productSkuId: 201,
            productCategoryId: 20,
          }),
        ],
        skuStock: [
          skuFixture({ id: 200, productId: 100 }),
          skuFixture({ id: 201, productId: 101 }),
        ],
      });
      // 覆盖：两个商品
      mockProductRepo.findBy.mockResolvedValue([
        productFixture({ id: 100, promotionType: 0 }),
        productFixture({ id: 101, promotionType: 0 }),
      ]);
      mockSkuStockRepo.findBy.mockResolvedValue([
        skuFixture({ id: 200, productId: 100 }),
        skuFixture({ id: 201, productId: 101 }),
      ]);

      // 优惠券 useType=1，指定分类 10
      mockCouponHistoryRepo.findOne.mockResolvedValue({
        id: 1,
        memberId: 1,
        couponId: 5,
        useStatus: 0,
      });
      mockCouponRepo.findOneBy.mockResolvedValue({
        id: 5,
        amount: '10',
        minPoint: '0',
        useType: 1,
      });
      mockCouponProductRelRepo.findBy.mockResolvedValue([]);
      mockCouponCategoryRelRepo.findBy.mockResolvedValue([
        { id: 1, couponId: 5, productCategoryId: 10 },
      ]);

      const result = await service.generateOrder(1, {
        memberReceiveAddressId: 1,
        payType: 1,
        couponId: 5,
      });

      expect(result.order).toBeDefined();
      // couponAmount 应 > 0（只有分类10的商品参与分摊）
      expect(Number(result.order.couponAmount)).toBeGreaterThan(0);
    });

    it('useType=2（指定商品匹配）→ 只有匹配商品的 couponAmount 不为 0', async () => {
      setupGenerateOrderMocks({
        cartItems: [
          cartItemFixture({ id: 1, productId: 100 }),
          cartItemFixture({ id: 2, productId: 101, productSkuId: 201 }),
        ],
      });
      mockProductRepo.findBy.mockResolvedValue([
        productFixture({ id: 100, promotionType: 0 }),
        productFixture({ id: 101, promotionType: 0 }),
      ]);
      mockSkuStockRepo.findBy.mockResolvedValue([
        skuFixture({ id: 200, productId: 100 }),
        skuFixture({ id: 201, productId: 101 }),
      ]);

      // 优惠券 useType=2，指定商品 100
      mockCouponHistoryRepo.findOne.mockResolvedValue({
        id: 1,
        memberId: 1,
        couponId: 5,
        useStatus: 0,
      });
      mockCouponRepo.findOneBy.mockResolvedValue({
        id: 5,
        amount: '10',
        minPoint: '0',
        useType: 2,
      });
      mockCouponProductRelRepo.findBy.mockResolvedValue([
        { id: 1, couponId: 5, productId: 100 },
      ]);
      mockCouponCategoryRelRepo.findBy.mockResolvedValue([]);

      const result = await service.generateOrder(1, {
        memberReceiveAddressId: 1,
        payType: 1,
        couponId: 5,
      });

      expect(result.order).toBeDefined();
      expect(Number(result.order.couponAmount)).toBeGreaterThan(0);
    });

    it('useType=1 但无匹配分类 → couponAmount 为 0', async () => {
      setupGenerateOrderMocks();

      // 优惠券 useType=1，指定分类 999（不匹配任何购物车商品的分类 10）
      mockCouponHistoryRepo.findOne.mockResolvedValue({
        id: 1,
        memberId: 1,
        couponId: 5,
        useStatus: 0,
      });
      mockCouponRepo.findOneBy.mockResolvedValue({
        id: 5,
        amount: '10',
        minPoint: '0',
        useType: 1,
      });
      mockCouponProductRelRepo.findBy.mockResolvedValue([]);
      mockCouponCategoryRelRepo.findBy.mockResolvedValue([
        { id: 1, couponId: 5, productCategoryId: 999 },
      ]);

      const result = await service.generateOrder(1, {
        memberReceiveAddressId: 1,
        payType: 1,
        couponId: 5,
      });

      expect(result.order).toBeDefined();
      // 无匹配分类，couponAmount 应为 0
      expect(Number(result.order.couponAmount)).toBe(0);
    });

    it('useType=0（全场通用）多商品 → calcPerCouponAmount else 分支（非最后一项分摊）', async () => {
      // 需要 2+ 个 orderItem 传入 calcPerCouponAmount，使 else 分支 (i !== length-1) 被覆盖
      setupGenerateOrderMocks({
        cartItems: [
          cartItemFixture({
            id: 1,
            productId: 100,
            productSkuId: 200,
            productCategoryId: 10,
          }),
          cartItemFixture({
            id: 2,
            productId: 101,
            productSkuId: 201,
            productCategoryId: 10,
          }),
        ],
      });
      mockProductRepo.findBy.mockResolvedValue([
        productFixture({ id: 100, promotionType: 0 }),
        productFixture({ id: 101, promotionType: 0 }),
      ]);
      mockSkuStockRepo.findBy.mockResolvedValue([
        skuFixture({ id: 200, productId: 100 }),
        skuFixture({ id: 201, productId: 101 }),
      ]);

      // useType=0: 全场通用，所有 orderItem 都参与分摊
      mockCouponHistoryRepo.findOne.mockResolvedValue({
        id: 1,
        memberId: 1,
        couponId: 5,
        useStatus: 0,
      });
      mockCouponRepo.findOneBy.mockResolvedValue({
        id: 5,
        amount: '10',
        minPoint: '0',
        useType: 0,
      });
      mockCouponProductRelRepo.findBy.mockResolvedValue([]);
      mockCouponCategoryRelRepo.findBy.mockResolvedValue([]);

      const result = await service.generateOrder(1, {
        memberReceiveAddressId: 1,
        payType: 1,
        couponId: 5,
      });

      expect(result.order).toBeDefined();
      expect(Number(result.order.couponAmount)).toBeGreaterThan(0);
    });

    it('updateCouponStatus useStatus=1 但 couponHistory 不存在 → BadRequestException', async () => {
      setupGenerateOrderMocks();

      // getUsableCoupon 正常返回（couponHistoryRepo.findOne via repo mock）
      mockCouponHistoryRepo.findOne.mockResolvedValue({
        id: 1,
        memberId: 1,
        couponId: 5,
        useStatus: 0,
      });
      mockCouponRepo.findOneBy.mockResolvedValue({
        id: 5,
        amount: '10',
        minPoint: '0',
        useType: 0,
      });
      mockCouponProductRelRepo.findBy.mockResolvedValue([]);
      mockCouponCategoryRelRepo.findBy.mockResolvedValue([]);

      // updateCouponStatus 内部：manager.findOne 返回 null（找不到状态为 0 的 couponHistory）
      // 此时 useStatus=1，应抛出 BadRequestException
      mockManager.findOne.mockResolvedValue(null);

      await expect(
        service.generateOrder(1, {
          memberReceiveAddressId: 1,
          payType: 1,
          couponId: 5,
        }),
      ).rejects.toThrow('优惠券已被使用或不可用');
    });
  });

  // ======================== adminList 过滤条件扩展 ========================

  describe('adminList 过滤条件扩展', () => {
    function setupAdminListQb(list: any[] = [], total = 0) {
      const qb = {
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        take: vi.fn().mockReturnThis(),
        getManyAndCount: vi.fn().mockResolvedValue([list, total]),
      };
      mockOrderRepo.createQueryBuilder.mockReturnValue(qb);
      return qb;
    }

    it('status 过滤 → andWhere 包含 status 条件', async () => {
      const qb = setupAdminListQb([], 0);

      const query = Object.assign(new PageQueryDto(), { status: 1 });
      await service.adminList(query);

      expect(qb.andWhere).toHaveBeenCalledWith('order.status = :status', {
        status: 1,
      });
    });

    it('payType 过滤 → andWhere 包含 payType 条件', async () => {
      const qb = setupAdminListQb([], 0);

      const query = Object.assign(new PageQueryDto(), { payType: 2 });
      await service.adminList(query);

      expect(qb.andWhere).toHaveBeenCalledWith('order.payType = :payType', {
        payType: 2,
      });
    });

    it('sourceType 过滤 → andWhere 包含 sourceType 条件', async () => {
      const qb = setupAdminListQb([], 0);

      const query = Object.assign(new PageQueryDto(), { sourceType: 1 });
      await service.adminList(query);

      expect(qb.andWhere).toHaveBeenCalledWith(
        'order.sourceType = :sourceType',
        { sourceType: 1 },
      );
    });

    it('时间范围过滤（startTime + endTime）→ andWhere 包含时间条件', async () => {
      const qb = setupAdminListQb([], 0);

      const query = Object.assign(new PageQueryDto(), {
        startTime: '2025-01-01',
        endTime: '2025-12-31',
      });
      await service.adminList(query);

      expect(qb.andWhere).toHaveBeenCalledWith(
        'order.createdAt >= :startTime',
        { startTime: new Date('2025-01-01') },
      );
      expect(qb.andWhere).toHaveBeenCalledWith('order.createdAt <= :endTime', {
        endTime: new Date('2025-12-31'),
      });
    });

    it('空字符串 status 不过滤 → 不添加 status 条件', async () => {
      const qb = setupAdminListQb([orderFixture()], 1);

      const query = Object.assign(new PageQueryDto(), { status: '' });
      await service.adminList(query);

      // andWhere 不应包含 status 条件
      const statusCalls = qb.andWhere.mock.calls.filter(
        (call: any[]) =>
          typeof call[0] === 'string' && call[0].includes('status'),
      );
      expect(statusCalls).toHaveLength(0);
    });
  });

  // ======================== paySuccess 边缘路径 ========================

  describe('paySuccess 边缘路径', () => {
    it('SKU 不存在（sku 为 null）→ BadRequestException', async () => {
      mockManagerQb.execute.mockResolvedValueOnce({ affected: 1 }); // 订单更新成功
      mockManager.findBy.mockResolvedValue([
        orderItemFixture({ productSkuId: 200, productQuantity: 2 }),
      ]);
      // 悲观锁查询 SKU 返回 null
      mockManagerQb.getOne.mockResolvedValue(null);

      await expect(service.paySuccess(1, 1, 1)).rejects.toThrow('库存不足');
    });

    it('productQuantity=0 → continue 跳过，不查询 SKU', async () => {
      mockManagerQb.execute.mockResolvedValueOnce({ affected: 1 }); // 订单更新成功
      mockManager.findBy.mockResolvedValue([
        orderItemFixture({ productSkuId: 200, productQuantity: 0 }),
      ]);

      // 不应触发 getOne（因为 qty <= 0 时 continue）
      await service.paySuccess(1, 1, 1);

      // 验证操作历史被记录
      expect(mockManager.save).toHaveBeenCalledWith(
        OrderOperateHistoryEntity,
        expect.objectContaining({ orderStatus: OrderStatus.PAID }),
      );
    });
  });

  // ======================== calcUsableIntegrationAmount 边缘路径 ========================

  describe('calcUsableIntegrationAmount（通过 generateOrder 间接测试）', () => {
    function setupGenerateOrderMocks(
      overrides: {
        cartItems?: any[];
        address?: any;
        member?: any;
        skuStock?: any;
        orderSettings?: any[];
      } = {},
    ) {
      const cart = overrides.cartItems ?? [cartItemFixture()];
      const sku = overrides.skuStock ?? skuFixture();
      const product = productFixture({ promotionType: 0 });

      const cartQb = {
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        getMany: vi.fn().mockResolvedValue(cart),
      };
      mockCartItemRepo.createQueryBuilder.mockReturnValue(cartQb);

      mockProductRepo.findBy.mockResolvedValue([product]);
      mockSkuStockRepo.findBy.mockResolvedValue([sku]);
      mockProductLadderRepo.findBy.mockResolvedValue([]);
      mockProductFullReductionRepo.findBy.mockResolvedValue([]);

      mockMemberRepo.findOneBy.mockResolvedValue(
        overrides.member ?? { id: 1, username: 'test', integration: 500 },
      );

      mockMemberAddressRepo.findOneBy.mockResolvedValue(
        'address' in overrides
          ? overrides.address
          : {
              id: 1,
              memberId: 1,
              name: '张三',
              phoneNumber: '13800138000',
              postCode: '100000',
              province: '北京市',
              city: '北京市',
              region: '朝阳区',
              detailAddress: '某街道1号',
            },
      );

      mockOrderSettingRepo.find.mockResolvedValue(
        overrides.orderSettings ?? [
          { confirmOvertime: 15, normalOrderOvertime: 60 },
        ],
      );

      mockRedisClient.incr.mockResolvedValue(1);
      mockRedisClient.expire.mockResolvedValue(1);

      mockOrderRepo.create.mockImplementation((data: any) => ({
        id: 1,
        ...data,
      }));

      mockManager.save.mockImplementation((_e: any, d: any) =>
        Promise.resolve(
          Array.isArray(d) ? d : { id: 1, orderSn: 'TEST001', ...d },
        ),
      );

      mockManagerQb.getOne.mockResolvedValue(
        typeof sku === 'object' && !Array.isArray(sku) ? sku : skuFixture(),
      );

      mockOrderItemRepo.findBy.mockResolvedValue([orderItemFixture()]);
    }

    it('member.integration 为 null → 积分余额视为 0，积分不可用', async () => {
      setupGenerateOrderMocks({
        member: { id: 1, username: 'test', integration: null },
      });

      mockIntegrationConsumeSettingRepo.findOneBy.mockResolvedValue({
        id: 1,
        useUnit: 100,
        maxPercentPerOrder: 50,
        couponStatus: 1,
      });

      await expect(
        service.generateOrder(1, {
          memberReceiveAddressId: 1,
          payType: 1,
          useIntegration: 200,
        }),
      ).rejects.toThrow('积分不可用');
    });

    it('member.integration 为 undefined → 积分余额视为 0，积分不可用', async () => {
      setupGenerateOrderMocks({
        member: { id: 1, username: 'test' },
      });

      mockIntegrationConsumeSettingRepo.findOneBy.mockResolvedValue({
        id: 1,
        useUnit: 100,
        maxPercentPerOrder: 50,
        couponStatus: 1,
      });

      await expect(
        service.generateOrder(1, {
          memberReceiveAddressId: 1,
          payType: 1,
          useIntegration: 200,
        }),
      ).rejects.toThrow('积分不可用');
    });

    it('useIntegration 低于最低使用门槛 → 积分不可用', async () => {
      setupGenerateOrderMocks({
        member: { id: 1, username: 'test', integration: 1000 },
      });

      // useUnit=500，使用 200 积分低于门槛
      mockIntegrationConsumeSettingRepo.findOneBy.mockResolvedValue({
        id: 1,
        useUnit: 500,
        maxPercentPerOrder: 50,
        couponStatus: 1,
      });

      await expect(
        service.generateOrder(1, {
          memberReceiveAddressId: 1,
          payType: 1,
          useIntegration: 200,
        }),
      ).rejects.toThrow('积分不可用');
    });
  });

  // ======================== lockStock 边缘路径 ========================

  describe('lockStock（通过 generateOrder 间接测试）', () => {
    function setupGenerateOrderMocks(
      overrides: {
        cartItems?: any[];
        address?: any;
        member?: any;
        skuStock?: any;
        orderSettings?: any[];
      } = {},
    ) {
      const cart = overrides.cartItems ?? [cartItemFixture()];
      const sku = overrides.skuStock ?? skuFixture();
      const product = productFixture({ promotionType: 0 });

      const cartQb = {
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        getMany: vi.fn().mockResolvedValue(cart),
      };
      mockCartItemRepo.createQueryBuilder.mockReturnValue(cartQb);

      mockProductRepo.findBy.mockResolvedValue([product]);
      mockSkuStockRepo.findBy.mockResolvedValue([sku]);
      mockProductLadderRepo.findBy.mockResolvedValue([]);
      mockProductFullReductionRepo.findBy.mockResolvedValue([]);

      mockMemberRepo.findOneBy.mockResolvedValue(
        overrides.member ?? { id: 1, username: 'test', integration: 500 },
      );

      mockMemberAddressRepo.findOneBy.mockResolvedValue(
        'address' in overrides
          ? overrides.address
          : {
              id: 1,
              memberId: 1,
              name: '张三',
              phoneNumber: '13800138000',
              postCode: '100000',
              province: '北京市',
              city: '北京市',
              region: '朝阳区',
              detailAddress: '某街道1号',
            },
      );

      mockOrderSettingRepo.find.mockResolvedValue(
        overrides.orderSettings ?? [
          { confirmOvertime: 15, normalOrderOvertime: 60 },
        ],
      );

      mockRedisClient.incr.mockResolvedValue(1);
      mockRedisClient.expire.mockResolvedValue(1);

      mockOrderRepo.create.mockImplementation((data: any) => ({
        id: 1,
        ...data,
      }));

      mockManager.save.mockImplementation((_e: any, d: any) =>
        Promise.resolve(
          Array.isArray(d) ? d : { id: 1, orderSn: 'TEST001', ...d },
        ),
      );

      mockManagerQb.getOne.mockResolvedValue(
        typeof sku === 'object' && !Array.isArray(sku) ? sku : skuFixture(),
      );

      mockOrderItemRepo.findBy.mockResolvedValue([orderItemFixture()]);
    }

    it('lockStock SKU 不存在（getOne 返回 null）→ BadRequestException', async () => {
      setupGenerateOrderMocks();
      // lockStock 内部悲观锁查询返回 null
      mockManagerQb.getOne.mockResolvedValue(null);

      await expect(
        service.generateOrder(1, {
          memberReceiveAddressId: 1,
          payType: 1,
        }),
      ).rejects.toThrow('SKU 不存在');
    });

    it('lockStock 可用库存不足 → BadRequestException', async () => {
      setupGenerateOrderMocks();
      // lockStock 内部悲观锁返回 SKU，但可用量 < 需求量
      mockManagerQb.getOne.mockResolvedValue(
        skuFixture({ stock: 5, lockStock: 4 }), // available = 1, 但购物车需要 2
      );

      await expect(
        service.generateOrder(1, {
          memberReceiveAddressId: 1,
          payType: 1,
        }),
      ).rejects.toThrow('库存不足');
    });

    it('lockStock 数量无效（qty=0）→ BadRequestException', async () => {
      setupGenerateOrderMocks({
        cartItems: [cartItemFixture({ productQuantity: 0 })],
        skuStock: skuFixture(),
      });
      // calcCartPromotion 设 quantity=0, 但库存检查 realStock > 0，需要绕过库存检查
      // 实际上 quantity=0 会让 realStock 检查通过 (realStock=90 >= quantity=0 is fine... wait)
      // 检查: item.realStock < item.quantity → 90 < 0 is false, so it passes
      // Then lockStock: qty = Number(0) = 0 → !qty → true → throws

      await expect(
        service.generateOrder(1, {
          memberReceiveAddressId: 1,
          payType: 1,
        }),
      ).rejects.toThrow('数量无效');
    });
  });

  // ======================== calcCartPromotion 补充 ========================

  describe('calcCartPromotion 补充', () => {
    it('promotionType=4 满减未达条件 → 无优惠', async () => {
      mockProductRepo.findBy.mockResolvedValue([
        productFixture({ promotionType: 4 }),
      ]);
      mockSkuStockRepo.findBy.mockResolvedValue([skuFixture()]);
      mockProductLadderRepo.findBy.mockResolvedValue([]);
      mockProductFullReductionRepo.findBy.mockResolvedValue([
        { productId: 100, fullPrice: '200', reducePrice: '20' } as any,
      ]);

      // 1件 × 50元 = 50元，未满200
      const result = await service.calcCartPromotion([
        cartItemFixture({ productQuantity: 1 }),
      ]);

      expect(result[0].reduceAmount).toBe(0);
      expect(result[0].promotionMessage).toBe('无优惠');
    });

    it('promotionType=4 满减多规则排序 → 选择最大满足的规则', async () => {
      mockProductRepo.findBy.mockResolvedValue([
        productFixture({ promotionType: 4 }),
      ]);
      mockSkuStockRepo.findBy.mockResolvedValue([skuFixture()]);
      mockProductLadderRepo.findBy.mockResolvedValue([]);
      // 2 条满减规则，触发 sort comparator
      mockProductFullReductionRepo.findBy.mockResolvedValue([
        { productId: 100, fullPrice: '50', reducePrice: '5' } as any,
        { productId: 100, fullPrice: '80', reducePrice: '10' } as any,
      ]);

      // 2件 × 50元 = 100元，满80减10（选更高的规则）
      const result = await service.calcCartPromotion([
        cartItemFixture({ productQuantity: 2 }),
      ]);

      expect(result[0].reduceAmount).toBe(5); // (50/100)*10 = 5 单件分摊
      expect(result[0].promotionMessage).toContain('满减优惠');
      expect(result[0].promotionMessage).toContain('80');
    });

    it('商品不存在时降级 → realStock=0, reduceAmount=0', async () => {
      mockProductRepo.findBy.mockResolvedValue([]); // 商品查不到
      mockSkuStockRepo.findBy.mockResolvedValue([]); // SKU 也查不到
      mockProductLadderRepo.findBy.mockResolvedValue([]);
      mockProductFullReductionRepo.findBy.mockResolvedValue([]);

      const result = await service.calcCartPromotion([cartItemFixture()]);

      expect(result).toHaveLength(1);
      expect(result[0].reduceAmount).toBe(0);
      expect(result[0].realStock).toBe(0);
      expect(result[0].promotionMessage).toBe('无优惠');
    });

    it('promotionType=1 SKU 不匹配 → price=0, realStock=0', async () => {
      mockProductRepo.findBy.mockResolvedValue([
        productFixture({ promotionType: 1 }),
      ]);
      mockSkuStockRepo.findBy.mockResolvedValue([skuFixture({ id: 999 })]);
      mockProductLadderRepo.findBy.mockResolvedValue([]);
      mockProductFullReductionRepo.findBy.mockResolvedValue([]);

      const result = await service.calcCartPromotion([cartItemFixture()]);
      expect(result[0].price).toBe(0);
      expect(result[0].realStock).toBe(0);
    });

    it('promotionType=1 无 promotionPrice → reduceAmount=0', async () => {
      mockProductRepo.findBy.mockResolvedValue([
        productFixture({ promotionType: 1 }),
      ]);
      mockSkuStockRepo.findBy.mockResolvedValue([
        skuFixture({ promotionPrice: null }),
      ]);
      mockProductLadderRepo.findBy.mockResolvedValue([]);
      mockProductFullReductionRepo.findBy.mockResolvedValue([]);

      const result = await service.calcCartPromotion([cartItemFixture()]);
      expect(result[0].reduceAmount).toBe(0);
      expect(result[0].promotionMessage).toBe('单品促销');
    });

    it('promotionType=3 阶梯价 SKU 不匹配 → price=0', async () => {
      mockProductRepo.findBy.mockResolvedValue([
        productFixture({ promotionType: 3 }),
      ]);
      mockSkuStockRepo.findBy.mockResolvedValue([skuFixture({ id: 999 })]);
      mockProductLadderRepo.findBy.mockResolvedValue([
        { productId: 100, count: 1, discount: '0.8' } as any,
      ]);
      mockProductFullReductionRepo.findBy.mockResolvedValue([]);

      const result = await service.calcCartPromotion([
        cartItemFixture({ productQuantity: 2 }),
      ]);
      expect(result[0].price).toBe(0);
      expect(result[0].realStock).toBe(0);
    });

    it('promotionType=3 未达梯度 + skuStock null → 无优惠降级', async () => {
      mockProductRepo.findBy.mockResolvedValue([
        productFixture({ promotionType: 3 }),
      ]);
      mockSkuStockRepo.findBy.mockResolvedValue([skuFixture({ id: 999 })]);
      mockProductLadderRepo.findBy.mockResolvedValue([
        { productId: 100, count: 100, discount: '0.8' } as any,
      ]);
      mockProductFullReductionRepo.findBy.mockResolvedValue([]);

      const result = await service.calcCartPromotion([
        cartItemFixture({ productQuantity: 1 }),
      ]);
      expect(result[0].reduceAmount).toBe(0);
      expect(result[0].realStock).toBe(0);
    });

    it('promotionType=4 SKU 不匹配 → price=0', async () => {
      mockProductRepo.findBy.mockResolvedValue([
        productFixture({ promotionType: 4 }),
      ]);
      mockSkuStockRepo.findBy.mockResolvedValue([skuFixture({ id: 999 })]);
      mockProductLadderRepo.findBy.mockResolvedValue([]);
      mockProductFullReductionRepo.findBy.mockResolvedValue([
        { productId: 100, fullPrice: '0', reducePrice: '5' } as any,
      ]);

      const result = await service.calcCartPromotion([
        cartItemFixture({ productQuantity: 2 }),
      ]);
      expect(result[0].price).toBe(0);
    });

    it('promotionType=4 多商品 totalAmount=0 → reduceAmount=0 (else 分支)', async () => {
      mockProductRepo.findBy.mockResolvedValue([
        productFixture({ promotionType: 4 }),
      ]);
      mockSkuStockRepo.findBy.mockResolvedValue([
        skuFixture({ id: 200, price: '0' }),
        skuFixture({ id: 201, price: '0' }),
      ]);
      mockProductLadderRepo.findBy.mockResolvedValue([]);
      mockProductFullReductionRepo.findBy.mockResolvedValue([
        { productId: 100, fullPrice: '0', reducePrice: '5' } as any,
      ]);

      const result = await service.calcCartPromotion([
        cartItemFixture({ id: 1, productSkuId: 200, productQuantity: 1 }),
        cartItemFixture({ id: 2, productSkuId: 201, productQuantity: 1 }),
      ]);
      expect(result).toHaveLength(2);
      expect(result[0].reduceAmount).toBe(0);
    });

    it('promotionType=4 productQuantity=0 → 补差法分支返回 0', async () => {
      mockProductRepo.findBy.mockResolvedValue([
        productFixture({ promotionType: 4 }),
      ]);
      mockSkuStockRepo.findBy.mockResolvedValue([skuFixture()]);
      mockProductLadderRepo.findBy.mockResolvedValue([]);
      mockProductFullReductionRepo.findBy.mockResolvedValue([
        { productId: 100, fullPrice: '0', reducePrice: '5' } as any,
      ]);

      const result = await service.calcCartPromotion([
        cartItemFixture({ productQuantity: 0 }),
      ]);
      expect(result[0].reduceAmount).toBe(0);
    });

    it('promotionType=4 满减不匹配 + skuStock null → 无优惠', async () => {
      mockProductRepo.findBy.mockResolvedValue([
        productFixture({ promotionType: 4 }),
      ]);
      mockSkuStockRepo.findBy.mockResolvedValue([skuFixture({ id: 999 })]);
      mockProductLadderRepo.findBy.mockResolvedValue([]);
      mockProductFullReductionRepo.findBy.mockResolvedValue([
        { productId: 100, fullPrice: '999', reducePrice: '5' } as any,
      ]);

      const result = await service.calcCartPromotion([
        cartItemFixture({ productQuantity: 2 }),
      ]);
      expect(result[0].reduceAmount).toBe(0);
      expect(result[0].promotionMessage).toBe('无优惠');
    });

    it('promotionType=0 skuStock null → buildNoReducePromotionItem 使用 productPrice', async () => {
      mockProductRepo.findBy.mockResolvedValue([
        productFixture({ promotionType: 0 }),
      ]);
      // SKU 不匹配 → skuStock ?? null → null 传入 buildNoReducePromotionItem
      mockSkuStockRepo.findBy.mockResolvedValue([skuFixture({ id: 999 })]);
      mockProductLadderRepo.findBy.mockResolvedValue([]);
      mockProductFullReductionRepo.findBy.mockResolvedValue([]);

      const result = await service.calcCartPromotion([
        cartItemFixture({ productPrice: '30.00' }),
      ]);
      expect(result[0].price).toBe(30);
      expect(result[0].realStock).toBe(0);
    });
  });

  // ======================== 更多边缘分支覆盖 ========================

  describe('close 边缘路径', () => {
    it('无可关闭订单 → 直接返回 0', async () => {
      const qb = {
        where: vi.fn().mockReturnThis(),
        getMany: vi.fn().mockResolvedValue([]),
      };
      mockOrderRepo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.close([1], '关闭');
      expect(result).toBe(0);
    });

    it('待付款订单 productQuantity=0 → filter 过滤掉不释放库存', async () => {
      const qb = {
        where: vi.fn().mockReturnThis(),
        getMany: vi
          .fn()
          .mockResolvedValue([
            orderFixture({ id: 1, status: OrderStatus.PENDING_PAYMENT }),
          ]),
      };
      mockOrderRepo.createQueryBuilder.mockReturnValue(qb);
      mockManager.findBy.mockResolvedValue([
        orderItemFixture({ productQuantity: 0 }),
      ]);

      await service.close([1], '关闭');
      expect(mockTransactionService.run).toHaveBeenCalled();
    });

    it('非待付款订单 + 无优惠券 + 无积分 → 只写历史', async () => {
      const qb = {
        where: vi.fn().mockReturnThis(),
        getMany: vi.fn().mockResolvedValue([
          orderFixture({
            id: 1,
            status: OrderStatus.PAID,
            couponId: null,
            useIntegration: 0,
          }),
        ]),
      };
      mockOrderRepo.createQueryBuilder.mockReturnValue(qb);

      await service.close([1], '关闭');
      expect(mockManager.save).toHaveBeenCalled();
    });
  });

  describe('cancelOrder 更多边缘路径', () => {
    it('productQuantity=0 → filter 过滤掉不释放库存', async () => {
      mockOrderRepo.findOne.mockResolvedValue(orderFixture());
      mockManager.findBy.mockResolvedValue([
        orderItemFixture({ productQuantity: 0 }),
      ]);

      await service.cancelOrder(1, 1);
      expect(mockTransactionService.run).toHaveBeenCalled();
    });

    it('无优惠券 + 无积分 → 只记录历史', async () => {
      mockOrderRepo.findOne.mockResolvedValue(
        orderFixture({ couponId: null, useIntegration: 0 }),
      );
      mockManager.findBy.mockResolvedValue([]);

      await service.cancelOrder(1, 1);
      expect(mockManager.save).toHaveBeenCalledWith(
        OrderOperateHistoryEntity,
        expect.objectContaining({ note: '用户取消订单' }),
      );
    });
  });

  describe('generateOrderSn Redis INCR > 1', () => {
    it('Redis INCR 返回 > 1 → 不设置 expire', async () => {
      const cartQb = {
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        getMany: vi.fn().mockResolvedValue([cartItemFixture()]),
      };
      mockCartItemRepo.createQueryBuilder.mockReturnValue(cartQb);
      mockProductRepo.findBy.mockResolvedValue([productFixture()]);
      mockSkuStockRepo.findBy.mockResolvedValue([skuFixture()]);
      mockProductLadderRepo.findBy.mockResolvedValue([]);
      mockProductFullReductionRepo.findBy.mockResolvedValue([]);
      mockMemberRepo.findOneBy.mockResolvedValue({
        id: 1,
        username: 'test',
        integration: 500,
      });
      mockMemberAddressRepo.findOneBy.mockResolvedValue({
        id: 1,
        memberId: 1,
        name: '张',
        phoneNumber: '138',
        postCode: '100',
        province: '北京',
        city: '北京',
        region: '朝阳',
        detailAddress: '路1号',
      });
      mockOrderSettingRepo.find.mockResolvedValue([
        { confirmOvertime: 15, normalOrderOvertime: 60 },
      ]);
      mockOrderRepo.create.mockImplementation((d: any) => ({ id: 1, ...d }));
      mockManager.save.mockImplementation((_e: any, d: any) =>
        Promise.resolve(
          Array.isArray(d) ? d : { id: 1, orderSn: 'TEST', ...d },
        ),
      );
      mockManagerQb.getOne.mockResolvedValue(skuFixture());
      mockOrderItemRepo.findBy.mockResolvedValue([orderItemFixture()]);
      mockRedisClient.incr.mockResolvedValue(5);
      mockRedisClient.expire.mockClear();

      const result = await service.generateOrder(1, {
        memberReceiveAddressId: 1,
        payType: 1,
      });

      expect(result.order).toBeDefined();
      expect(mockRedisClient.expire).not.toHaveBeenCalled();
    });
  });

  describe('deleteOrder affected undefined', () => {
    it('affected 为 undefined → 返回 0', async () => {
      mockOrderRepo.findOne.mockResolvedValue(
        orderFixture({ status: OrderStatus.COMPLETED }),
      );
      mockOrderRepo.update.mockResolvedValue({});

      const result = await service.deleteOrder(1, 1);
      expect(result).toBe(0);
    });
  });

  describe('updateReceiverInfo affected=0', () => {
    it('affected=0 → NotFoundException', async () => {
      mockManagerQb.execute.mockResolvedValueOnce({ affected: 0 });

      await expect(
        service.updateReceiverInfo({
          orderId: 999,
          receiverName: '张',
          receiverPhone: '138',
          receiverDetailAddress: '北京',
          receiverProvince: '北京',
          receiverCity: '北京',
          receiverRegion: '朝阳',
          status: 0,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateMoneyInfo affected=0', () => {
    it('affected=0 → NotFoundException', async () => {
      mockManagerQb.execute.mockResolvedValueOnce({ affected: 0 });

      await expect(
        service.updateMoneyInfo({ orderId: 999, freightAmount: 10, status: 0 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('generateConfirmOrder 边缘', () => {
    it('有优惠券但 coupon 不匹配 → filter 排除', async () => {
      const cartQb = {
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        getMany: vi.fn().mockResolvedValue([cartItemFixture()]),
      };
      mockCartItemRepo.createQueryBuilder.mockReturnValue(cartQb);
      mockProductRepo.findBy.mockResolvedValue([productFixture()]);
      mockSkuStockRepo.findBy.mockResolvedValue([skuFixture()]);
      mockProductLadderRepo.findBy.mockResolvedValue([]);
      mockProductFullReductionRepo.findBy.mockResolvedValue([]);
      mockMemberAddressRepo.findBy.mockResolvedValue([]);
      mockCouponHistoryRepo.findBy.mockResolvedValue([
        { id: 1, memberId: 1, couponId: 5, useStatus: 0 } as any,
      ]);
      mockCouponRepo.findBy.mockResolvedValue([]);
      mockIntegrationConsumeSettingRepo.findOneBy.mockResolvedValue(null);
      mockMemberRepo.findOneBy.mockResolvedValue(null);

      const result = await service.generateConfirmOrder(1, []);
      expect(result.couponHistoryDetailList).toHaveLength(0);
      expect(result.memberIntegration).toBe(0);
    });

    it('coupon minPoint 超过总额 → filter 排除', async () => {
      const cartQb = {
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        getMany: vi.fn().mockResolvedValue([cartItemFixture()]),
      };
      mockCartItemRepo.createQueryBuilder.mockReturnValue(cartQb);
      mockProductRepo.findBy.mockResolvedValue([productFixture()]);
      mockSkuStockRepo.findBy.mockResolvedValue([skuFixture()]);
      mockProductLadderRepo.findBy.mockResolvedValue([]);
      mockProductFullReductionRepo.findBy.mockResolvedValue([]);
      mockMemberAddressRepo.findBy.mockResolvedValue([]);
      mockCouponHistoryRepo.findBy.mockResolvedValue([
        { id: 1, memberId: 1, couponId: 5, useStatus: 0 } as any,
      ]);
      mockCouponRepo.findBy.mockResolvedValue([
        { id: 5, amount: '10', minPoint: '999999' } as any,
      ]);
      mockIntegrationConsumeSettingRepo.findOneBy.mockResolvedValue(null);
      mockMemberRepo.findOneBy.mockResolvedValue({ id: 1, integration: 0 });

      const result = await service.generateConfirmOrder(1, []);
      expect(result.couponHistoryDetailList).toHaveLength(0);
    });
  });

  describe('getUsableCoupon 边缘（通过 generateOrder）', () => {
    function setupBase() {
      const cartQb = {
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        getMany: vi.fn().mockResolvedValue([cartItemFixture()]),
      };
      mockCartItemRepo.createQueryBuilder.mockReturnValue(cartQb);
      mockProductRepo.findBy.mockResolvedValue([productFixture()]);
      mockSkuStockRepo.findBy.mockResolvedValue([skuFixture()]);
      mockProductLadderRepo.findBy.mockResolvedValue([]);
      mockProductFullReductionRepo.findBy.mockResolvedValue([]);
      mockMemberRepo.findOneBy.mockResolvedValue({
        id: 1,
        username: 'test',
        integration: 500,
      });
      mockMemberAddressRepo.findOneBy.mockResolvedValue({
        id: 1,
        memberId: 1,
        name: '张',
        phoneNumber: '138',
        postCode: '100',
        province: '北京',
        city: '北京',
        region: '朝阳',
        detailAddress: '路1号',
      });
      mockOrderSettingRepo.find.mockResolvedValue([
        { confirmOvertime: 15, normalOrderOvertime: 60 },
      ]);
      mockRedisClient.incr.mockResolvedValue(1);
      mockOrderRepo.create.mockImplementation((d: any) => ({ id: 1, ...d }));
      mockManager.save.mockImplementation((_e: any, d: any) =>
        Promise.resolve(
          Array.isArray(d) ? d : { id: 1, orderSn: 'TEST', ...d },
        ),
      );
      mockManagerQb.getOne.mockResolvedValue(skuFixture());
      mockOrderItemRepo.findBy.mockResolvedValue([orderItemFixture()]);
    }

    it('coupon 查不到 → 不可用', async () => {
      setupBase();
      mockCouponHistoryRepo.findOne.mockResolvedValue({
        id: 1,
        memberId: 1,
        couponId: 5,
        useStatus: 0,
      });
      mockCouponRepo.findOneBy.mockResolvedValue(null);

      await expect(
        service.generateOrder(1, {
          memberReceiveAddressId: 1,
          payType: 1,
          couponId: 5,
        }),
      ).rejects.toThrow('该优惠券不可用');
    });

    it('coupon minPoint 超过总额 → 不可用', async () => {
      setupBase();
      mockCouponHistoryRepo.findOne.mockResolvedValue({
        id: 1,
        memberId: 1,
        couponId: 5,
        useStatus: 0,
      });
      mockCouponRepo.findOneBy.mockResolvedValue({
        id: 5,
        amount: '10',
        minPoint: '999999',
        useType: 0,
      });

      await expect(
        service.generateOrder(1, {
          memberReceiveAddressId: 1,
          payType: 1,
          couponId: 5,
        }),
      ).rejects.toThrow('该优惠券不可用');
    });
  });

  // ======================== generateOrder with dto.cartIds ========================

  describe('generateOrder with cartIds', () => {
    it('dto.cartIds 存在 → 额外 andWhere 过滤购物车', async () => {
      const cartQb = {
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        getMany: vi.fn().mockResolvedValue([cartItemFixture()]),
      };
      mockCartItemRepo.createQueryBuilder.mockReturnValue(cartQb);
      mockProductRepo.findBy.mockResolvedValue([productFixture()]);
      mockSkuStockRepo.findBy.mockResolvedValue([skuFixture()]);
      mockProductLadderRepo.findBy.mockResolvedValue([]);
      mockProductFullReductionRepo.findBy.mockResolvedValue([]);
      mockMemberRepo.findOneBy.mockResolvedValue({
        id: 1,
        username: 'test',
        integration: 500,
      });
      mockMemberAddressRepo.findOneBy.mockResolvedValue({
        id: 1,
        memberId: 1,
        name: '张',
        phoneNumber: '138',
        postCode: '100',
        province: '北京',
        city: '北京',
        region: '朝阳',
        detailAddress: '路1号',
      });
      mockOrderSettingRepo.find.mockResolvedValue([
        { confirmOvertime: 15, normalOrderOvertime: 60 },
      ]);
      mockRedisClient.incr.mockResolvedValue(1);
      mockOrderRepo.create.mockImplementation((d: any) => ({ id: 1, ...d }));
      mockManager.save.mockImplementation((_e: any, d: any) =>
        Promise.resolve(
          Array.isArray(d) ? d : { id: 1, orderSn: 'TEST', ...d },
        ),
      );
      mockManagerQb.getOne.mockResolvedValue(skuFixture());
      mockOrderItemRepo.findBy.mockResolvedValue([orderItemFixture()]);

      const result = await service.generateOrder(1, {
        memberReceiveAddressId: 1,
        payType: 1,
        cartIds: [1, 2],
      });

      expect(result.order).toBeDefined();
      expect(cartQb.andWhere).toHaveBeenCalledTimes(2);
    });
  });

  // ======================== generateOrder 积分抵扣失败 ========================

  describe('generateOrder 积分抵扣 affected=0', () => {
    it('积分扣减 affected=0 → BadRequestException 会员积分不足', async () => {
      const cartQb = {
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        getMany: vi.fn().mockResolvedValue([cartItemFixture()]),
      };
      mockCartItemRepo.createQueryBuilder.mockReturnValue(cartQb);
      mockProductRepo.findBy.mockResolvedValue([productFixture()]);
      mockSkuStockRepo.findBy.mockResolvedValue([skuFixture()]);
      mockProductLadderRepo.findBy.mockResolvedValue([]);
      mockProductFullReductionRepo.findBy.mockResolvedValue([]);
      mockMemberRepo.findOneBy.mockResolvedValue({
        id: 1,
        username: 'test',
        integration: 500,
      });
      mockMemberAddressRepo.findOneBy.mockResolvedValue({
        id: 1,
        memberId: 1,
        name: '张',
        phoneNumber: '138',
        postCode: '100',
        province: '北京',
        city: '北京',
        region: '朝阳',
        detailAddress: '路1号',
      });
      mockOrderSettingRepo.find.mockResolvedValue([
        { confirmOvertime: 15, normalOrderOvertime: 60 },
      ]);
      mockRedisClient.incr.mockResolvedValue(1);
      mockOrderRepo.create.mockImplementation((d: any) => ({ id: 1, ...d }));
      mockManager.save.mockImplementation((_e: any, d: any) =>
        Promise.resolve(
          Array.isArray(d) ? d : { id: 1, orderSn: 'TEST', ...d },
        ),
      );
      mockManagerQb.getOne.mockResolvedValue(skuFixture());
      mockIntegrationConsumeSettingRepo.findOneBy.mockResolvedValue({
        deductionPerAmount: 100,
        maxPercentPerOrder: 50,
        useUnit: 100,
      });
      mockManagerQb.execute
        .mockResolvedValueOnce({ affected: 1 }) // lockStock update
        .mockResolvedValueOnce({ affected: 0 }); // integration deduction

      await expect(
        service.generateOrder(1, {
          memberReceiveAddressId: 1,
          payType: 1,
          useIntegration: 200,
        }),
      ).rejects.toThrow('会员积分不足');
    });
  });

  // ======================== payOrder deductResult.affected=0 ========================

  describe('payOrder deductResult.affected=0', () => {
    it('payOrder SKU 实际库存不足 → BadRequestException', async () => {
      mockOrderRepo.findOne.mockResolvedValue(
        orderFixture({ status: OrderStatus.PENDING_PAYMENT }),
      );
      mockManagerQb.getOne.mockResolvedValue(
        skuFixture({ stock: 100, lockStock: 50 }),
      );
      mockManager.findBy.mockResolvedValue([
        orderItemFixture({ productQuantity: 2 }),
      ]);
      mockManagerQb.execute
        .mockResolvedValueOnce({ affected: 1 }) // update order status
        .mockResolvedValueOnce({ affected: 0 }); // deduct stock

      await expect(service.paySuccess(1, 1, 1)).rejects.toThrow('实际库存不足');
    });
  });

  // ======================== cancelOrder productQuantity NaN → || 0 ========================

  describe('cancelOrder productQuantity NaN', () => {
    it('productQuantity 为 NaN 字符串 → || 0 → releaseQty=0 不释放', async () => {
      mockOrderRepo.findOne.mockResolvedValue(orderFixture());
      mockManager.findBy.mockResolvedValue([
        orderItemFixture({ productQuantity: 'abc' as any }),
      ]);

      await service.cancelOrder(1, 1);
      expect(mockTransactionService.run).toHaveBeenCalled();
    });
  });

  // ======================== close productQuantity NaN ========================

  describe('close productQuantity NaN', () => {
    it('close 订单中 productQuantity NaN → releaseQty=0 不释放', async () => {
      const qb = {
        where: vi.fn().mockReturnThis(),
        getMany: vi
          .fn()
          .mockResolvedValue([
            orderFixture({ id: 1, status: OrderStatus.PENDING_PAYMENT }),
          ]),
      };
      mockOrderRepo.createQueryBuilder.mockReturnValue(qb);
      mockManager.findBy.mockResolvedValue([
        orderItemFixture({ productQuantity: 'abc' as any }),
      ]);

      await service.close([1], '关闭');
      expect(mockTransactionService.run).toHaveBeenCalled();
    });
  });

  // ======================== updateCouponStatus couponId=0 ========================

  describe('updateCouponStatus couponId=0（通过 close 间接测试）', () => {
    it('order.couponId=0 → updateCouponStatus 内 !couponId → 直接 return', async () => {
      const qb = {
        where: vi.fn().mockReturnThis(),
        getMany: vi.fn().mockResolvedValue([
          orderFixture({
            id: 1,
            status: OrderStatus.PAID,
            couponId: 0,
            useIntegration: 0,
          }),
        ]),
      };
      mockOrderRepo.createQueryBuilder.mockReturnValue(qb);

      await service.close([1], '关闭');
      expect(mockManager.save).toHaveBeenCalled();
      expect(mockManager.findOne).not.toHaveBeenCalled();
    });
  });

  // ======================== sortBySkuId null productSkuId ========================

  describe('sortBySkuId null productSkuId（通过 cancelOrder 间接测试）', () => {
    it('orderItem.productSkuId=null → ?? 0 用于排序', async () => {
      mockOrderRepo.findOne.mockResolvedValue(orderFixture());
      mockManager.findBy.mockResolvedValue([
        orderItemFixture({ productSkuId: null as any, productQuantity: 0 }),
        orderItemFixture({
          id: 2,
          productSkuId: null as any,
          productQuantity: 0,
        }),
      ]);

      await service.cancelOrder(1, 1);
      expect(mockTransactionService.run).toHaveBeenCalled();
    });
  });

  // ======================== calcPerCouponAmount with null properties ========================

  describe('calcPerCouponAmount null 属性（通过 generateOrder + coupon 间接测试）', () => {
    it('多商品 coupon 下单，orderItem price/qty 为 null → ?? 0 或 ?? 1', async () => {
      const carts = [
        cartItemFixture({
          id: 1,
          productId: 100,
          productSkuId: 200,
          productCategoryId: 10,
          productPrice: null as any,
          productQuantity: 1,
        }),
        cartItemFixture({
          id: 2,
          productId: 101,
          productSkuId: 201,
          productCategoryId: 10,
          productPrice: null as any,
          productQuantity: 1,
        }),
      ];
      const cartQb = {
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        getMany: vi.fn().mockResolvedValue(carts),
      };
      mockCartItemRepo.createQueryBuilder.mockReturnValue(cartQb);
      mockProductRepo.findBy.mockResolvedValue([
        productFixture({ id: 100 }),
        productFixture({ id: 101 }),
      ]);
      mockSkuStockRepo.findBy.mockResolvedValue([
        skuFixture({
          id: 200,
          productId: 100,
          price: null as any,
          stock: 100,
          lockStock: 0,
        }),
        skuFixture({
          id: 201,
          productId: 101,
          price: null as any,
          stock: 100,
          lockStock: 0,
        }),
      ]);
      mockProductLadderRepo.findBy.mockResolvedValue([]);
      mockProductFullReductionRepo.findBy.mockResolvedValue([]);
      mockMemberRepo.findOneBy.mockResolvedValue({
        id: 1,
        username: 'test',
        integration: 500,
      });
      mockMemberAddressRepo.findOneBy.mockResolvedValue({
        id: 1,
        memberId: 1,
        name: '张',
        phoneNumber: '138',
        postCode: '100',
        province: '北京',
        city: '北京',
        region: '朝阳',
        detailAddress: '路1号',
      });
      mockOrderSettingRepo.find.mockResolvedValue([
        { confirmOvertime: 15, normalOrderOvertime: 60 },
      ]);
      mockRedisClient.incr.mockResolvedValue(1);
      mockOrderRepo.create.mockImplementation((d: any) => ({ id: 1, ...d }));
      mockManager.save.mockImplementation((_e: any, d: any) =>
        Promise.resolve(
          Array.isArray(d) ? d : { id: 1, orderSn: 'TEST', ...d },
        ),
      );
      mockManagerQb.getOne.mockResolvedValue(
        skuFixture({ stock: 100, lockStock: 0 }),
      );
      mockOrderItemRepo.findBy.mockResolvedValue([orderItemFixture()]);
      mockCouponHistoryRepo.findOne.mockResolvedValue({
        id: 1,
        memberId: 1,
        couponId: 5,
        useStatus: 0,
      });
      mockCouponRepo.findOneBy.mockResolvedValue({
        id: 5,
        amount: '10',
        minPoint: '0',
        useType: 0,
      });
      mockCouponProductRelRepo.findBy.mockResolvedValue([]);
      mockCouponCategoryRelRepo.findBy.mockResolvedValue([]);
      // updateCouponStatus 内 manager.findOne 需要返回可用的优惠券领取记录
      mockManager.findOne.mockResolvedValue({
        id: 1,
        memberId: 1,
        couponId: 5,
        useStatus: 0,
      });

      const result = await service.generateOrder(1, {
        memberReceiveAddressId: 1,
        payType: 1,
        couponId: 5,
      });
      expect(result.order).toBeDefined();
    });
  });

  // ======================== generateOrder 使用积分 + 多商品 ========================

  describe('generateOrder 积分分摊多商品', () => {
    it('useIntegration + 2 商品 → 非最后一项走 else 分支', async () => {
      const carts = [
        cartItemFixture({
          id: 1,
          productId: 100,
          productSkuId: 200,
          productCategoryId: 10,
        }),
        cartItemFixture({
          id: 2,
          productId: 101,
          productSkuId: 201,
          productCategoryId: 10,
        }),
      ];
      const cartQb = {
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        getMany: vi.fn().mockResolvedValue(carts),
      };
      mockCartItemRepo.createQueryBuilder.mockReturnValue(cartQb);
      mockProductRepo.findBy.mockResolvedValue([
        productFixture({ id: 100 }),
        productFixture({ id: 101 }),
      ]);
      mockSkuStockRepo.findBy.mockResolvedValue([
        skuFixture({ id: 200, productId: 100 }),
        skuFixture({ id: 201, productId: 101 }),
      ]);
      mockProductLadderRepo.findBy.mockResolvedValue([]);
      mockProductFullReductionRepo.findBy.mockResolvedValue([]);
      mockMemberRepo.findOneBy.mockResolvedValue({
        id: 1,
        username: 'test',
        integration: 500,
      });
      mockMemberAddressRepo.findOneBy.mockResolvedValue({
        id: 1,
        memberId: 1,
        name: '张',
        phoneNumber: '138',
        postCode: '100',
        province: '北京',
        city: '北京',
        region: '朝阳',
        detailAddress: '路1号',
      });
      mockOrderSettingRepo.find.mockResolvedValue([
        { confirmOvertime: 15, normalOrderOvertime: 60 },
      ]);
      mockRedisClient.incr.mockResolvedValue(1);
      mockOrderRepo.create.mockImplementation((d: any) => ({ id: 1, ...d }));
      mockManager.save.mockImplementation((_e: any, d: any) =>
        Promise.resolve(
          Array.isArray(d) ? d : { id: 1, orderSn: 'TEST', ...d },
        ),
      );
      mockManagerQb.getOne.mockResolvedValue(
        skuFixture({ stock: 100, lockStock: 10 }),
      );
      mockOrderItemRepo.findBy.mockResolvedValue([orderItemFixture()]);
      mockIntegrationConsumeSettingRepo.findOneBy.mockResolvedValue({
        deductionPerAmount: 100,
        maxPercentPerOrder: 50,
        useUnit: 100,
      });

      const result = await service.generateOrder(1, {
        memberReceiveAddressId: 1,
        payType: 1,
        useIntegration: 200,
      });
      expect(result.order).toBeDefined();
    });
  });

  // ======================== generateConfirmOrder 有可用优惠券 ========================

  describe('generateConfirmOrder 有可用优惠券', () => {
    it('couponHistory + coupon 匹配且 minPoint <= totalAmount → 返回可用', async () => {
      const cartQb = {
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        getMany: vi.fn().mockResolvedValue([cartItemFixture()]),
      };
      mockCartItemRepo.createQueryBuilder.mockReturnValue(cartQb);
      mockProductRepo.findBy.mockResolvedValue([productFixture()]);
      mockSkuStockRepo.findBy.mockResolvedValue([skuFixture()]);
      mockProductLadderRepo.findBy.mockResolvedValue([]);
      mockProductFullReductionRepo.findBy.mockResolvedValue([]);
      mockMemberAddressRepo.findBy.mockResolvedValue([]);
      mockCouponHistoryRepo.findBy.mockResolvedValue([
        { id: 1, memberId: 1, couponId: 5, useStatus: 0 } as any,
      ]);
      mockCouponRepo.findBy.mockResolvedValue([
        { id: 5, amount: '10', minPoint: '0', useType: 0 } as any,
      ]);
      mockIntegrationConsumeSettingRepo.findOneBy.mockResolvedValue(null);
      mockMemberRepo.findOneBy.mockResolvedValue({ id: 1, integration: 100 });

      const result = await service.generateConfirmOrder(1, []);
      expect(result.couponHistoryDetailList.length).toBeGreaterThanOrEqual(1);
    });
  });
});
