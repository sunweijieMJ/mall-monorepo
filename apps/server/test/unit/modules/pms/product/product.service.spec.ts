import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken, getDataSourceToken } from '@nestjs/typeorm';
import { ProductService } from '@/modules/pms/product/product.service';
import { ProductEntity } from '@/modules/pms/product/infrastructure/persistence/relational/entities/product.entity';
import { TransactionService } from '@/infrastructure/database/transaction/transaction.service';
import { createMockRepository } from '../../../../helpers/mock.factory';

// ======================== Fixtures ========================

const productFixture = (overrides = {}) =>
  ({
    id: 1,
    name: '测试商品',
    deleteStatus: 0,
    publishStatus: 1,
    verifyStatus: 1,
    brandId: 1,
    productCategoryId: 10,
    productSn: 'SN001',
    ...overrides,
  }) as unknown as ProductEntity;

// ======================== Mock Manager / DataSource ========================

function createMockManager() {
  const qb = {
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    whereInIds: vi.fn().mockReturnThis(),
    execute: vi.fn().mockResolvedValue({ affected: 1 }),
  };
  const manager = {
    createQueryBuilder: vi.fn().mockReturnValue(qb),
    save: vi
      .fn()
      .mockImplementation((_e: any, d: any) =>
        Promise.resolve(Array.isArray(d) ? d : { ...d, id: 1 }),
      ),
    create: vi.fn().mockImplementation((_e: any, d: any) => d),
    findOneBy: vi.fn().mockResolvedValue(null),
    findOne: vi.fn().mockResolvedValue(null),
    find: vi.fn().mockResolvedValue([]),
    update: vi.fn().mockResolvedValue({}),
    delete: vi.fn().mockResolvedValue({}),
  };
  return { manager, qb };
}

// ======================== Tests ========================

describe('ProductService', () => {
  let service: ProductService;
  const mockProductRepo = createMockRepository();
  const { manager: mockManager, qb: mockManagerQb } = createMockManager();
  const mockTransactionService = {
    run: vi.fn().mockImplementation(async (cb: any) => cb(mockManager)),
  };
  // DataSource mock：getUpdateInfo 使用 dataSource.getRepository().find()
  const mockSubRepo = { find: vi.fn().mockResolvedValue([]) };
  const mockDataSource = {
    getRepository: vi.fn().mockReturnValue(mockSubRepo),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    // 重置 manager QB mock
    mockManagerQb.update.mockReturnThis();
    mockManagerQb.set.mockReturnThis();
    mockManagerQb.where.mockReturnThis();
    mockManagerQb.whereInIds.mockReturnThis();
    mockManagerQb.execute.mockResolvedValue({ affected: 1 });
    mockManager.createQueryBuilder.mockReturnValue(mockManagerQb);
    mockManager.save.mockImplementation((_e: any, d: any) =>
      Promise.resolve(Array.isArray(d) ? d : { ...d, id: 1 }),
    );
    mockManager.create.mockImplementation((_e: any, d: any) => d);
    mockTransactionService.run.mockImplementation(async (cb: any) =>
      cb(mockManager),
    );
    mockSubRepo.find.mockResolvedValue([]);

    const module = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: getRepositoryToken(ProductEntity),
          useValue: mockProductRepo,
        },
        { provide: getDataSourceToken(), useValue: mockDataSource },
        { provide: TransactionService, useValue: mockTransactionService },
      ],
    }).compile();
    service = module.get(ProductService);
  });

  // ======================== getUpdateInfo ========================

  describe('getUpdateInfo', () => {
    it('商品存在 → 聚合返回所有子表数据', async () => {
      mockProductRepo.findOne.mockResolvedValue(productFixture());
      // dataSource.getRepository().find() 返回空数组（7次子表查询）

      const result = await service.getUpdateInfo(1);

      expect(result.name).toBe('测试商品');
      expect(result.skuStockList).toEqual([]);
      expect(mockDataSource.getRepository).toHaveBeenCalledTimes(7);
    });

    it('商品不存在 → 404', async () => {
      mockProductRepo.findOne.mockResolvedValue(null);

      await expect(service.getUpdateInfo(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ======================== create ========================

  describe('create', () => {
    it('创建商品（含 SKU + 属性值）→ 事务写入多表', async () => {
      const dto = {
        name: '新商品',
        skuStockList: [{ price: '100.00' }],
        productAttributeValueList: [{ attributeId: 1, value: '红' }],
        productLadderList: [],
        productFullReductionList: [],
        memberPriceList: [],
        subjectProductRelationList: [],
        prefrenceAreaProductRelationList: [],
      } as any;

      const result = await service.create(dto);

      expect(mockTransactionService.run).toHaveBeenCalled();
      expect(result.id).toBe(1);
      // save 至少被调用 3 次：商品主表、SKU、属性值
      expect(mockManager.save).toHaveBeenCalledTimes(3);
    });

    it('无子表数据 → 只插入商品主表', async () => {
      const dto = { name: '简单商品' } as any;

      await service.create(dto);

      // 只有商品主表 save
      expect(mockManager.save).toHaveBeenCalledTimes(1);
    });
  });

  // ======================== update ========================

  describe('update', () => {
    it('商品存在 → 先删后插更新子表', async () => {
      mockManager.findOneBy.mockResolvedValue(productFixture());
      mockManager.findOne.mockResolvedValue(productFixture());
      mockManager.find.mockResolvedValue([]); // 现有 SKU 列表

      const dto = {
        name: '更新商品',
        skuStockList: [{ price: '200.00' }], // 新增 SKU
        productAttributeValueList: [],
        productLadderList: [],
        productFullReductionList: [],
        memberPriceList: [],
        subjectProductRelationList: [],
        prefrenceAreaProductRelationList: [],
      } as any;

      const result = await service.update(1, dto);

      expect(mockTransactionService.run).toHaveBeenCalled();
      expect(mockManager.update).toHaveBeenCalled(); // 更新主表
      expect(mockManager.delete).toHaveBeenCalled(); // 先删后插
    });

    it('商品不存在 → 404', async () => {
      mockManager.findOneBy.mockResolvedValue(null);

      await expect(service.update(999, {} as any)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ======================== delete ========================

  describe('delete', () => {
    it('批量软删除', async () => {
      const qb = mockProductRepo.createQueryBuilder();
      qb.update = vi.fn().mockReturnValue(qb);
      qb.set = vi.fn().mockReturnValue(qb);
      qb.whereInIds = vi.fn().mockReturnValue(qb);
      mockProductRepo.createQueryBuilder.mockReturnValue(qb);
      qb.execute.mockResolvedValue({ affected: 2 });

      await service.delete([1, 2]);

      expect(qb.execute).toHaveBeenCalled();
    });

    it('空数组 → 不执行', async () => {
      await service.delete([]);
      expect(mockProductRepo.createQueryBuilder).not.toHaveBeenCalled();
    });

    it('未匹配任何商品 → 404', async () => {
      const qb = mockProductRepo.createQueryBuilder();
      qb.update = vi.fn().mockReturnValue(qb);
      qb.set = vi.fn().mockReturnValue(qb);
      qb.whereInIds = vi.fn().mockReturnValue(qb);
      mockProductRepo.createQueryBuilder.mockReturnValue(qb);
      qb.execute.mockResolvedValue({ affected: 0 });

      await expect(service.delete([999])).rejects.toThrow(NotFoundException);
    });
  });

  // ======================== updateVerifyStatus ========================

  describe('updateVerifyStatus', () => {
    it('更新审核状态 + 写入审核记录', async () => {
      await service.updateVerifyStatus([1, 2], 1, '审核通过', '管理员');

      expect(mockTransactionService.run).toHaveBeenCalled();
      expect(mockManager.save).toHaveBeenCalled();
      expect(mockManager.create).toHaveBeenCalledTimes(2);
    });
  });

  // ======================== updatePublishStatus ========================

  describe('updatePublishStatus', () => {
    it('批量更新上架状态', async () => {
      const qb = mockProductRepo.createQueryBuilder();
      qb.update = vi.fn().mockReturnValue(qb);
      qb.set = vi.fn().mockReturnValue(qb);
      qb.whereInIds = vi.fn().mockReturnValue(qb);
      mockProductRepo.createQueryBuilder.mockReturnValue(qb);
      qb.execute.mockResolvedValue({ affected: 2 });

      await service.updatePublishStatus([1, 2], 1);

      expect(qb.set).toHaveBeenCalledWith({ publishStatus: 1 });
    });
  });

  // ======================== findList ========================

  describe('findList', () => {
    // 辅助函数：为 productRepo.createQueryBuilder 创建链式 QB mock
    function setupFindListQb(list: any[] = [], total = 0) {
      const qb = {
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        take: vi.fn().mockReturnThis(),
        getManyAndCount: vi.fn().mockResolvedValue([list, total]),
      };
      mockProductRepo.createQueryBuilder.mockReturnValue(qb);
      return qb;
    }

    it('无过滤条件 → 返回分页结果', async () => {
      const products = [productFixture(), productFixture({ id: 2 })];
      const qb = setupFindListQb(products, 2);

      const result = await service.findList({ page: 1, limit: 10 } as any);

      expect(qb.where).toHaveBeenCalledWith('p.deleteStatus = :deleteStatus', {
        deleteStatus: 0,
      });
      expect(qb.andWhere).not.toHaveBeenCalled();
      expect(qb.orderBy).toHaveBeenCalledWith('p.id', 'DESC');
      expect(qb.skip).toHaveBeenCalledWith(0);
      expect(qb.take).toHaveBeenCalledWith(10);
      expect(result.list).toEqual(products);
      expect(result.total).toBe(2);
    });

    it('keyword 过滤 → 验证 LIKE 条件', async () => {
      const qb = setupFindListQb([], 0);

      await service.findList({ page: 1, limit: 10, keyword: '手机' } as any);

      expect(qb.andWhere).toHaveBeenCalledWith('p.name LIKE :keyword', {
        keyword: '%手机%',
      });
    });

    it('productSn 精确匹配', async () => {
      const qb = setupFindListQb([], 0);

      await service.findList({
        page: 1,
        limit: 10,
        productSn: 'SN001',
      } as any);

      expect(qb.andWhere).toHaveBeenCalledWith('p.productSn = :productSn', {
        productSn: 'SN001',
      });
    });

    it('publishStatus 过滤', async () => {
      const qb = setupFindListQb([], 0);

      await service.findList({
        page: 1,
        limit: 10,
        publishStatus: 1,
      } as any);

      expect(qb.andWhere).toHaveBeenCalledWith(
        'p.publishStatus = :publishStatus',
        { publishStatus: 1 },
      );
    });

    it('brandId + productCategoryId 组合过滤', async () => {
      const qb = setupFindListQb([], 0);

      await service.findList({
        page: 1,
        limit: 10,
        brandId: 5,
        productCategoryId: 20,
      } as any);

      expect(qb.andWhere).toHaveBeenCalledWith('p.brandId = :brandId', {
        brandId: 5,
      });
      expect(qb.andWhere).toHaveBeenCalledWith(
        'p.productCategoryId = :productCategoryId',
        { productCategoryId: 20 },
      );
    });

    it('verifyStatus 过滤', async () => {
      const qb = setupFindListQb([], 0);

      await service.findList({
        page: 1,
        limit: 10,
        verifyStatus: 0,
      } as any);

      expect(qb.andWhere).toHaveBeenCalledWith(
        'p.verifyStatus = :verifyStatus',
        { verifyStatus: 0 },
      );
    });
  });

  // ======================== findSimpleList ========================

  describe('findSimpleList', () => {
    // 辅助函数：为 findSimpleList 创建链式 QB mock（带 select）
    function setupSimpleListQb(result: any[] = []) {
      const qb = {
        select: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        getMany: vi.fn().mockResolvedValue(result),
      };
      mockProductRepo.createQueryBuilder.mockReturnValue(qb);
      return qb;
    }

    it('无 keyword → 不添加 andWhere', async () => {
      const items = [{ id: 1, name: '商品A', pic: 'a.jpg' }];
      const qb = setupSimpleListQb(items);

      const result = await service.findSimpleList();

      expect(qb.select).toHaveBeenCalledWith(['p.id', 'p.name', 'p.pic']);
      expect(qb.where).toHaveBeenCalledWith('p.deleteStatus = 0');
      expect(qb.andWhere).not.toHaveBeenCalled();
      expect(result).toEqual(items);
    });

    it('有 keyword → 添加 LIKE 条件', async () => {
      const qb = setupSimpleListQb([]);

      await service.findSimpleList('手机');

      expect(qb.andWhere).toHaveBeenCalledWith('p.name LIKE :keyword', {
        keyword: '%手机%',
      });
    });
  });

  // ======================== updateNewStatus ========================

  describe('updateNewStatus', () => {
    it('批量更新新品状态', async () => {
      const qb: Record<string, any> = {
        update: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
        whereInIds: vi.fn().mockReturnThis(),
        execute: vi.fn().mockResolvedValue({ affected: 2 }),
      };
      mockProductRepo.createQueryBuilder.mockReturnValue(qb);

      await service.updateNewStatus([1, 2], 1);

      expect(qb.set).toHaveBeenCalledWith({ newStatus: 1 });
      expect(qb.whereInIds).toHaveBeenCalledWith([1, 2]);
      expect(qb.execute).toHaveBeenCalled();
    });
  });

  // ======================== updateRecommendStatus ========================

  describe('updateRecommendStatus', () => {
    it('批量更新推荐状态', async () => {
      const qb: Record<string, any> = {
        update: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
        whereInIds: vi.fn().mockReturnThis(),
        execute: vi.fn().mockResolvedValue({ affected: 3 }),
      };
      mockProductRepo.createQueryBuilder.mockReturnValue(qb);

      await service.updateRecommendStatus([1, 2, 3], 1);

      expect(qb.set).toHaveBeenCalledWith({ recommandStatus: 1 });
      expect(qb.whereInIds).toHaveBeenCalledWith([1, 2, 3]);
      expect(qb.execute).toHaveBeenCalled();
    });
  });

  // ======================== create 子表完整覆盖 ========================

  describe('create - 子表完整覆盖', () => {
    it('含阶梯价+满减 → save 被调用 5 次', async () => {
      const dto = {
        name: '阶梯满减商品',
        skuStockList: [{ price: '100.00' }],
        productAttributeValueList: [{ attributeId: 1, value: '红' }],
        productLadderList: [{ count: 10, discount: '0.8' }],
        productFullReductionList: [{ fullPrice: '200', reducePrice: '20' }],
        memberPriceList: [],
        subjectProductRelationList: [],
        prefrenceAreaProductRelationList: [],
      } as any;

      await service.create(dto);

      // 主表 + SKU + 属性值 + 阶梯价 + 满减 = 5 次 save
      expect(mockManager.save).toHaveBeenCalledTimes(5);
    });

    it('含会员价+专题+区域 → save 被调用 4 次', async () => {
      const dto = {
        name: '会员专题商品',
        skuStockList: [],
        productAttributeValueList: [],
        productLadderList: [],
        productFullReductionList: [],
        memberPriceList: [{ memberLevelId: 1, memberPrice: '90' }],
        subjectProductRelationList: [{ subjectId: 1 }],
        prefrenceAreaProductRelationList: [{ prefrenceAreaId: 1 }],
      } as any;

      await service.create(dto);

      // 主表 + 会员价 + 专题关联 + 区域关联 = 4 次 save
      expect(mockManager.save).toHaveBeenCalledTimes(4);
    });

    it('SKU 无 skuCode → 自动生成', async () => {
      const dto = {
        name: '自动编码商品',
        skuStockList: [{ price: '50.00' }, { price: '60.00' }],
        productAttributeValueList: [],
        productLadderList: [],
        productFullReductionList: [],
        memberPriceList: [],
        subjectProductRelationList: [],
        prefrenceAreaProductRelationList: [],
      } as any;

      await service.create(dto);

      // 验证 manager.create 被调用时参数包含自动生成的 skuCode
      const skuCreateCalls = mockManager.create.mock.calls.filter(
        (call: any[]) => call[1]?.productId !== undefined && call[1]?.skuCode,
      );
      expect(skuCreateCalls.length).toBe(2);
      // skuCode 格式：yyyyMMdd + 商品ID(4位) + 序号(3位)
      expect(skuCreateCalls[0][1].skuCode).toMatch(/^\d{8}\d{4}001$/);
      expect(skuCreateCalls[1][1].skuCode).toMatch(/^\d{8}\d{4}002$/);
    });

    it('SKU 有自定义 skuCode → 保留自定义值', async () => {
      const dto = {
        name: '自定义编码商品',
        skuStockList: [{ price: '70.00', skuCode: 'CUSTOM-SKU-001' }],
        productAttributeValueList: [],
        productLadderList: [],
        productFullReductionList: [],
        memberPriceList: [],
        subjectProductRelationList: [],
        prefrenceAreaProductRelationList: [],
      } as any;

      await service.create(dto);

      const skuCreateCalls = mockManager.create.mock.calls.filter(
        (call: any[]) => call[1]?.skuCode,
      );
      expect(skuCreateCalls.length).toBe(1);
      expect(skuCreateCalls[0][1].skuCode).toBe('CUSTOM-SKU-001');
    });
  });

  // ======================== update SKU 三路处理 ========================

  describe('update - SKU 三路处理', () => {
    const baseUpdateDto = {
      name: '更新商品',
      productAttributeValueList: [],
      productLadderList: [],
      productFullReductionList: [],
      memberPriceList: [],
      subjectProductRelationList: [],
      prefrenceAreaProductRelationList: [],
    } as any;

    it('skuStockList 为空 → 全删', async () => {
      mockManager.findOneBy.mockResolvedValue(productFixture());
      mockManager.findOne.mockResolvedValue(productFixture());

      await service.update(1, { ...baseUpdateDto, skuStockList: [] });

      // 验证以 productId 条件删除所有 SKU
      const deleteCalls = mockManager.delete.mock.calls;
      const skuDeleteCall = deleteCalls.find(
        (call: any[]) => call[1]?.productId === 1,
      );
      expect(skuDeleteCall).toBeDefined();
    });

    it('新增+更新分流 → 新 SKU 无 id，更新 SKU 有 id', async () => {
      mockManager.findOneBy.mockResolvedValue(productFixture());
      mockManager.findOne.mockResolvedValue(productFixture());
      // 数据库中已有 SKU（id: 100）
      mockManager.find.mockResolvedValue([
        { id: 100, productId: 1, skuCode: 'OLD-001' },
      ]);

      const dto = {
        ...baseUpdateDto,
        skuStockList: [
          { id: 100, price: '150.00' }, // 更新已有
          { price: '200.00' }, // 新增（无 id）
        ],
      };

      await service.update(1, dto);

      // 新增 SKU → manager.save 被调用
      const saveCalls = mockManager.save.mock.calls;
      expect(saveCalls.length).toBeGreaterThanOrEqual(1);

      // 更新 SKU → manager.update 被调用（SkuStockEntity, id=100, ...）
      const updateCalls = mockManager.update.mock.calls;
      const skuUpdateCall = updateCalls.find((call: any[]) => call[1] === 100);
      expect(skuUpdateCall).toBeDefined();
    });

    it('删除不在列表中的旧 SKU → 验证 delete 使用 In(deleteSkuIds)', async () => {
      mockManager.findOneBy.mockResolvedValue(productFixture());
      mockManager.findOne.mockResolvedValue(productFixture());
      // 数据库中有 id: 100 和 id: 200
      mockManager.find.mockResolvedValue([
        { id: 100, productId: 1, skuCode: 'OLD-001' },
        { id: 200, productId: 1, skuCode: 'OLD-002' },
      ]);

      const dto = {
        ...baseUpdateDto,
        // 只保留 id: 100，id: 200 应被删除
        skuStockList: [{ id: 100, price: '150.00' }],
      };

      await service.update(1, dto);

      // 验证删除调用包含被移除的 SKU id
      const deleteCalls = mockManager.delete.mock.calls;
      // 查找针对 SKU 的 delete 调用（条件包含 id: In(...)）
      const skuDeleteCall = deleteCalls.find(
        (call: any[]) => call[1]?.id !== undefined,
      );
      expect(skuDeleteCall).toBeDefined();
    });

    it('纯更新无增删 → 只调 update 不调 save 也不调 delete（针对 SKU）', async () => {
      mockManager.findOneBy.mockResolvedValue(productFixture());
      mockManager.findOne.mockResolvedValue(productFixture());
      // 数据库中只有 id: 100
      mockManager.find.mockResolvedValue([
        { id: 100, productId: 1, skuCode: 'OLD-001' },
      ]);

      const dto = {
        ...baseUpdateDto,
        // 只包含已有的 SKU（id: 100）
        skuStockList: [{ id: 100, price: '180.00' }],
      };

      // 重置 mock 计数
      mockManager.save.mockClear();
      mockManager.delete.mockClear();
      mockManager.update.mockClear();

      await service.update(1, dto);

      // manager.update 应被调用：1 次主表 + 1 次 SKU 更新
      expect(mockManager.update).toHaveBeenCalled();
      const updateCalls = mockManager.update.mock.calls;
      const skuUpdateCall = updateCalls.find((call: any[]) => call[1] === 100);
      expect(skuUpdateCall).toBeDefined();

      // manager.save 不应被调用来新增 SKU（可能被子表先删后插调用，但不应有 SKU 新增）
      const skuSaveCalls = mockManager.save.mock.calls.filter((call: any[]) => {
        const data = call[1];
        // SKU save 调用的第一个参数是 SkuStockEntity
        return Array.isArray(data) && data[0]?.skuCode !== undefined;
      });
      expect(skuSaveCalls.length).toBe(0);

      // 不应有以 In(...) 为条件的 SKU delete（全量 productId 删除来自子表先删后插，不算 SKU 删除）
      const skuDeleteCalls = mockManager.delete.mock.calls.filter(
        (call: any[]) => call[1]?.id !== undefined,
      );
      expect(skuDeleteCalls.length).toBe(0);
    });
  });
});
