import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CouponService } from '@/modules/sms/coupon/coupon.service';
import { CouponEntity } from '@/modules/sms/coupon/infrastructure/persistence/relational/entities/coupon.entity';
import { CouponHistoryEntity } from '@/modules/sms/coupon/infrastructure/persistence/relational/entities/coupon-history.entity';
import { CouponProductRelationEntity } from '@/modules/sms/coupon/infrastructure/persistence/relational/entities/coupon-product-relation.entity';
import { CouponProductCategoryRelationEntity } from '@/modules/sms/coupon/infrastructure/persistence/relational/entities/coupon-product-category-relation.entity';
import { TransactionService } from '@/infrastructure/database/transaction/transaction.service';
import { createMockRepository } from '../../../../helpers/mock.factory';

const couponFixture = (overrides = {}) =>
  ({
    id: 1,
    name: '满100减10',
    type: 0,
    useType: 0,
    amount: '10.00',
    minPoint: '100.00',
    publishCount: 100,
    count: 100,
    useCount: 0,
    receiveCount: 0,
    ...overrides,
  }) as unknown as CouponEntity;

describe('CouponService', () => {
  let service: CouponService;
  const mockRepo = createMockRepository();
  const mockHistoryRepo = createMockRepository();
  const mockProductRelRepo = createMockRepository();
  const mockCategoryRelRepo = createMockRepository();

  const mockManager = {
    save: vi
      .fn()
      .mockImplementation((_e: any, d: any) =>
        Promise.resolve({ ...d, id: 1 }),
      ),
    insert: vi.fn().mockResolvedValue({}),
    update: vi.fn().mockResolvedValue({}),
    delete: vi.fn().mockResolvedValue({}),
    softDelete: vi.fn().mockResolvedValue({ affected: 1 }),
  };
  const mockTransactionService = {
    run: vi.fn().mockImplementation(async (cb: any) => cb(mockManager)),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    mockManager.save.mockImplementation((_e: any, d: any) =>
      Promise.resolve({ ...d, id: 1 }),
    );
    mockTransactionService.run.mockImplementation(async (cb: any) =>
      cb(mockManager),
    );

    const module = await Test.createTestingModule({
      providers: [
        CouponService,
        { provide: getRepositoryToken(CouponEntity), useValue: mockRepo },
        {
          provide: getRepositoryToken(CouponHistoryEntity),
          useValue: mockHistoryRepo,
        },
        {
          provide: getRepositoryToken(CouponProductRelationEntity),
          useValue: mockProductRelRepo,
        },
        {
          provide: getRepositoryToken(CouponProductCategoryRelationEntity),
          useValue: mockCategoryRelRepo,
        },
        { provide: TransactionService, useValue: mockTransactionService },
      ],
    }).compile();
    service = module.get(CouponService);
  });

  // ======================== detail ========================

  describe('detail', () => {
    it('存在 → 返回含关联关系', async () => {
      mockRepo.findOneBy.mockResolvedValue(couponFixture());
      mockProductRelRepo.findBy.mockResolvedValue([{ id: 1, productId: 100 }]);
      mockCategoryRelRepo.findBy.mockResolvedValue([]);

      const result = await service.detail(1);

      expect(result.name).toBe('满100减10');
      expect(result.productRelationList).toHaveLength(1);
    });

    it('不存在 → 返回 null', async () => {
      mockRepo.findOneBy.mockResolvedValue(null);

      const result = await service.detail(999);
      expect(result).toBeNull();
    });
  });

  // ======================== create ========================

  describe('create', () => {
    it('useType=0（全场通用）→ 不插入关联表', async () => {
      const dto = {
        name: '新优惠券',
        useType: 0,
        amount: 10,
        minPoint: 100,
        publishCount: 50,
      } as any;

      const result = await service.create(dto);

      expect(result.id).toBe(1);
      expect(mockManager.insert).not.toHaveBeenCalled();
    });

    it('useType=2（指定商品）→ 插入商品关联表', async () => {
      const dto = {
        name: '指定商品券',
        useType: 2,
        amount: 20,
        publishCount: 100,
        productRelationList: [{ productId: 100 }, { productId: 200 }],
      } as any;

      await service.create(dto);

      expect(mockManager.insert).toHaveBeenCalledWith(
        CouponProductRelationEntity,
        expect.arrayContaining([
          expect.objectContaining({
            productId: 100,
            couponId: expect.any(Number),
          }),
        ]),
      );
    });

    it('useType=1（指定分类）→ 插入分类关联表', async () => {
      const dto = {
        name: '指定分类券',
        useType: 1,
        amount: 15,
        publishCount: 50,
        productCategoryRelationList: [{ productCategoryId: 10 }],
      } as any;

      await service.create(dto);

      expect(mockManager.insert).toHaveBeenCalledWith(
        CouponProductCategoryRelationEntity,
        expect.arrayContaining([
          expect.objectContaining({
            productCategoryId: 10,
            couponId: expect.any(Number),
          }),
        ]),
      );
    });
  });

  // ======================== update ========================

  describe('update', () => {
    it('更新 → 先删后插关联关系', async () => {
      const dto = {
        name: '更新券',
        useType: 2,
        productRelationList: [{ productId: 300 }],
      } as any;

      await service.update(1, dto);

      // 应先删除两张关联表
      expect(mockManager.delete).toHaveBeenCalledWith(
        CouponProductRelationEntity,
        { couponId: 1 },
      );
      expect(mockManager.delete).toHaveBeenCalledWith(
        CouponProductCategoryRelationEntity,
        { couponId: 1 },
      );
      // 再插入新关联
      expect(mockManager.insert).toHaveBeenCalledWith(
        CouponProductRelationEntity,
        expect.arrayContaining([expect.objectContaining({ productId: 300 })]),
      );
    });
  });

  // ======================== delete ========================

  describe('delete', () => {
    it('删除优惠券 + 关联关系', async () => {
      await service.delete(1);

      expect(mockManager.softDelete).toHaveBeenCalledWith(CouponEntity, 1);
      expect(mockManager.delete).toHaveBeenCalledWith(
        CouponProductRelationEntity,
        { couponId: 1 },
      );
      expect(mockManager.delete).toHaveBeenCalledWith(
        CouponProductCategoryRelationEntity,
        { couponId: 1 },
      );
    });

    it('affected null → 返回 0', async () => {
      mockManager.softDelete.mockResolvedValue({ affected: null });
      const result = await service.delete(1);
      expect(result).toBe(0);
    });

    it('affected undefined → 返回 0', async () => {
      mockManager.softDelete.mockResolvedValue({});
      const result = await service.delete(1);
      expect(result).toBe(0);
    });
  });

  // ======================== list ========================

  describe('list', () => {
    it('无过滤条件 → 返回分页结果', async () => {
      const qb = mockRepo.createQueryBuilder();
      mockRepo.createQueryBuilder.mockReturnValue(qb);
      qb.getManyAndCount.mockResolvedValue([[couponFixture()], 1]);

      const result = await service.list({ page: 1, limit: 10 } as any);

      expect(result.list).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('有关键词过滤 → 使用 LIKE 查询', async () => {
      const qb = mockRepo.createQueryBuilder();
      mockRepo.createQueryBuilder.mockReturnValue(qb);
      qb.getManyAndCount.mockResolvedValue([[], 0]);

      await service.list({ page: 1, limit: 10, keyword: '满减' } as any);

      expect(qb.andWhere).toHaveBeenCalledWith('c.name LIKE :keyword', {
        keyword: '%满减%',
      });
    });
  });

  // ======================== listHistory ========================

  describe('listHistory', () => {
    it('无过滤条件 → 返回分页结果', async () => {
      const qb = mockHistoryRepo.createQueryBuilder();
      mockHistoryRepo.createQueryBuilder.mockReturnValue(qb);
      qb.getManyAndCount.mockResolvedValue([[], 0]);

      const result = await service.listHistory({ page: 1, limit: 10 } as any);

      expect(result.list).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('有 useStatus 过滤 → 使用条件查询', async () => {
      const qb = mockHistoryRepo.createQueryBuilder();
      mockHistoryRepo.createQueryBuilder.mockReturnValue(qb);
      qb.getManyAndCount.mockResolvedValue([[], 0]);

      await service.listHistory({ page: 1, limit: 10, useStatus: 1 } as any);

      expect(qb.andWhere).toHaveBeenCalledWith('h.useStatus = :useStatus', {
        useStatus: 1,
      });
    });

    it('有 couponId 过滤 → 使用精确匹配', async () => {
      const qb = mockHistoryRepo.createQueryBuilder();
      mockHistoryRepo.createQueryBuilder.mockReturnValue(qb);
      qb.getManyAndCount.mockResolvedValue([[], 0]);

      await service.listHistory({ page: 1, limit: 10, couponId: 5 } as any);

      expect(qb.andWhere).toHaveBeenCalledWith('h.couponId = :couponId', {
        couponId: 5,
      });
    });

    it('有 orderSn 过滤 → 使用 LIKE 查询', async () => {
      const qb = mockHistoryRepo.createQueryBuilder();
      mockHistoryRepo.createQueryBuilder.mockReturnValue(qb);
      qb.getManyAndCount.mockResolvedValue([[], 0]);

      await service.listHistory({
        page: 1,
        limit: 10,
        orderSn: 'ORDER001',
      } as any);

      expect(qb.andWhere).toHaveBeenCalledWith('h.orderSn LIKE :orderSn', {
        orderSn: '%ORDER001%',
      });
    });
  });

  // ======================== update 补充 ========================

  describe('update 补充', () => {
    it('useType 变更为 1（分类）→ 清理旧关联 + 插入分类关联', async () => {
      const dto = {
        name: '变更为分类券',
        useType: 1,
        productCategoryRelationList: [{ productCategoryId: 20 }],
      } as any;

      await service.update(1, dto);

      // 应先删除两张关联表
      expect(mockManager.delete).toHaveBeenCalledWith(
        CouponProductRelationEntity,
        { couponId: 1 },
      );
      expect(mockManager.delete).toHaveBeenCalledWith(
        CouponProductCategoryRelationEntity,
        { couponId: 1 },
      );
      // 插入分类关联
      expect(mockManager.insert).toHaveBeenCalledWith(
        CouponProductCategoryRelationEntity,
        expect.arrayContaining([
          expect.objectContaining({ productCategoryId: 20, couponId: 1 }),
        ]),
      );
      // 不应插入商品关联
      expect(mockManager.insert).not.toHaveBeenCalledWith(
        CouponProductRelationEntity,
        expect.anything(),
      );
    });

    it('amount/minPoint 非 null → 转为字符串', async () => {
      const dto = {
        name: '金额券',
        useType: 0,
        amount: 20,
        minPoint: 100,
      } as any;

      await service.update(1, dto);

      expect(mockManager.update).toHaveBeenCalledWith(
        expect.anything(),
        1,
        expect.objectContaining({
          amount: '20',
          minPoint: '100',
        }),
      );
    });

    it('useType=0（全场通用）→ 仅清理关联，不插入新关联', async () => {
      const dto = { name: '全场通用', useType: 0 } as any;

      await service.update(2, dto);

      // 两张关联表都被清理
      expect(mockManager.delete).toHaveBeenCalledTimes(2);
      // 不应有任何 insert 调用
      expect(mockManager.insert).not.toHaveBeenCalled();
    });
  });

  // ======================== create 补充 ========================

  describe('create 补充', () => {
    it('amount/minPoint 为 null → 不转换', async () => {
      const dto = {
        name: '无金额券',
        useType: 0,
        amount: null,
        minPoint: null,
        publishCount: 10,
      } as any;
      await service.create(dto);
      const saveArg = mockManager.save.mock.calls[0][1];
      expect(saveArg.amount).toBeUndefined();
      expect(saveArg.minPoint).toBeUndefined();
    });
  });

  // ======================== list 补充 ========================

  describe('list 补充', () => {
    it('type + name 组合过滤', async () => {
      const qb = mockRepo.createQueryBuilder();
      mockRepo.createQueryBuilder.mockReturnValue(qb);
      qb.getManyAndCount.mockResolvedValue([[], 0]);

      await service.list({
        page: 1,
        limit: 10,
        keyword: '折扣',
        type: 1,
      } as any);

      expect(qb.andWhere).toHaveBeenCalledWith('c.name LIKE :keyword', {
        keyword: '%折扣%',
      });
      expect(qb.andWhere).toHaveBeenCalledWith('c.type = :type', { type: 1 });
    });
  });

  describe('update - amount/minPoint 条件分支', () => {
    it('amount 为 null → 不传 amount 到 update', async () => {
      await service.update(1, { amount: null, minPoint: null } as any);
      const updateCall = mockManager.update.mock.calls[0];
      const updateData = updateCall[2];
      expect(updateData).not.toHaveProperty('amount');
      expect(updateData).not.toHaveProperty('minPoint');
    });

    it('amount 有值 → 传 String(amount)', async () => {
      await service.update(1, { amount: 10, minPoint: 100 } as any);
      const updateCall = mockManager.update.mock.calls[0];
      const updateData = updateCall[2];
      expect(updateData.amount).toBe('10');
      expect(updateData.minPoint).toBe('100');
    });
  });
});
