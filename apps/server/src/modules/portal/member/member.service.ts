import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { TransactionService } from '@/infrastructure/database/transaction/transaction.service';
import {
  MemberEntity,
  MemberAddressEntity,
} from './infrastructure/persistence/relational/entities/member.entity';
import { CouponEntity } from '@/modules/sms/coupon/infrastructure/persistence/relational/entities/coupon.entity';
import { CouponHistoryEntity } from '@/modules/sms/coupon/infrastructure/persistence/relational/entities/coupon-history.entity';
import { CouponProductRelationEntity } from '@/modules/sms/coupon/infrastructure/persistence/relational/entities/coupon-product-relation.entity';
import { CouponProductCategoryRelationEntity } from '@/modules/sms/coupon/infrastructure/persistence/relational/entities/coupon-product-category-relation.entity';
import { ProductEntity } from '@/modules/pms/product/infrastructure/persistence/relational/entities/product.entity';

@Injectable()
export class MemberService {
  constructor(
    @InjectRepository(MemberEntity)
    private readonly memberRepo: Repository<MemberEntity>,

    @InjectRepository(MemberAddressEntity)
    private readonly addressRepo: Repository<MemberAddressEntity>,

    @InjectRepository(CouponEntity)
    private readonly couponRepo: Repository<CouponEntity>,

    @InjectRepository(CouponHistoryEntity)
    private readonly couponHistoryRepo: Repository<CouponHistoryEntity>,

    @InjectRepository(ProductEntity)
    private readonly productRepo: Repository<ProductEntity>,

    @InjectRepository(CouponProductRelationEntity)
    private readonly couponProductRelRepo: Repository<CouponProductRelationEntity>,

    @InjectRepository(CouponProductCategoryRelationEntity)
    private readonly couponCategoryRelRepo: Repository<CouponProductCategoryRelationEntity>,

    private readonly transactionService: TransactionService,
  ) {}

  /**
   * 获取当前会员信息，返回时隐藏 password 字段
   */
  async getCurrentMember(
    memberId: number,
  ): Promise<Omit<MemberEntity, 'password'> | null> {
    const member = await this.memberRepo.findOne({ where: { id: memberId } });
    if (!member) return null;
    // 隐藏密码字段
    const { password: _password, ...rest } = member;
    return rest as Omit<MemberEntity, 'password'>;
  }

  /**
   * 更新会员基本信息
   */
  async updateInfo(
    memberId: number,
    data: Record<string, unknown>,
  ): Promise<void> {
    // 排除不允许客户端修改的字段
    const {
      id: _id,
      password: _password,
      status: _status,
      ...safeData
    } = data as Record<string, unknown>;
    await this.memberRepo.update(
      { id: memberId },
      safeData as Partial<MemberEntity>,
    );
  }

  // ========== 收货地址 ==========

  /**
   * 获取会员收货地址列表
   */
  async listAddress(memberId: number): Promise<MemberAddressEntity[]> {
    return this.addressRepo.find({ where: { memberId } });
  }

  /**
   * 获取收货地址详情，不属于该会员则抛出 NotFoundException
   */
  async getAddress(id: number, memberId: number): Promise<MemberAddressEntity> {
    const address = await this.addressRepo.findOne({ where: { id, memberId } });
    if (!address) {
      throw new NotFoundException(`收货地址不存在或无权访问`);
    }
    return address;
  }

  /**
   * 添加收货地址
   * 若设置为默认地址，先将该会员其他地址的默认状态清除
   */
  async addAddress(
    memberId: number,
    data: Record<string, unknown>,
  ): Promise<void> {
    if (data.defaultStatus === 1) {
      // 清除该会员所有地址的默认状态
      await this.addressRepo.update({ memberId }, { defaultStatus: 0 });
    }
    const address = this.addressRepo.create({
      ...(data as Partial<MemberAddressEntity>),
      memberId,
    });
    await this.addressRepo.save(address);
  }

  /**
   * 更新收货地址
   * 若设置为默认地址，先将该会员其他地址的默认状态清除
   */
  async updateAddress(
    id: number,
    memberId: number,
    data: Record<string, unknown>,
  ): Promise<void> {
    // 验证归属权
    await this.getAddress(id, memberId);
    if (data.defaultStatus === 1) {
      // 清除该会员其他地址的默认状态（排除当前地址）
      await this.addressRepo
        .createQueryBuilder()
        .update()
        .set({ defaultStatus: 0 })
        .where('member_id = :memberId AND id != :id', { memberId, id })
        .execute();
    }
    await this.addressRepo.update(
      { id, memberId },
      data as Partial<MemberAddressEntity>,
    );
  }

  /**
   * 删除收货地址
   */
  async deleteAddress(id: number, memberId: number): Promise<void> {
    await this.addressRepo.delete({ id, memberId });
  }

  // ========== 会员优惠券 ==========

  /**
   * 领取优惠券
   * 1. 验证优惠券是否存在
   * 2. 检查每人领取限制
   * 3. 先扣减库存（乐观锁），再插入领取记录
   */
  async addCoupon(memberId: number, couponId: number): Promise<void> {
    const coupon = await this.couponRepo.findOne({ where: { id: couponId } });
    if (!coupon) {
      throw new NotFoundException(`优惠券 ${couponId} 不存在`);
    }

    if (coupon.count <= 0) {
      throw new BadRequestException('优惠券已经领完了');
    }

    const now = new Date();
    if (coupon.enableTime && now < coupon.enableTime) {
      throw new BadRequestException('优惠券还没到领取时间');
    }

    const receivedCount = await this.couponHistoryRepo.count({
      where: { memberId, couponId },
    });
    if (coupon.perLimit > 0 && receivedCount >= coupon.perLimit) {
      throw new BadRequestException('超出领取限制');
    }

    // 事务：库存扣减 + 领取记录插入，确保原子性
    await this.transactionService.run(async (manager) => {
      // 乐观锁扣库存，affected 为 0 说明库存不足（并发安全）
      const result = await manager
        .createQueryBuilder()
        .update(CouponEntity)
        .set({
          count: () => 'count - 1',
          receiveCount: () => 'receive_count + 1',
        })
        .where('id = :id AND count > 0', { id: couponId })
        .execute();

      if (result.affected === 0) {
        throw new BadRequestException('优惠券已经领完了');
      }

      // 插入领取记录
      const history = manager.create(CouponHistoryEntity, {
        memberId,
        couponId,
        couponCode: randomUUID().replace(/-/g, '').substring(0, 32),
        createTime: now,
        useStatus: 0,
        getType: 1,
      });
      await manager.save(CouponHistoryEntity, history);
    });
  }

  /**
   * 查询会员优惠券历史列表
   * useStatus: 0->未使用；1->已使用；2->已过期
   */
  async listMemberCoupons(
    memberId: number,
    useStatus?: number,
  ): Promise<CouponHistoryEntity[]> {
    const qb = this.couponHistoryRepo
      .createQueryBuilder('ch')
      .where('ch.member_id = :memberId', { memberId });

    if (useStatus !== undefined && useStatus !== null) {
      qb.andWhere('ch.use_status = :useStatus', {
        useStatus: Number(useStatus),
      });
    }

    qb.orderBy('ch.id', 'DESC');

    return qb.getMany();
  }

  /**
   * 查询指定商品可用的优惠券列表（最多返回 3 条）
   * 规则：全场通用(useType=0) / 指定分类(useType=1) / 指定商品(useType=2)
   * 且 endTime > now（尚未过期）
   */
  async listCouponsByProduct(
    memberId: number,
    productId: number,
  ): Promise<CouponEntity[]> {
    // 查商品获取分类 ID
    const product = await this.productRepo.findOne({
      where: { id: productId },
    });
    if (!product) {
      throw new NotFoundException(`商品 ${productId} 不存在`);
    }

    const now = new Date();

    // 查询全场通用或者指定该商品/分类的优惠券，且在有效期内（startTime < now < endTime）
    const coupons = await this.couponRepo
      .createQueryBuilder('c')
      .where('(c.use_type = 0 OR c.use_type = 1 OR c.use_type = 2)')
      .andWhere('(c.start_time IS NULL OR c.start_time < :now)', { now })
      .andWhere('(c.end_time IS NULL OR c.end_time > :now)', { now })
      .orderBy('c.id', 'DESC')
      .take(3)
      .getMany();

    // 查指定商品的优惠券关联（useType=2）
    const productRelations = await this.couponProductRelRepo.find({
      where: { productId },
    });
    const couponIdsForProduct = new Set(
      productRelations.map((r) => r.couponId),
    );

    // 查指定分类的优惠券关联（useType=1）
    const categoryRelations = await this.couponCategoryRelRepo.find({
      where: { productCategoryId: product.productCategoryId },
    });
    const couponIdsForCategory = new Set(
      categoryRelations.map((r) => r.couponId),
    );

    // 按 useType 过滤：0=全场通用；1=指定分类；2=指定商品
    return coupons.filter((c) => {
      if (c.useType === 0) return true;
      if (c.useType === 1) return couponIdsForCategory.has(c.id);
      if (c.useType === 2) return couponIdsForProduct.has(c.id);
      return false;
    });
  }

  /**
   * 获取会员已领优惠券列表（返回优惠券对象，含使用状态过滤）
   * 迁移自 UmsMemberCouponServiceImpl.list()
   * useStatus: 0->未使用；1->已使用；2->已过期
   */
  async listCouponObjects(
    memberId: number,
    useStatus?: number,
  ): Promise<CouponEntity[]> {
    // 查询该会员的领取记录
    const qb = this.couponHistoryRepo
      .createQueryBuilder('ch')
      .where('ch.member_id = :memberId', { memberId });

    if (useStatus !== undefined && useStatus !== null) {
      qb.andWhere('ch.use_status = :useStatus', { useStatus });
    }

    const histories = await qb.getMany();
    const couponIds = [...new Set(histories.map((h) => h.couponId))];
    if (couponIds.length === 0) return [];

    return this.couponRepo.findBy({ id: In(couponIds) });
  }
}
