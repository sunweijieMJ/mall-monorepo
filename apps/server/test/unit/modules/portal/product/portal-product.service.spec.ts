import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PortalProductService } from '@/modules/portal/product/portal-product.service';
import { ProductEntity } from '@/modules/pms/product/infrastructure/persistence/relational/entities/product.entity';
import { BrandEntity } from '@/modules/pms/brand/infrastructure/persistence/relational/entities/brand.entity';
import { SkuStockEntity } from '@/modules/pms/sku-stock/infrastructure/persistence/relational/entities/sku-stock.entity';
import { ProductAttrEntity } from '@/modules/pms/product-attr/infrastructure/persistence/relational/entities/product-attr.entity';
import { ProductAttrValueEntity } from '@/modules/pms/product/infrastructure/persistence/relational/entities/product-attr-value.entity';
import { ProductLadderEntity } from '@/modules/pms/product/infrastructure/persistence/relational/entities/product-ladder.entity';
import { ProductFullReductionEntity } from '@/modules/pms/product/infrastructure/persistence/relational/entities/product-full-reduction.entity';
import { ProductCategoryEntity } from '@/modules/pms/product-category/infrastructure/persistence/relational/entities/product-category.entity';
import { CouponEntity } from '@/modules/sms/coupon/infrastructure/persistence/relational/entities/coupon.entity';
import { CouponProductRelationEntity } from '@/modules/sms/coupon/infrastructure/persistence/relational/entities/coupon-product-relation.entity';
import { CouponProductCategoryRelationEntity } from '@/modules/sms/coupon/infrastructure/persistence/relational/entities/coupon-product-category-relation.entity';
import { createMockRepository } from '../../../../helpers/mock.factory';

const productFixture = (overrides = {}) =>
  ({
    id: 1,
    name: '测试商品',
    brandId: 10,
    productCategoryId: 20,
    productAttributeCategoryId: 30,
    promotionType: 0,
    publishStatus: 1,
    deleteStatus: 0,
    ...overrides,
  }) as unknown as ProductEntity;

describe('PortalProductService', () => {
  let service: PortalProductService;
  const mockProductRepo = createMockRepository();
  const mockBrandRepo = createMockRepository();
  const mockSkuStockRepo = createMockRepository();
  const mockProductAttrRepo = createMockRepository();
  const mockProductAttrValueRepo = createMockRepository();
  const mockProductLadderRepo = createMockRepository();
  const mockProductFullReductionRepo = createMockRepository();
  const mockProductCategoryRepo = createMockRepository();
  const mockCouponRepo = createMockRepository();
  const mockCouponProductRelRepo = createMockRepository();
  const mockCouponCategoryRelRepo = createMockRepository();

  beforeEach(async () => {
    vi.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        PortalProductService,
        {
          provide: getRepositoryToken(ProductEntity),
          useValue: mockProductRepo,
        },
        { provide: getRepositoryToken(BrandEntity), useValue: mockBrandRepo },
        {
          provide: getRepositoryToken(SkuStockEntity),
          useValue: mockSkuStockRepo,
        },
        {
          provide: getRepositoryToken(ProductAttrEntity),
          useValue: mockProductAttrRepo,
        },
        {
          provide: getRepositoryToken(ProductAttrValueEntity),
          useValue: mockProductAttrValueRepo,
        },
        {
          provide: getRepositoryToken(ProductLadderEntity),
          useValue: mockProductLadderRepo,
        },
        {
          provide: getRepositoryToken(ProductFullReductionEntity),
          useValue: mockProductFullReductionRepo,
        },
        {
          provide: getRepositoryToken(ProductCategoryEntity),
          useValue: mockProductCategoryRepo,
        },
        { provide: getRepositoryToken(CouponEntity), useValue: mockCouponRepo },
        {
          provide: getRepositoryToken(CouponProductRelationEntity),
          useValue: mockCouponProductRelRepo,
        },
        {
          provide: getRepositoryToken(CouponProductCategoryRelationEntity),
          useValue: mockCouponCategoryRelRepo,
        },
      ],
    }).compile();
    service = module.get(PortalProductService);
  });

  // ======================== detail ========================

  describe('detail', () => {
    it('商品存在 → 聚合返回多表数据', async () => {
      mockProductRepo.findOne.mockResolvedValue(productFixture());
      mockBrandRepo.findOne.mockResolvedValue({ id: 10, name: 'Nike' });
      mockSkuStockRepo.find.mockResolvedValue([{ id: 1, price: '99.00' }]);
      mockProductAttrRepo.find.mockResolvedValue([
        { id: 1, productAttributeCategoryId: 30 },
      ]);
      mockProductAttrValueRepo.find.mockResolvedValue([
        { id: 1, productAttributeId: 1, productId: 1 },
      ]);
      // getAvailableCoupons 内部调用
      const couponQb = mockCouponRepo.createQueryBuilder();
      mockCouponRepo.createQueryBuilder.mockReturnValue(couponQb);
      couponQb.getMany.mockResolvedValue([]);
      mockCouponProductRelRepo.find.mockResolvedValue([]);
      mockCouponCategoryRelRepo.find.mockResolvedValue([]);

      const result = await service.detail(1);

      expect(result.product.name).toBe('测试商品');
      expect(result.brand?.name).toBe('Nike');
      expect(result.skuStockList).toHaveLength(1);
    });

    it('商品不存在 → 404', async () => {
      mockProductRepo.findOne.mockResolvedValue(null);

      await expect(service.detail(999)).rejects.toThrow(NotFoundException);
    });

    it('promotionType=3 → 查询阶梯价', async () => {
      mockProductRepo.findOne.mockResolvedValue(
        productFixture({ promotionType: 3 }),
      );
      mockBrandRepo.findOne.mockResolvedValue(null);
      mockSkuStockRepo.find.mockResolvedValue([]);
      mockProductAttrRepo.find.mockResolvedValue([]);
      mockProductAttrValueRepo.find.mockResolvedValue([]);
      mockProductLadderRepo.find.mockResolvedValue([
        { productId: 1, count: 5, discount: '0.8' },
      ]);
      const couponQb = mockCouponRepo.createQueryBuilder();
      mockCouponRepo.createQueryBuilder.mockReturnValue(couponQb);
      couponQb.getMany.mockResolvedValue([]);
      mockCouponProductRelRepo.find.mockResolvedValue([]);
      mockCouponCategoryRelRepo.find.mockResolvedValue([]);

      const result = await service.detail(1);

      expect(result.productLadderList).toHaveLength(1);
    });
  });

  // ======================== search ========================

  describe('search', () => {
    it('无过滤条件 → 返回分页结果', async () => {
      const qb = mockProductRepo.createQueryBuilder();
      mockProductRepo.createQueryBuilder.mockReturnValue(qb);
      qb.getManyAndCount.mockResolvedValue([[productFixture()], 1]);

      const result = await service.search({ page: 1, limit: 10 } as any);

      expect(result.list).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(qb.where).toHaveBeenCalledWith(
        'p.publish_status = :publishStatus',
        { publishStatus: 1 },
      );
      expect(qb.andWhere).toHaveBeenCalledWith(
        'p.delete_status = :deleteStatus',
        { deleteStatus: 0 },
      );
    });

    it('有关键词 → 验证 keyword 被使用', async () => {
      const qb = mockProductRepo.createQueryBuilder();
      mockProductRepo.createQueryBuilder.mockReturnValue(qb);
      qb.getManyAndCount.mockResolvedValue([[], 0]);

      await service.search({ page: 1, limit: 10 } as any, '手机');

      expect(qb.andWhere).toHaveBeenCalledWith('p.name LIKE :keyword', {
        keyword: '%手机%',
      });
    });

    it('sort=1 → 按新品排序（id DESC）', async () => {
      const qb = mockProductRepo.createQueryBuilder();
      mockProductRepo.createQueryBuilder.mockReturnValue(qb);
      qb.getManyAndCount.mockResolvedValue([[], 0]);

      await service.search(
        { page: 1, limit: 10 } as any,
        undefined,
        undefined,
        undefined,
        1,
      );

      expect(qb.orderBy).toHaveBeenCalledWith('p.id', 'DESC');
    });
  });

  // ======================== categoryTreeList ========================

  describe('categoryTreeList', () => {
    it('构建树结构', async () => {
      mockProductCategoryRepo.find.mockResolvedValue([
        { id: 1, parentId: 0, name: '服装' },
        { id: 2, parentId: 1, name: '男装' },
        { id: 3, parentId: 1, name: '女装' },
        { id: 4, parentId: 0, name: '数码' },
      ]);

      const result = await service.categoryTreeList();

      expect(result).toHaveLength(2); // 服装、数码
      expect(result[0].children).toHaveLength(2); // 男装、女装
      expect(result[1].children).toHaveLength(0);
    });

    it('空分类 → 返回空数组', async () => {
      mockProductCategoryRepo.find.mockResolvedValue([]);

      const result = await service.categoryTreeList();
      expect(result).toEqual([]);
    });
  });

  // ======================== search 排序补充 ========================

  describe('search 排序', () => {
    function setupSearchQb() {
      const qb = mockProductRepo.createQueryBuilder();
      mockProductRepo.createQueryBuilder.mockReturnValue(qb);
      qb.getManyAndCount.mockResolvedValue([[], 0]);
      return qb;
    }

    it('sort=2 → 按销量排序', async () => {
      const qb = setupSearchQb();
      await service.search(
        { page: 1, limit: 10 } as any,
        undefined,
        undefined,
        undefined,
        2,
      );
      expect(qb.orderBy).toHaveBeenCalledWith('p.sale', 'DESC');
    });

    it('sort=3 → 按价格升序', async () => {
      const qb = setupSearchQb();
      await service.search(
        { page: 1, limit: 10 } as any,
        undefined,
        undefined,
        undefined,
        3,
      );
      expect(qb.orderBy).toHaveBeenCalledWith('p.price', 'ASC');
    });

    it('sort=4 → 按价格降序', async () => {
      const qb = setupSearchQb();
      await service.search(
        { page: 1, limit: 10 } as any,
        undefined,
        undefined,
        undefined,
        4,
      );
      expect(qb.orderBy).toHaveBeenCalledWith('p.price', 'DESC');
    });

    it('sort 不传 → 默认按 id DESC', async () => {
      const qb = setupSearchQb();
      await service.search({ page: 1, limit: 10 } as any);
      expect(qb.orderBy).toHaveBeenCalledWith('p.id', 'DESC');
    });

    it('brandId 过滤 → 验证 andWhere', async () => {
      const qb = setupSearchQb();
      await service.search({ page: 1, limit: 10 } as any, undefined, 5);
      expect(qb.andWhere).toHaveBeenCalledWith('p.brand_id = :brandId', {
        brandId: 5,
      });
    });

    it('productCategoryId 过滤 → 验证 andWhere', async () => {
      const qb = setupSearchQb();
      await service.search(
        { page: 1, limit: 10 } as any,
        undefined,
        undefined,
        20,
      );
      expect(qb.andWhere).toHaveBeenCalledWith(
        'p.product_category_id = :productCategoryId',
        { productCategoryId: 20 },
      );
    });
  });

  // ======================== detail 补充 ========================

  describe('detail 补充', () => {
    function setupDetailMocks(product: any) {
      mockProductRepo.findOne.mockResolvedValue(product);
      mockBrandRepo.findOne.mockResolvedValue(null);
      mockSkuStockRepo.find.mockResolvedValue([]);
      mockProductAttrRepo.find.mockResolvedValue([]);
      mockProductAttrValueRepo.find.mockResolvedValue([]);
      const couponQb = mockCouponRepo.createQueryBuilder();
      mockCouponRepo.createQueryBuilder.mockReturnValue(couponQb);
      couponQb.getMany.mockResolvedValue([]);
      mockCouponProductRelRepo.find.mockResolvedValue([]);
      mockCouponCategoryRelRepo.find.mockResolvedValue([]);
    }

    it('promotionType=4 → 查询满减价格', async () => {
      setupDetailMocks(productFixture({ promotionType: 4 }));
      mockProductFullReductionRepo.find.mockResolvedValue([
        { productId: 1, fullPrice: '100', reducePrice: '10' },
      ]);

      const result = await service.detail(1);

      expect(result.productFullReductionList).toHaveLength(1);
      expect(mockProductFullReductionRepo.find).toHaveBeenCalledWith({
        where: { productId: 1 },
      });
    });

    it('getAvailableCoupons 去重合并', async () => {
      mockProductRepo.findOne.mockResolvedValue(productFixture());
      mockBrandRepo.findOne.mockResolvedValue(null);
      mockSkuStockRepo.find.mockResolvedValue([]);
      mockProductAttrRepo.find.mockResolvedValue([]);
      mockProductAttrValueRepo.find.mockResolvedValue([]);

      // 全场通用优惠券
      const universalCoupon = { id: 1, name: '全场通用', useType: 0 };
      // 商品关联优惠券（和全场通用重复 id=1）
      const productCoupon = { id: 1, name: '全场通用', useType: 0 };

      const couponQb = {
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        getMany: vi
          .fn()
          .mockResolvedValueOnce([universalCoupon]) // 全场通用
          .mockResolvedValueOnce([productCoupon]), // 额外查询（重复 ID）
      };
      mockCouponRepo.createQueryBuilder.mockReturnValue(couponQb);
      mockCouponProductRelRepo.find.mockResolvedValue([
        { couponId: 1, productId: 1 },
      ]);
      mockCouponCategoryRelRepo.find.mockResolvedValue([]);

      const result = await service.detail(1);

      // 去重后应只有 1 张优惠券
      expect(result.couponList).toHaveLength(1);
    });
  });
});
