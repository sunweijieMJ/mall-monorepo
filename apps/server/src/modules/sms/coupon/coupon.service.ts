import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionService } from '@/infrastructure/database/transaction/transaction.service';
import { CouponEntity } from './infrastructure/persistence/relational/entities/coupon.entity';
import { CouponHistoryEntity } from './infrastructure/persistence/relational/entities/coupon-history.entity';
import { CouponProductRelationEntity } from './infrastructure/persistence/relational/entities/coupon-product-relation.entity';
import { CouponProductCategoryRelationEntity } from './infrastructure/persistence/relational/entities/coupon-product-category-relation.entity';
import { PageQueryDto, PageResult } from '@/common/dto/page-result.dto';
import { CreateCouponDto, UpdateCouponDto } from './dto/create-coupon.dto';

@Injectable()
export class CouponService {
  constructor(
    @InjectRepository(CouponEntity)
    private readonly repo: Repository<CouponEntity>,
    @InjectRepository(CouponHistoryEntity)
    private readonly historyRepo: Repository<CouponHistoryEntity>,
    @InjectRepository(CouponProductRelationEntity)
    private readonly productRelationRepo: Repository<CouponProductRelationEntity>,
    @InjectRepository(CouponProductCategoryRelationEntity)
    private readonly categoryRelationRepo: Repository<CouponProductCategoryRelationEntity>,
    private readonly transactionService: TransactionService,
  ) {}

  // 分页列表
  async list(
    query: PageQueryDto & { name?: string; type?: number },
  ): Promise<PageResult<CouponEntity>> {
    const qb = this.repo.createQueryBuilder('c');

    if (query.name) {
      qb.andWhere('c.name LIKE :name', { name: `%${query.name}%` });
    }
    if (query.type != null) {
      qb.andWhere('c.type = :type', { type: query.type });
    }

    qb.orderBy('c.id', 'DESC');
    qb.skip((query.page - 1) * query.limit).take(query.limit);

    const [list, total] = await qb.getManyAndCount();
    return PageResult.of(list, total, query);
  }

  // 创建优惠券（含关联关系）
  async create(dto: CreateCouponDto): Promise<CouponEntity> {
    const { productRelationList, productCategoryRelationList, ...couponData } =
      dto;

    return this.transactionService.run(async (manager) => {
      const coupon = await manager.save(CouponEntity, {
        ...couponData,
        amount:
          couponData.amount != null ? String(couponData.amount) : undefined,
        minPoint:
          couponData.minPoint != null ? String(couponData.minPoint) : undefined,
        count: couponData.publishCount,
        useCount: 0,
        receiveCount: 0,
      });

      // useType=2: 指定商品
      if (couponData.useType === 2 && productRelationList?.length) {
        const relations = productRelationList.map((r: any) => ({
          ...r,
          couponId: coupon.id,
        }));
        await manager.insert(CouponProductRelationEntity, relations);
      }

      // useType=1: 指定分类
      if (couponData.useType === 1 && productCategoryRelationList?.length) {
        const relations = productCategoryRelationList.map((r: any) => ({
          ...r,
          couponId: coupon.id,
        }));
        await manager.insert(CouponProductCategoryRelationEntity, relations);
      }

      return coupon;
    });
  }

  // 获取详情（含关联商品/分类）
  async detail(id: number): Promise<any> {
    const coupon = await this.repo.findOneBy({ id });
    if (!coupon) return null;

    const productRelationList = await this.productRelationRepo.findBy({
      couponId: id,
    });
    const productCategoryRelationList = await this.categoryRelationRepo.findBy({
      couponId: id,
    });

    return {
      ...coupon,
      productRelationList,
      productCategoryRelationList,
    };
  }

  // 更新优惠券（含关联关系）
  async update(id: number, dto: UpdateCouponDto): Promise<void> {
    const { productRelationList, productCategoryRelationList, ...couponData } =
      dto;

    await this.transactionService.run(async (manager) => {
      const { amount, minPoint, ...restCouponData } = couponData;
      await manager.update(CouponEntity, id, {
        ...restCouponData,
        ...(amount != null ? { amount: String(amount) } : {}),
        ...(minPoint != null ? { minPoint: String(minPoint) } : {}),
      });

      // useType 变更时需清理两张关联表，防止旧数据遗留
      await manager.delete(CouponProductRelationEntity, { couponId: id });
      await manager.delete(CouponProductCategoryRelationEntity, {
        couponId: id,
      });

      // 按新 useType 重建关联
      if (couponData.useType === 2 && productRelationList?.length) {
        const relations = productRelationList.map((r: any) => ({
          ...r,
          couponId: id,
        }));
        await manager.insert(CouponProductRelationEntity, relations);
      }
      if (couponData.useType === 1 && productCategoryRelationList?.length) {
        const relations = productCategoryRelationList.map((r: any) => ({
          ...r,
          couponId: id,
        }));
        await manager.insert(CouponProductCategoryRelationEntity, relations);
      }
    });
  }

  // 删除优惠券（含关联关系）
  async delete(id: number): Promise<void> {
    await this.transactionService.run(async (manager) => {
      await manager.delete(CouponEntity, id);
      await manager.delete(CouponProductRelationEntity, { couponId: id });
      await manager.delete(CouponProductCategoryRelationEntity, {
        couponId: id,
      });
    });
  }

  // 优惠券领取记录
  async listHistory(
    query: PageQueryDto & {
      couponId?: number;
      useStatus?: number;
      orderSn?: string;
    },
  ): Promise<PageResult<CouponHistoryEntity>> {
    const qb = this.historyRepo.createQueryBuilder('h');

    if (query.couponId != null) {
      qb.andWhere('h.couponId = :couponId', { couponId: query.couponId });
    }
    if (query.useStatus != null) {
      qb.andWhere('h.useStatus = :useStatus', { useStatus: query.useStatus });
    }
    if (query.orderSn) {
      qb.andWhere('h.orderSn LIKE :orderSn', {
        orderSn: `%${query.orderSn}%`,
      });
    }

    qb.orderBy('h.id', 'DESC');
    qb.skip((query.page - 1) * query.limit).take(query.limit);

    const [list, total] = await qb.getManyAndCount();
    return PageResult.of(list, total, query);
  }
}
