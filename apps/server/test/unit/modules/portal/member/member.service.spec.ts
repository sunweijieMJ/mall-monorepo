import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MemberService } from '@/modules/portal/member/member.service';
import {
  MemberEntity,
  MemberAddressEntity,
} from '@/modules/portal/member/infrastructure/persistence/relational/entities/member.entity';
import { CouponEntity } from '@/modules/sms/coupon/infrastructure/persistence/relational/entities/coupon.entity';
import { CouponHistoryEntity } from '@/modules/sms/coupon/infrastructure/persistence/relational/entities/coupon-history.entity';
import { CouponProductRelationEntity } from '@/modules/sms/coupon/infrastructure/persistence/relational/entities/coupon-product-relation.entity';
import { CouponProductCategoryRelationEntity } from '@/modules/sms/coupon/infrastructure/persistence/relational/entities/coupon-product-category-relation.entity';
import { ProductEntity } from '@/modules/pms/product/infrastructure/persistence/relational/entities/product.entity';
import { CartItemEntity } from '@/modules/portal/cart/infrastructure/persistence/relational/entities/cart-item.entity';
import { TransactionService } from '@/infrastructure/database/transaction/transaction.service';
import { createMockRepository } from '../../../../helpers/mock.factory';

// ======================== Fixtures ========================

const memberFixture = (overrides = {}) =>
  ({
    id: 1,
    username: 'testuser',
    password: 'hashedpass',
    nickname: '测试',
    integration: 1000,
    ...overrides,
  }) as unknown as MemberEntity;

const addressFixture = (overrides = {}) =>
  ({
    id: 1,
    memberId: 1,
    name: '张三',
    phoneNumber: '13800138000',
    defaultStatus: 0,
    ...overrides,
  }) as unknown as MemberAddressEntity;

const couponFixture = (overrides = {}) =>
  ({
    id: 1,
    name: '满100减10',
    count: 10,
    perLimit: 1,
    enableTime: null,
    endTime: null,
    startTime: null,
    useType: 0,
    minPoint: '100',
    ...overrides,
  }) as unknown as CouponEntity;

// ======================== Tests ========================

describe('MemberService', () => {
  let service: MemberService;
  const mockMemberRepo = createMockRepository();
  const mockAddressRepo = createMockRepository();
  const mockCouponRepo = createMockRepository();
  const mockCouponHistoryRepo = createMockRepository();
  const mockProductRepo = createMockRepository();
  const mockCouponProductRelRepo = createMockRepository();
  const mockCouponCategoryRelRepo = createMockRepository();
  const mockCartItemRepo = createMockRepository();

  // 事务 mock
  const mockManagerQb = {
    setLock: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    getOne: vi.fn().mockResolvedValue(null),
  };
  const mockManager = {
    createQueryBuilder: vi.fn().mockReturnValue(mockManagerQb),
    count: vi.fn().mockResolvedValue(0),
    decrement: vi.fn().mockResolvedValue({}),
    increment: vi.fn().mockResolvedValue({}),
    create: vi.fn().mockImplementation((_e: any, d: any) => d),
    save: vi.fn().mockResolvedValue({}),
  };
  const mockTransactionService = {
    run: vi.fn().mockImplementation(async (cb: any) => cb(mockManager)),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    mockManagerQb.setLock.mockReturnThis();
    mockManagerQb.where.mockReturnThis();
    mockManager.createQueryBuilder.mockReturnValue(mockManagerQb);
    mockTransactionService.run.mockImplementation(async (cb: any) =>
      cb(mockManager),
    );

    const module = await Test.createTestingModule({
      providers: [
        MemberService,
        { provide: getRepositoryToken(MemberEntity), useValue: mockMemberRepo },
        {
          provide: getRepositoryToken(MemberAddressEntity),
          useValue: mockAddressRepo,
        },
        { provide: getRepositoryToken(CouponEntity), useValue: mockCouponRepo },
        {
          provide: getRepositoryToken(CouponHistoryEntity),
          useValue: mockCouponHistoryRepo,
        },
        {
          provide: getRepositoryToken(ProductEntity),
          useValue: mockProductRepo,
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
          provide: getRepositoryToken(CartItemEntity),
          useValue: mockCartItemRepo,
        },
        { provide: TransactionService, useValue: mockTransactionService },
      ],
    }).compile();
    service = module.get(MemberService);
  });

  // ======================== getCurrentMember ========================

  describe('getCurrentMember', () => {
    it('存在 → 返回不含 password 的会员信息', async () => {
      mockMemberRepo.findOne.mockResolvedValue(memberFixture());

      const result = await service.getCurrentMember(1);

      expect(result).not.toHaveProperty('password');
      expect(result?.username).toBe('testuser');
    });

    it('不存在 → 返回 null', async () => {
      mockMemberRepo.findOne.mockResolvedValue(null);

      const result = await service.getCurrentMember(999);
      expect(result).toBeNull();
    });
  });

  // ======================== updateInfo ========================

  describe('updateInfo', () => {
    it('白名单字段 → 正常更新', async () => {
      mockMemberRepo.update.mockResolvedValue({});

      await service.updateInfo(1, { nickname: '新昵称', gender: 1 });

      expect(mockMemberRepo.update).toHaveBeenCalledWith(
        { id: 1 },
        expect.objectContaining({ nickname: '新昵称', gender: 1 }),
      );
    });

    it('非白名单字段 → 被过滤掉', async () => {
      mockMemberRepo.update.mockResolvedValue({});

      await service.updateInfo(1, { password: 'hacked', nickname: '安全' });

      const updateArg = mockMemberRepo.update.mock.calls[0][1];
      expect(updateArg).not.toHaveProperty('password');
      expect(updateArg.nickname).toBe('安全');
    });

    it('空更新 → 不调用 update', async () => {
      await service.updateInfo(1, { nonExistField: 'value' });

      expect(mockMemberRepo.update).not.toHaveBeenCalled();
    });
  });

  // ======================== 收货地址 ========================

  describe('getAddress', () => {
    it('存在 → 返回地址', async () => {
      mockAddressRepo.findOne.mockResolvedValue(addressFixture());

      const result = await service.getAddress(1, 1);
      expect(result.name).toBe('张三');
    });

    it('不存在或非本人 → 404', async () => {
      mockAddressRepo.findOne.mockResolvedValue(null);

      await expect(service.getAddress(999, 1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('addAddress', () => {
    it('设置默认地址 → 先清除其他默认', async () => {
      mockAddressRepo.update.mockResolvedValue({});
      mockAddressRepo.save.mockResolvedValue({});

      await service.addAddress(1, { name: '新地址', defaultStatus: 1 });

      // 应先调用 update 清除默认
      expect(mockAddressRepo.update).toHaveBeenCalledWith(
        { memberId: 1 },
        { defaultStatus: 0 },
      );
    });
  });

  describe('deleteAddress', () => {
    it('删除地址', async () => {
      mockAddressRepo.delete.mockResolvedValue({});

      await service.deleteAddress(1, 1);

      expect(mockAddressRepo.delete).toHaveBeenCalledWith({
        id: 1,
        memberId: 1,
      });
    });
  });

  // ======================== listAddress ========================

  describe('listAddress', () => {
    it('正常返回地址列表', async () => {
      const addresses = [
        addressFixture(),
        addressFixture({ id: 2, name: '李四' }),
      ];
      mockAddressRepo.find.mockResolvedValue(addresses);

      const result = await service.listAddress(1);

      expect(result).toHaveLength(2);
      expect(mockAddressRepo.find).toHaveBeenCalledWith({
        where: { memberId: 1 },
      });
    });
  });

  // ======================== updateAddress ========================

  describe('updateAddress', () => {
    // updateAddress 中设置默认地址时使用 createQueryBuilder 链式调用
    const addressQb = mockAddressRepo.createQueryBuilder();
    // 添加 update / set 方法（原始 mock 中没有）
    addressQb.update = vi.fn().mockReturnValue(addressQb);
    addressQb.set = vi.fn().mockReturnValue(addressQb);
    mockAddressRepo.createQueryBuilder.mockReturnValue(addressQb);

    it('正常更新（非默认地址）', async () => {
      mockAddressRepo.findOne.mockResolvedValue(addressFixture());
      mockAddressRepo.update.mockResolvedValue({});

      await service.updateAddress(1, 1, { name: '新名字' });

      expect(mockAddressRepo.update).toHaveBeenCalledWith(
        { id: 1, memberId: 1 },
        { name: '新名字' },
      );
    });

    it('设置默认地址 → 清除其他默认地址', async () => {
      mockAddressRepo.findOne.mockResolvedValue(addressFixture());
      addressQb.execute.mockResolvedValue({});
      mockAddressRepo.update.mockResolvedValue({});

      await service.updateAddress(1, 1, { defaultStatus: 1 });

      // 应调用 createQueryBuilder 链式清除其他默认地址
      expect(addressQb.update).toHaveBeenCalled();
      expect(addressQb.set).toHaveBeenCalledWith({ defaultStatus: 0 });
      expect(addressQb.execute).toHaveBeenCalled();
    });

    it('地址不存在 → NotFoundException', async () => {
      mockAddressRepo.findOne.mockResolvedValue(null);

      await expect(
        service.updateAddress(999, 1, { name: '新名字' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ======================== addCoupon ========================

  describe('addCoupon', () => {
    it('优惠券不存在 → 404', async () => {
      mockCouponRepo.findOne.mockResolvedValue(null);

      await expect(service.addCoupon(1, 999)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('库存为 0 → 400', async () => {
      mockCouponRepo.findOne.mockResolvedValue(couponFixture({ count: 0 }));

      await expect(service.addCoupon(1, 1)).rejects.toThrow('已经领完了');
    });

    it('超出每人限领数 → 400', async () => {
      mockCouponRepo.findOne.mockResolvedValue(couponFixture({ perLimit: 1 }));
      mockCouponHistoryRepo.count.mockResolvedValue(1); // 已领 1 张

      await expect(service.addCoupon(1, 1)).rejects.toThrow('超出领取限制');
    });

    it('正常领取 → 扣减库存 + 插入领取记录', async () => {
      mockCouponRepo.findOne.mockResolvedValue(couponFixture({ perLimit: 0 }));
      mockCouponHistoryRepo.count.mockResolvedValue(0);
      // 事务内：锁定查询返回优惠券
      mockManagerQb.getOne.mockResolvedValue(couponFixture({ perLimit: 0 }));

      await service.addCoupon(1, 1);

      expect(mockManager.decrement).toHaveBeenCalled();
      expect(mockManager.increment).toHaveBeenCalled();
      expect(mockManager.save).toHaveBeenCalled();
    });
  });

  // ======================== listMemberCoupons ========================

  describe('listMemberCoupons', () => {
    // 固定 couponHistoryRepo 的 QB mock 引用
    const historyQb = mockCouponHistoryRepo.createQueryBuilder();
    mockCouponHistoryRepo.createQueryBuilder.mockReturnValue(historyQb);

    it('无过滤 → 返回所有记录', async () => {
      const histories = [{ id: 1, memberId: 1, couponId: 1, useStatus: 0 }];
      historyQb.getMany.mockResolvedValue(histories);

      const result = await service.listMemberCoupons(1);

      expect(result).toEqual(histories);
      expect(historyQb.where).toHaveBeenCalledWith('ch.member_id = :memberId', {
        memberId: 1,
      });
      // 不应调用 andWhere（没有 useStatus 过滤）
      expect(historyQb.andWhere).not.toHaveBeenCalled();
    });

    it('有 useStatus 过滤 → 验证 andWhere', async () => {
      historyQb.getMany.mockResolvedValue([]);

      await service.listMemberCoupons(1, 0);

      expect(historyQb.andWhere).toHaveBeenCalledWith(
        'ch.use_status = :useStatus',
        { useStatus: 0 },
      );
    });
  });

  // ======================== listCouponsByProduct ========================

  describe('listCouponsByProduct', () => {
    // 固定 couponRepo 的 QB mock 引用
    const couponQb = mockCouponRepo.createQueryBuilder();
    mockCouponRepo.createQueryBuilder.mockReturnValue(couponQb);

    it('正常返回（有商品关联 + 分类关联优惠券）', async () => {
      const product = { id: 1, productCategoryId: 10 };
      mockProductRepo.findOne.mockResolvedValue(product);
      mockCouponProductRelRepo.find.mockResolvedValue([
        { couponId: 1, productId: 1 },
      ]);
      mockCouponCategoryRelRepo.find.mockResolvedValue([
        { couponId: 2, productCategoryId: 10 },
      ]);
      const coupons = [couponFixture({ id: 1 }), couponFixture({ id: 2 })];
      couponQb.getMany.mockResolvedValue(coupons);

      const result = await service.listCouponsByProduct(1, 1);

      expect(result).toEqual(coupons);
      // 有关联 ID 时应使用 OR 条件
      expect(couponQb.andWhere).toHaveBeenCalledWith(
        '(c.use_type = 0 OR c.id IN (:...relatedIds))',
        { relatedIds: [1, 2] },
      );
    });

    it('商品不存在 → NotFoundException', async () => {
      mockProductRepo.findOne.mockResolvedValue(null);

      await expect(service.listCouponsByProduct(1, 999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ======================== listCouponObjects ========================

  describe('listCouponObjects', () => {
    // 复用 historyQb（listMemberCoupons 中已固定引用）
    const historyQb2 = mockCouponHistoryRepo.createQueryBuilder();
    mockCouponHistoryRepo.createQueryBuilder.mockReturnValue(historyQb2);

    it('正常返回优惠券对象', async () => {
      historyQb2.getMany.mockResolvedValue([
        { id: 1, memberId: 1, couponId: 1 },
        { id: 2, memberId: 1, couponId: 2 },
      ]);
      const coupons = [couponFixture({ id: 1 }), couponFixture({ id: 2 })];
      mockCouponRepo.findBy.mockResolvedValue(coupons);

      const result = await service.listCouponObjects(1);

      expect(result).toEqual(coupons);
      expect(mockCouponRepo.findBy).toHaveBeenCalled();
    });

    it('无领取记录 → 返回空数组', async () => {
      historyQb2.getMany.mockResolvedValue([]);

      const result = await service.listCouponObjects(1);

      expect(result).toEqual([]);
      expect(mockCouponRepo.findBy).not.toHaveBeenCalled();
    });
  });

  // ======================== listCartCoupons ========================

  describe('listCartCoupons', () => {
    // 购物车商品 fixture
    const cartItem = (overrides = {}) => ({
      id: 1,
      memberId: 1,
      productId: 100,
      productCategoryId: 10,
      productPrice: '50',
      productQuantity: 3,
      deleteStatus: 1,
      ...overrides,
    });

    it('全场通用优惠券匹配', async () => {
      mockCartItemRepo.find.mockResolvedValue([cartItem()]);
      // 购物车金额 = 50 * 3 = 150，满100减10 应匹配
      mockCouponHistoryRepo.find.mockResolvedValue([
        { id: 1, memberId: 1, couponId: 1, useStatus: 0 },
      ]);
      const coupon = couponFixture({ useType: 0, minPoint: '100' });
      mockCouponRepo.findBy.mockResolvedValue([coupon]);
      mockCouponProductRelRepo.find.mockResolvedValue([]);
      mockCouponCategoryRelRepo.find.mockResolvedValue([]);

      const result = await service.listCartCoupons(1, [1]);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
    });

    it('指定分类优惠券匹配', async () => {
      mockCartItemRepo.find.mockResolvedValue([
        cartItem({ productCategoryId: 10 }),
      ]);
      mockCouponHistoryRepo.find.mockResolvedValue([
        { id: 1, memberId: 1, couponId: 2, useStatus: 0 },
      ]);
      const coupon = couponFixture({ id: 2, useType: 1, minPoint: '100' });
      mockCouponRepo.findBy.mockResolvedValue([coupon]);
      mockCouponProductRelRepo.find.mockResolvedValue([]);
      mockCouponCategoryRelRepo.find.mockResolvedValue([
        { couponId: 2, productCategoryId: 10 },
      ]);

      const result = await service.listCartCoupons(1, [1]);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(2);
    });

    it('指定商品优惠券匹配', async () => {
      mockCartItemRepo.find.mockResolvedValue([cartItem({ productId: 100 })]);
      mockCouponHistoryRepo.find.mockResolvedValue([
        { id: 1, memberId: 1, couponId: 3, useStatus: 0 },
      ]);
      const coupon = couponFixture({ id: 3, useType: 2, minPoint: '100' });
      mockCouponRepo.findBy.mockResolvedValue([coupon]);
      mockCouponProductRelRepo.find.mockResolvedValue([
        { couponId: 3, productId: 100 },
      ]);
      mockCouponCategoryRelRepo.find.mockResolvedValue([]);

      const result = await service.listCartCoupons(1, [1]);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(3);
    });

    it('购物车为空 → 返回空数组', async () => {
      mockCartItemRepo.find.mockResolvedValue([]);

      const result = await service.listCartCoupons(1, [1]);

      expect(result).toEqual([]);
    });

    it('门槛不满足 → 过滤掉', async () => {
      // 购物车金额 = 50 * 1 = 50，但门槛 100，应被过滤
      mockCartItemRepo.find.mockResolvedValue([
        cartItem({ productQuantity: 1 }),
      ]);
      mockCouponHistoryRepo.find.mockResolvedValue([
        { id: 1, memberId: 1, couponId: 1, useStatus: 0 },
      ]);
      const coupon = couponFixture({ useType: 0, minPoint: '100' });
      mockCouponRepo.findBy.mockResolvedValue([coupon]);
      mockCouponProductRelRepo.find.mockResolvedValue([]);
      mockCouponCategoryRelRepo.find.mockResolvedValue([]);

      const result = await service.listCartCoupons(1, [1]);

      expect(result).toHaveLength(0);
    });
  });

  // ======================== listAvailableCoupons ========================

  describe('listAvailableCoupons', () => {
    // 固定 couponRepo 的 QB mock 引用
    const availQb = mockCouponRepo.createQueryBuilder();
    mockCouponRepo.createQueryBuilder.mockReturnValue(availQb);

    it('正常返回分页结果', async () => {
      const coupons = [couponFixture({ id: 1 }), couponFixture({ id: 2 })];
      availQb.getCount.mockResolvedValue(2);
      availQb.getMany.mockResolvedValue(coupons);

      const result = await service.listAvailableCoupons(1, 10);

      expect(result.total).toBe(2);
      expect(result.list).toEqual(coupons);
      expect(availQb.skip).toHaveBeenCalledWith(0);
      expect(availQb.take).toHaveBeenCalledWith(10);
    });
  });

  // ======================== addCoupon 边缘路径 ========================

  describe('addCoupon 边缘路径', () => {
    it('enableTime 未到 → BadRequestException', async () => {
      const futureTime = new Date(Date.now() + 86400000); // 明天
      mockCouponRepo.findOne.mockResolvedValue(
        couponFixture({ enableTime: futureTime }),
      );

      await expect(service.addCoupon(1, 1)).rejects.toThrow('还没到领取时间');
    });

    it('endTime 已过 → BadRequestException', async () => {
      const pastTime = new Date(Date.now() - 86400000); // 昨天
      mockCouponRepo.findOne.mockResolvedValue(
        couponFixture({ endTime: pastTime }),
      );

      await expect(service.addCoupon(1, 1)).rejects.toThrow('已过期');
    });

    it('事务内锁定后库存为 0 → BadRequestException', async () => {
      mockCouponRepo.findOne.mockResolvedValue(couponFixture({ perLimit: 0 }));
      mockCouponHistoryRepo.count.mockResolvedValue(0);
      // 事务内锁定查询返回库存为 0
      mockManagerQb.getOne.mockResolvedValue(couponFixture({ count: 0 }));

      await expect(service.addCoupon(1, 1)).rejects.toThrow('已经领完了');
    });

    it('事务内锁定后超出限领数 → BadRequestException', async () => {
      mockCouponRepo.findOne.mockResolvedValue(couponFixture({ perLimit: 2 }));
      mockCouponHistoryRepo.count.mockResolvedValue(0); // 事务外检查通过
      // 事务内锁定查询返回
      mockManagerQb.getOne.mockResolvedValue(couponFixture({ perLimit: 2 }));
      // 事务内 count 返回已领 2 张
      mockManager.count.mockResolvedValue(2);

      await expect(service.addCoupon(1, 1)).rejects.toThrow('超出领取限制');
    });
  });

  // ======================== listCouponsByProduct 边缘路径 ========================

  describe('listCouponsByProduct 边缘路径', () => {
    it('无关联优惠券 → 仅返回全场通用券', async () => {
      const product = { id: 1, productCategoryId: 10 };
      mockProductRepo.findOne.mockResolvedValue(product);
      mockCouponProductRelRepo.find.mockResolvedValue([]);
      mockCouponCategoryRelRepo.find.mockResolvedValue([]);

      const couponQb = mockCouponRepo.createQueryBuilder();
      mockCouponRepo.createQueryBuilder.mockReturnValue(couponQb);
      couponQb.getMany.mockResolvedValue([]);

      const result = await service.listCouponsByProduct(1, 1);

      expect(result).toEqual([]);
      // 无关联时应仅使用 use_type = 0 条件
      expect(couponQb.andWhere).toHaveBeenCalledWith('c.use_type = 0');
    });

    it('混合 useType 过滤 → 返回合并结果', async () => {
      const product = { id: 1, productCategoryId: 10 };
      mockProductRepo.findOne.mockResolvedValue(product);
      // 商品关联 couponId=5，分类关联 couponId=5（重复）+ couponId=8
      mockCouponProductRelRepo.find.mockResolvedValue([
        { couponId: 5, productId: 1 },
      ]);
      mockCouponCategoryRelRepo.find.mockResolvedValue([
        { couponId: 5, productCategoryId: 10 },
        { couponId: 8, productCategoryId: 10 },
      ]);

      const couponQb = mockCouponRepo.createQueryBuilder();
      mockCouponRepo.createQueryBuilder.mockReturnValue(couponQb);
      couponQb.getMany.mockResolvedValue([
        couponFixture({ id: 5 }),
        couponFixture({ id: 8 }),
      ]);

      const result = await service.listCouponsByProduct(1, 1);

      expect(result).toHaveLength(2);
      // 去重后应包含 5 和 8
      expect(couponQb.andWhere).toHaveBeenCalledWith(
        '(c.use_type = 0 OR c.id IN (:...relatedIds))',
        { relatedIds: [5, 8] },
      );
    });
  });
});
