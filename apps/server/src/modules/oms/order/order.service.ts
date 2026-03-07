import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Redis } from 'ioredis';
import { REDIS_CLIENT } from '@/infrastructure/redis/redis-client.module';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import { TransactionService } from '@/infrastructure/database/transaction/transaction.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { CACHE_KEYS } from '@/common/constants';
import {
  OrderEntity,
  OrderStatus,
} from './infrastructure/persistence/relational/entities/order.entity';
import { OrderItemEntity } from './infrastructure/persistence/relational/entities/order-item.entity';
import { OrderOperateHistoryEntity } from './infrastructure/persistence/relational/entities/order-operate-history.entity';
import { OrderSettingEntity } from '../order-setting/infrastructure/persistence/relational/entities/order-setting.entity';

import { CartItemEntity } from '../../portal/cart/infrastructure/persistence/relational/entities/cart-item.entity';
import { SkuStockEntity } from '../../pms/sku-stock/infrastructure/persistence/relational/entities/sku-stock.entity';
import { ProductEntity } from '../../pms/product/infrastructure/persistence/relational/entities/product.entity';
import { ProductLadderEntity } from '../../pms/product/infrastructure/persistence/relational/entities/product-ladder.entity';
import { ProductFullReductionEntity } from '../../pms/product/infrastructure/persistence/relational/entities/product-full-reduction.entity';
import {
  MemberEntity,
  MemberAddressEntity,
} from '../../portal/member/infrastructure/persistence/relational/entities/member.entity';
import { CouponEntity } from '../../sms/coupon/infrastructure/persistence/relational/entities/coupon.entity';
import { CouponHistoryEntity } from '../../sms/coupon/infrastructure/persistence/relational/entities/coupon-history.entity';
import { CouponProductRelationEntity } from '../../sms/coupon/infrastructure/persistence/relational/entities/coupon-product-relation.entity';
import { CouponProductCategoryRelationEntity } from '../../sms/coupon/infrastructure/persistence/relational/entities/coupon-product-category-relation.entity';
import { IntegrationConsumeSettingEntity } from '../../ums/member-level/infrastructure/persistence/relational/entities/integration-consume-setting.entity';

import { PageQueryDto, PageResult } from '@/common/dto/page-result.dto';

// ======================== DTO 定义 ========================

/** 发货信息 DTO */
export interface DeliveryItemDto {
  orderId: number;
  deliveryCompany: string;
  deliverySn: string;
}

/** 修改收货人信息 DTO */
export interface UpdateReceiverInfoDto {
  orderId: number;
  receiverName: string;
  receiverPhone: string;
  receiverPostCode?: string;
  receiverDetailAddress: string;
  receiverProvince: string;
  receiverCity: string;
  receiverRegion: string;
  status: number;
}

/** 修改费用信息 DTO */
export interface UpdateMoneyInfoDto {
  orderId: number;
  freightAmount: number;
  discountAmount?: number;
  status: number;
}

/** 生成订单入参 */
export interface GenerateOrderDto {
  cartIds?: number[];
  memberReceiveAddressId: number;
  couponId?: number;
  useIntegration?: number;
  payType: number;
  note?: string;
}

/** 购物车促销条目（calcCartPromotion 返回） */
export interface CartPromotionItem {
  id: number;
  productId: number;
  productSkuId: number;
  productName: string;
  productPic: string;
  productAttr: string;
  productBrand: string;
  productSn: string;
  price: number;
  quantity: number;
  productQuantity: number;
  productSkuCode: string;
  productCategoryId: number;
  promotionMessage: string;
  reduceAmount: number;
  realStock: number;
  integration: number;
  growth: number;
}

/** 优惠券详情（含关联关系） */
interface CouponHistoryDetail {
  couponHistory: CouponHistoryEntity;
  coupon: CouponEntity;
  productRelationList: CouponProductRelationEntity[];
  categoryRelationList: CouponProductCategoryRelationEntity[];
}

// ======================== Service ========================

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepo: Repository<OrderEntity>,
    @InjectRepository(OrderItemEntity)
    private readonly orderItemRepo: Repository<OrderItemEntity>,
    @InjectRepository(OrderOperateHistoryEntity)
    private readonly historyRepo: Repository<OrderOperateHistoryEntity>,
    @InjectRepository(OrderSettingEntity)
    private readonly orderSettingRepo: Repository<OrderSettingEntity>,
    @InjectRepository(CartItemEntity)
    private readonly cartItemRepo: Repository<CartItemEntity>,
    @InjectRepository(SkuStockEntity)
    private readonly skuStockRepo: Repository<SkuStockEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepo: Repository<ProductEntity>,
    @InjectRepository(ProductLadderEntity)
    private readonly productLadderRepo: Repository<ProductLadderEntity>,
    @InjectRepository(ProductFullReductionEntity)
    private readonly productFullReductionRepo: Repository<ProductFullReductionEntity>,
    @InjectRepository(MemberEntity)
    private readonly memberRepo: Repository<MemberEntity>,
    @InjectRepository(MemberAddressEntity)
    private readonly memberAddressRepo: Repository<MemberAddressEntity>,
    @InjectRepository(CouponEntity)
    private readonly couponRepo: Repository<CouponEntity>,
    @InjectRepository(CouponHistoryEntity)
    private readonly couponHistoryRepo: Repository<CouponHistoryEntity>,
    @InjectRepository(CouponProductRelationEntity)
    private readonly couponProductRelRepo: Repository<CouponProductRelationEntity>,
    @InjectRepository(CouponProductCategoryRelationEntity)
    private readonly couponCategoryRelRepo: Repository<CouponProductCategoryRelationEntity>,
    @InjectRepository(IntegrationConsumeSettingEntity)
    private readonly integrationConsumeSettingRepo: Repository<IntegrationConsumeSettingEntity>,
    @Inject(REDIS_CLIENT)
    private readonly redisClient: Redis,
    @InjectQueue('order-cancel')
    private readonly orderCancelQueue: Queue,
    private readonly transactionService: TransactionService,
  ) {}

  // ============ 管理端接口 ============

  /**
   * 管理端订单列表（带多条件过滤）
   * 迁移自 OmsOrderServiceImpl.list()
   */
  async adminList(
    query: PageQueryDto & Record<string, any>,
  ): Promise<PageResult<OrderEntity>> {
    const qb = this.orderRepo
      .createQueryBuilder('order')
      .where('order.deleteStatus = :deleteStatus', { deleteStatus: 0 });

    // 订单号精确匹配
    if (query.orderSn) {
      qb.andWhere('order.orderSn = :orderSn', { orderSn: query.orderSn });
    }

    // 收货人姓名或手机号模糊搜索
    if (query.receiverKeyword) {
      qb.andWhere(
        '(order.receiverName LIKE :kw OR order.receiverPhone LIKE :kw)',
        { kw: `%${query.receiverKeyword}%` },
      );
    }

    // 订单状态过滤
    if (query.status !== undefined && query.status !== '') {
      qb.andWhere('order.status = :status', { status: Number(query.status) });
    }

    // 支付方式过滤
    if (query.payType !== undefined && query.payType !== '') {
      qb.andWhere('order.payType = :payType', {
        payType: Number(query.payType),
      });
    }

    // 来源类型过滤
    if (query.sourceType !== undefined && query.sourceType !== '') {
      qb.andWhere('order.sourceType = :sourceType', {
        sourceType: Number(query.sourceType),
      });
    }

    // 创建时间范围过滤
    if (query.startTime) {
      qb.andWhere('order.createdAt >= :startTime', {
        startTime: new Date(query.startTime),
      });
    }
    if (query.endTime) {
      qb.andWhere('order.createdAt <= :endTime', {
        endTime: new Date(query.endTime),
      });
    }

    qb.orderBy('order.id', 'DESC')
      .skip((query.page - 1) * query.limit)
      .take(query.limit);

    const [list, total] = await qb.getManyAndCount();
    return PageResult.of(list, total, query);
  }

  /**
   * 获取订单详情（管理端）
   * 聚合查询：订单主体 + 商品列表 + 操作历史
   */
  async detail(
    id: number,
    memberId?: number,
  ): Promise<
    OrderEntity & {
      orderItemList: OrderItemEntity[];
      historyList: OrderOperateHistoryEntity[];
    }
  > {
    const order = await this.orderRepo.findOneBy({ id });
    if (!order) throw new NotFoundException(`订单 ${id} 不存在`);

    // 移动端调用时校验归属权，防止越权查看他人订单
    if (memberId !== undefined && order.memberId !== memberId) {
      throw new ForbiddenException('无权访问该订单');
    }

    // 查询订单商品列表
    const orderItemList = await this.orderItemRepo.findBy({ orderId: id });

    // 查询操作历史（按时间倒序）
    const historyList = await this.historyRepo
      .createQueryBuilder('h')
      .where('h.orderId = :orderId', { orderId: id })
      .orderBy('h.createTime', 'DESC')
      .getMany();

    return { ...order, orderItemList, historyList };
  }

  /**
   * 批量发货
   * 迁移自 OmsOrderServiceImpl.delivery()
   */
  async delivery(deliveryList: DeliveryItemDto[]): Promise<void> {
    // 用事务保证订单状态更新与操作历史写入的原子性
    await this.transactionService.run(async (manager) => {
      // 逐条 UPDATE（每条订单的物流单号不同，无法合并为单条 SQL），收集实际更新成功的订单
      const results = await Promise.all(
        deliveryList.map(async (item) => {
          const result = await manager
            .createQueryBuilder()
            .update(OrderEntity)
            .set({
              status: OrderStatus.SHIPPING,
              deliveryCompany: item.deliveryCompany,
              deliverySn: item.deliverySn,
              deliveryTime: new Date(),
            })
            .where('id = :id AND status = :status', {
              id: item.orderId,
              status: OrderStatus.PAID,
            })
            .execute();
          return { orderId: item.orderId, affected: result.affected ?? 0 };
        }),
      );

      // 只为实际更新成功的订单写入操作历史
      const successItems = results.filter((r) => r.affected > 0);
      if (successItems.length > 0) {
        const histories = successItems.map((item) =>
          manager.create(OrderOperateHistoryEntity, {
            orderId: item.orderId,
            operateMan: '后台管理员',
            orderStatus: OrderStatus.SHIPPING,
            note: '完成发货',
            createTime: new Date(),
          }),
        );
        await manager.save(OrderOperateHistoryEntity, histories);
      }
    });
  }

  /**
   * 关闭订单
   * 迁移自 OmsOrderServiceImpl.close()
   */
  async close(ids: number[], note: string): Promise<void> {
    await this.transactionService.run(async (manager) => {
      // 只允许关闭待付款、已付款、已发货状态的订单
      await manager
        .createQueryBuilder()
        .update(OrderEntity)
        .set({ status: OrderStatus.CLOSED })
        .where(
          'id IN (:...ids) AND deleteStatus = 0 AND status NOT IN (:...excludedStatuses)',
          {
            ids,
            excludedStatuses: [
              OrderStatus.CANCELLED,
              OrderStatus.CLOSED,
              OrderStatus.COMPLETED,
            ],
          },
        )
        .execute();

      const histories = ids.map((orderId) =>
        manager.create(OrderOperateHistoryEntity, {
          orderId,
          operateMan: '后台管理员',
          orderStatus: OrderStatus.CLOSED,
          note: `订单关闭:${note}`,
          createTime: new Date(),
        }),
      );
      await manager.save(OrderOperateHistoryEntity, histories);
    });
  }

  /**
   * 修改收货人信息
   * 迁移自 OmsOrderServiceImpl.updateReceiverInfo()
   */
  async updateReceiverInfo(dto: UpdateReceiverInfoDto): Promise<void> {
    const { orderId, status, ...receiverFields } = dto;

    await this.transactionService.run(async (manager) => {
      await manager
        .createQueryBuilder()
        .update(OrderEntity)
        .set({
          receiverName: receiverFields.receiverName,
          receiverPhone: receiverFields.receiverPhone,
          receiverPostCode: receiverFields.receiverPostCode ?? '',
          receiverDetailAddress: receiverFields.receiverDetailAddress,
          receiverProvince: receiverFields.receiverProvince,
          receiverCity: receiverFields.receiverCity,
          receiverRegion: receiverFields.receiverRegion,
          modifyTime: new Date(),
        })
        .where('id = :id', { id: orderId })
        .execute();

      await manager.save(OrderOperateHistoryEntity, {
        orderId,
        operateMan: '后台管理员',
        orderStatus: status,
        note: '修改收货人信息',
        createTime: new Date(),
      });
    });
  }

  /**
   * 修改费用信息
   * 迁移自 OmsOrderServiceImpl.updateMoneyInfo()
   */
  async updateMoneyInfo(dto: UpdateMoneyInfoDto): Promise<void> {
    const { orderId, status, freightAmount, discountAmount } = dto;

    const updateFields: Partial<OrderEntity> = {
      freightAmount: String(freightAmount),
    };
    if (discountAmount !== undefined) {
      updateFields.promotionAmount = String(discountAmount);
    }

    await this.transactionService.run(async (manager) => {
      await manager
        .createQueryBuilder()
        .update(OrderEntity)
        .set(updateFields)
        .where('id = :id', { id: orderId })
        .execute();

      await manager.save(OrderOperateHistoryEntity, {
        orderId,
        operateMan: '后台管理员',
        orderStatus: status,
        note: '修改费用信息',
        createTime: new Date(),
      });
    });
  }

  /**
   * 修改订单备注
   * 迁移自 OmsOrderServiceImpl.updateNote()
   */
  async updateNote(id: number, note: string, status: number): Promise<void> {
    await this.transactionService.run(async (manager) => {
      await manager
        .createQueryBuilder()
        .update(OrderEntity)
        .set({ note })
        .where('id = :id', { id })
        .execute();

      await manager.save(OrderOperateHistoryEntity, {
        orderId: id,
        operateMan: '后台管理员',
        orderStatus: status,
        note: `修改备注信息：${note}`,
        createTime: new Date(),
      });
    });
  }

  /**
   * 删除订单（管理端逻辑删除）
   * 迁移自 OmsOrderServiceImpl.delete()
   */
  async adminDelete(ids: number[]): Promise<void> {
    await this.orderRepo
      .createQueryBuilder()
      .update()
      .set({ deleteStatus: 1 })
      .where('id IN (:...ids) AND deleteStatus = 0', { ids })
      .execute();
  }

  // ============ 移动端接口 ============

  /**
   * 计算购物车促销信息
   * 迁移自 OmsPromotionServiceImpl.calcCartPromotion()
   * 按商品(SPU)分组，根据 promotionType 计算优惠金额
   */
  async calcCartPromotion(
    cartItems: CartItemEntity[],
  ): Promise<CartPromotionItem[]> {
    if (cartItems.length === 0) return [];

    // 1. 获取所有商品 id 列表
    const productIds = [...new Set(cartItems.map((c) => c.productId))];

    // 2. 批量查询商品信息
    const products = await this.productRepo.findBy({ id: In(productIds) });

    // 3. 批量查询 SKU 库存
    const skuStocks = await this.skuStockRepo.findBy({
      productId: In(productIds),
    });

    // 4. 批量查询阶梯价
    const ladders = await this.productLadderRepo.findBy({
      productId: In(productIds),
    });

    // 5. 批量查询满减规则
    const fullReductions = await this.productFullReductionRepo.findBy({
      productId: In(productIds),
    });

    // 6. 按 productId 分组购物车
    const productCartMap = new Map<number, CartItemEntity[]>();
    for (const cartItem of cartItems) {
      const list = productCartMap.get(cartItem.productId) ?? [];
      list.push(cartItem);
      productCartMap.set(cartItem.productId, list);
    }

    const result: CartPromotionItem[] = [];

    for (const [productId, itemList] of productCartMap.entries()) {
      const product = products.find((p) => p.id === productId);
      if (!product) {
        // 商品不存在，按无优惠处理
        for (const item of itemList) {
          result.push(this.buildNoReducePromotionItem(item, null, 0, 0));
        }
        continue;
      }

      const productSkuList = skuStocks.filter((s) => s.productId === productId);
      const productLadderList = ladders.filter(
        (l) => l.productId === productId,
      );
      const productFullReductionList = fullReductions.filter(
        (f) => f.productId === productId,
      );

      const promotionType = product.promotionType;

      if (promotionType === 1) {
        // 单品促销：使用 SKU 的 promotionPrice
        for (const item of itemList) {
          const skuStock = productSkuList.find(
            (s) => s.id === item.productSkuId,
          );
          const originalPrice = skuStock ? Number(skuStock.price) : 0;
          const promotionPrice = skuStock?.promotionPrice
            ? Number(skuStock.promotionPrice)
            : originalPrice;
          const reduceAmount = originalPrice - promotionPrice;
          const realStock = skuStock ? skuStock.stock - skuStock.lockStock : 0;

          result.push({
            id: item.id,
            productId: item.productId,
            productSkuId: item.productSkuId,
            productName: item.productName,
            productPic: item.productPic,
            productAttr: item.productAttr,
            productBrand: item.productBrand ?? '',
            productSn: item.productSn ?? '',
            price: originalPrice,
            quantity: item.productQuantity,
            productQuantity: item.productQuantity,
            productSkuCode: skuStock?.skuCode ?? '',
            productCategoryId: item.productCategoryId,
            promotionMessage: '单品促销',
            reduceAmount,
            realStock,
            integration: product.giftPoint,
            growth: product.giftGrowth,
          });
        }
      } else if (promotionType === 3) {
        // 阶梯价：统计该商品总数量，找匹配梯度
        const totalCount = itemList.reduce(
          (sum, i) => sum + i.productQuantity,
          0,
        );
        const matchedLadder = this.getMatchedLadder(
          totalCount,
          productLadderList,
        );

        if (matchedLadder) {
          const discount = Number(matchedLadder.discount);
          const message = `打折优惠：满${matchedLadder.count}件，打${(discount * 10).toFixed(1)}折`;

          for (const item of itemList) {
            const skuStock = productSkuList.find(
              (s) => s.id === item.productSkuId,
            );
            const originalPrice = skuStock ? Number(skuStock.price) : 0;
            const reduceAmount = originalPrice - discount * originalPrice;
            const realStock = skuStock
              ? skuStock.stock - skuStock.lockStock
              : 0;

            result.push({
              id: item.id,
              productId: item.productId,
              productSkuId: item.productSkuId,
              productName: item.productName,
              productPic: item.productPic,
              productAttr: item.productAttr,
              productBrand: item.productBrand ?? '',
              productSn: item.productSn ?? '',
              price: originalPrice,
              quantity: item.productQuantity,
              productQuantity: item.productQuantity,
              productSkuCode: skuStock?.skuCode ?? '',
              productCategoryId: item.productCategoryId,
              promotionMessage: message,
              reduceAmount,
              realStock,
              integration: product.giftPoint,
              growth: product.giftGrowth,
            });
          }
        } else {
          // 未达到阶梯条件，无优惠
          for (const item of itemList) {
            const skuStock = productSkuList.find(
              (s) => s.id === item.productSkuId,
            );
            result.push(
              this.buildNoReducePromotionItem(
                item,
                skuStock ?? null,
                product.giftPoint,
                product.giftGrowth,
              ),
            );
          }
        }
      } else if (promotionType === 4) {
        // 满减：计算该商品总金额，找满足条件的满减规则
        let totalAmount = 0;
        for (const item of itemList) {
          const skuStock = productSkuList.find(
            (s) => s.id === item.productSkuId,
          );
          const price = skuStock ? Number(skuStock.price) : 0;
          totalAmount += price * item.productQuantity;
        }

        const matchedFullReduction = this.getMatchedFullReduction(
          totalAmount,
          productFullReductionList,
        );

        if (matchedFullReduction) {
          const reducePrice = Number(matchedFullReduction.reducePrice);
          const message = `满减优惠：满${matchedFullReduction.fullPrice}元，减${matchedFullReduction.reducePrice}元`;

          // 按商品价格比例分摊满减金额（最后一项用补差法，避免浮点精度误差）
          let distributedReduce = 0;
          for (let i = 0; i < itemList.length; i++) {
            const item = itemList[i];
            const skuStock = productSkuList.find(
              (s) => s.id === item.productSkuId,
            );
            const originalPrice = skuStock ? Number(skuStock.price) : 0;
            let reduceAmount: number;
            if (i === itemList.length - 1) {
              // 补差法：剩余总减免除以数量得到单件分摊额
              reduceAmount =
                item.productQuantity > 0
                  ? Math.round(
                      ((reducePrice - distributedReduce) /
                        item.productQuantity) *
                        100,
                    ) / 100
                  : 0;
            } else {
              // 按单件价格占总金额比例分摊（得到单件减免额）
              reduceAmount =
                totalAmount > 0
                  ? Math.round(
                      (originalPrice / totalAmount) * reducePrice * 100,
                    ) / 100
                  : 0;
              // 累加该 item 的总减免额（单件 × 数量）
              distributedReduce += reduceAmount * item.productQuantity;
            }
            const realStock = skuStock
              ? skuStock.stock - skuStock.lockStock
              : 0;

            result.push({
              id: item.id,
              productId: item.productId,
              productSkuId: item.productSkuId,
              productName: item.productName,
              productPic: item.productPic,
              productAttr: item.productAttr,
              productBrand: item.productBrand ?? '',
              productSn: item.productSn ?? '',
              price: originalPrice,
              quantity: item.productQuantity,
              productQuantity: item.productQuantity,
              productSkuCode: skuStock?.skuCode ?? '',
              productCategoryId: item.productCategoryId,
              promotionMessage: message,
              reduceAmount,
              realStock,
              integration: product.giftPoint,
              growth: product.giftGrowth,
            });
          }
        } else {
          // 未达到满减条件，无优惠
          for (const item of itemList) {
            const skuStock = productSkuList.find(
              (s) => s.id === item.productSkuId,
            );
            result.push(
              this.buildNoReducePromotionItem(
                item,
                skuStock ?? null,
                product.giftPoint,
                product.giftGrowth,
              ),
            );
          }
        }
      } else {
        // 无优惠（promotionType == 0 或其他）
        for (const item of itemList) {
          const skuStock = productSkuList.find(
            (s) => s.id === item.productSkuId,
          );
          result.push(
            this.buildNoReducePromotionItem(
              item,
              skuStock ?? null,
              product.giftPoint,
              product.giftGrowth,
            ),
          );
        }
      }
    }

    return result;
  }

  /**
   * 生成确认订单信息（移动端）
   * 迁移自 OmsPortalOrderServiceImpl.generateConfirmOrder()
   */
  async generateConfirmOrder(
    memberId: number,
    cartIds: number[],
  ): Promise<any> {
    // 1. 查询购物车条目（deleteStatus=1 表示有效，Java 版本 deleteStatus=0 是无效）
    // 注意：CartItemEntity 中 deleteStatus: default=1 表示有效
    let cartQb = this.cartItemRepo
      .createQueryBuilder('cart')
      .where('cart.memberId = :memberId', { memberId })
      .andWhere('cart.deleteStatus = 1');

    if (cartIds && cartIds.length > 0) {
      cartQb = cartQb.andWhere('cart.id IN (:...cartIds)', { cartIds });
    }
    const cartItems = await cartQb.getMany();

    // 2. 计算促销
    const cartPromotionItemList = await this.calcCartPromotion(cartItems);

    // 3. 查询会员收货地址
    const memberReceiveAddressList = await this.memberAddressRepo.findBy({
      memberId,
    });

    // 4. 查询可用优惠券（useStatus=0 未使用）
    const couponHistoryList = await this.couponHistoryRepo.findBy({
      memberId,
      useStatus: 0,
    });
    const couponIds = couponHistoryList.map((h) => h.couponId);
    let couponHistoryDetailList: any[] = [];
    if (couponIds.length > 0) {
      const coupons = await this.couponRepo.findBy({ id: In(couponIds) });
      // 过滤可以使用的优惠券（满足最低消费）
      const totalAmount = cartPromotionItemList.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );
      couponHistoryDetailList = couponHistoryList
        .map((history) => {
          const coupon = coupons.find((c) => c.id === history.couponId);
          return coupon ? { couponHistory: history, coupon } : null;
        })
        .filter(
          (item): item is NonNullable<typeof item> =>
            item !== null && Number(item.coupon.minPoint) <= totalAmount,
        );
    }

    // 5. 查询积分消费规则
    const integrationConsumeSetting =
      await this.integrationConsumeSettingRepo.findOneBy({ id: 1 });

    // 6. 查询会员积分
    const member = await this.memberRepo.findOneBy({ id: memberId });
    const memberIntegration = member?.integration ?? 0;

    // 7. 计算金额
    let totalAmount = 0;
    let promotionAmount = 0;
    for (const item of cartPromotionItemList) {
      totalAmount += item.price * item.quantity;
      promotionAmount += item.reduceAmount * item.quantity;
    }
    const payAmount = totalAmount - promotionAmount;
    const calcAmount = {
      freightAmount: 0,
      totalAmount,
      promotionAmount,
      payAmount,
    };

    return {
      cartPromotionItemList,
      memberReceiveAddressList,
      couponHistoryDetailList,
      memberIntegration,
      integrationConsumeSetting,
      calcAmount,
    };
  }

  /**
   * 生成订单（移动端提交）
   * 迁移自 OmsPortalOrderServiceImpl.generateOrder()
   */
  async generateOrder(
    memberId: number,
    dto: GenerateOrderDto,
  ): Promise<{ order: OrderEntity; orderItemList: OrderItemEntity[] }> {
    // 校验收货地址
    if (!dto.memberReceiveAddressId) {
      throw new BadRequestException('请选择收货地址！');
    }

    // 1. 获取购物车及促销信息
    let cartQb = this.cartItemRepo
      .createQueryBuilder('cart')
      .where('cart.memberId = :memberId', { memberId })
      .andWhere('cart.deleteStatus = 1');

    if (dto.cartIds && dto.cartIds.length > 0) {
      cartQb = cartQb.andWhere('cart.id IN (:...cartIds)', {
        cartIds: dto.cartIds,
      });
    }
    const cartItems = await cartQb.getMany();

    const cartPromotionItemList = await this.calcCartPromotion(cartItems);

    // 2. 检查库存
    for (const item of cartPromotionItemList) {
      if (
        item.realStock === null ||
        item.realStock <= 0 ||
        item.realStock < item.quantity
      ) {
        throw new BadRequestException(
          `商品「${item.productName}」库存不足，无法下单`,
        );
      }
    }

    // 3. 构建 orderItemList
    const orderItems: Partial<OrderItemEntity>[] = cartPromotionItemList.map(
      (promo) => ({
        productId: promo.productId,
        productName: promo.productName,
        productPic: promo.productPic,
        productAttr: promo.productAttr,
        productBrand: promo.productBrand,
        productSn: promo.productSn,
        productPrice: String(promo.price),
        productQuantity: promo.quantity,
        productSkuId: promo.productSkuId,
        productSkuCode: promo.productSkuCode,
        productCategoryId: promo.productCategoryId,
        promotionAmount: String(promo.reduceAmount),
        promotionName: promo.promotionMessage,
        giftIntegration: promo.integration,
        giftGrowth: promo.growth,
        couponAmount: String(0),
        integrationAmount: String(0),
      }),
    );

    // 4. 处理优惠券
    if (dto.couponId) {
      const couponDetail = await this.getUsableCoupon(
        memberId,
        dto.couponId,
        cartPromotionItemList,
      );
      if (!couponDetail) {
        throw new BadRequestException('该优惠券不可用');
      }
      this.handleCouponAmount(orderItems, couponDetail);
    }

    // 5. 处理积分
    const member = await this.memberRepo.findOneBy({ id: memberId });
    if (!member) {
      throw new BadRequestException('会员信息不存在');
    }
    if (dto.useIntegration && dto.useIntegration > 0) {
      const totalProductAmount = orderItems.reduce(
        (sum, item) =>
          sum + Number(item.productPrice ?? 0) * (item.productQuantity ?? 0),
        0,
      );
      const integrationAmount = await this.calcUsableIntegrationAmount(
        dto.useIntegration,
        totalProductAmount,
        member,
        !!dto.couponId,
      );
      if (integrationAmount <= 0) {
        throw new BadRequestException('积分不可用');
      }
      // 按商品价格比例分摊积分抵扣金额（最后一项用补差法，避免浮点精度误差）
      let distributedIntegration = 0;
      for (let i = 0; i < orderItems.length; i++) {
        const item = orderItems[i];
        if (i === orderItems.length - 1) {
          // 最后一项 = 总额 - 前 N-1 项之和，确保分摊总和精确等于 integrationAmount
          item.integrationAmount = String(
            Math.round((integrationAmount - distributedIntegration) * 100) /
              100,
          );
        } else {
          const perAmount =
            totalProductAmount > 0
              ? Math.round(
                  (Number(item.productPrice ?? 0) / totalProductAmount) *
                    integrationAmount *
                    100,
                ) / 100
              : 0;
          item.integrationAmount = String(perAmount);
          distributedIntegration += perAmount;
        }
      }
    }

    // 6. 计算每个 orderItem 的实付金额（四舍五入到分）
    for (const item of orderItems) {
      item.realAmount = String(
        Math.round(
          (Number(item.productPrice ?? 0) -
            Number(item.promotionAmount ?? 0) -
            Number(item.couponAmount ?? 0) -
            Number(item.integrationAmount ?? 0)) *
            100,
        ) / 100,
      );
    }

    // 8. 构建订单主体
    const address = await this.memberAddressRepo.findOneBy({
      id: dto.memberReceiveAddressId,
      memberId,
    });
    if (!address) {
      throw new BadRequestException('收货地址不存在');
    }

    // 计算各金额
    // 注意：orderItem 中的 promotionAmount / couponAmount / integrationAmount 均为**单件**优惠金额
    // （由 calcCartPromotion、calcPerCouponAmount、积分分摊逻辑按单价比例计算），
    // 因此汇总到订单主体时需要 × productQuantity 得到该行商品的总优惠额，逻辑正确。
    const totalAmount = orderItems.reduce(
      (sum, item) =>
        sum + Number(item.productPrice ?? 0) * (item.productQuantity ?? 0),
      0,
    );
    const promotionAmount = orderItems.reduce(
      (sum, item) =>
        sum + Number(item.promotionAmount ?? 0) * (item.productQuantity ?? 0),
      0,
    );
    const couponAmount = dto.couponId
      ? orderItems.reduce(
          (sum, item) =>
            sum + Number(item.couponAmount ?? 0) * (item.productQuantity ?? 0),
          0,
        )
      : 0;
    const integrationAmount =
      dto.useIntegration && dto.useIntegration > 0
        ? orderItems.reduce(
            (sum, item) =>
              sum +
              Number(item.integrationAmount ?? 0) * (item.productQuantity ?? 0),
            0,
          )
        : 0;
    const payAmount =
      Math.round(
        (totalAmount - promotionAmount - couponAmount - integrationAmount) *
          100,
      ) / 100;

    // 计算赠送积分和成长值
    const giftIntegration = orderItems.reduce(
      (sum, item) =>
        sum + (item.giftIntegration ?? 0) * (item.productQuantity ?? 0),
      0,
    );
    const giftGrowth = orderItems.reduce(
      (sum, item) => sum + (item.giftGrowth ?? 0) * (item.productQuantity ?? 0),
      0,
    );

    // 查询订单设置
    const orderSettings = await this.orderSettingRepo.find({ take: 1 });
    const autoConfirmDay =
      orderSettings.length > 0 ? orderSettings[0].confirmOvertime : 15;
    const normalOrderOvertime =
      orderSettings.length > 0 ? orderSettings[0].normalOrderOvertime : 60;

    // 生成订单号
    const orderSn = await this.generateOrderSn(1, dto.payType);

    const order = this.orderRepo.create({
      memberId,
      memberUsername: member?.username ?? '',
      orderSn,
      totalAmount: String(totalAmount),
      payAmount: String(payAmount),
      freightAmount: String(0),
      promotionAmount: String(promotionAmount),
      couponAmount: String(couponAmount),
      integrationAmount: String(integrationAmount),
      couponId: dto.couponId ?? undefined,
      payType: dto.payType,
      sourceType: 1,
      status: OrderStatus.PENDING_PAYMENT,
      orderType: 0,
      confirmStatus: 0,
      deleteStatus: 0,
      integration: giftIntegration,
      growth: giftGrowth,
      useIntegration: dto.useIntegration ?? undefined,
      autoConfirmDay,
      note: dto.note ?? undefined,
      receiverName: address.name ?? '',
      receiverPhone: address.phoneNumber ?? '',
      receiverPostCode: address.postCode ?? '',
      receiverProvince: address.province ?? '',
      receiverCity: address.city ?? '',
      receiverRegion: address.region ?? '',
      receiverDetailAddress: address.detailAddress ?? '',
    });

    // 积分为整数，防止用户传入非数字值拼入 SQL
    const safeUseIntegration = dto.useIntegration
      ? Math.floor(Number(dto.useIntegration))
      : 0;

    // 9. 事务：锁定库存 + 插入订单 + 订单商品 + 优惠券状态 + 积分扣减 + 清理购物车（全部原子操作）
    const savedOrder = await this.transactionService.run(async (manager) => {
      // 先锁库存，锁定失败则事务回滚，不会产生脏数据
      await this.lockStock(manager, cartPromotionItemList);

      const newOrder = await manager.save(OrderEntity, order);

      const orderItemEntities = orderItems.map((item) =>
        manager.create(OrderItemEntity, {
          ...item,
          orderId: newOrder.id,
          orderSn: newOrder.orderSn,
        }),
      );
      await manager.save(OrderItemEntity, orderItemEntities);

      // 10. 更新优惠券状态（事务内，失败可回滚）
      if (dto.couponId) {
        await this.updateCouponStatus(manager, dto.couponId, memberId, 1);
      }

      // 11. 扣减会员积分（事务内，失败可回滚）
      // 注意：:deductIntegration 参数通过 .setParameter() 设置，TypeORM QueryBuilder
      // 的 setParameter 与 where 共享同一个 parameters 映射，WHERE 子句可正确解析该参数。
      if (safeUseIntegration > 0 && member) {
        const integrationResult = await manager
          .createQueryBuilder()
          .update(MemberEntity)
          .set({ integration: () => `integration - :deductIntegration` })
          .setParameter('deductIntegration', safeUseIntegration)
          .where('id = :id AND integration >= :deductIntegration', {
            id: memberId,
          })
          .execute();
        if (integrationResult.affected === 0) {
          throw new BadRequestException('会员积分不足，无法抵扣');
        }
      }

      // 12. 软删除购物车商品（事务内，失败可回滚）
      const cartItemIds = cartItems.map((c) => c.id);
      if (cartItemIds.length > 0) {
        await manager
          .createQueryBuilder()
          .update(CartItemEntity)
          .set({ deleteStatus: 0 })
          .where('id IN (:...ids) AND memberId = :memberId', {
            ids: cartItemIds,
            memberId,
          })
          .execute();
      }

      return newOrder;
    });

    // 13. 发送延迟取消订单消息（事务提交后执行，失败不影响订单）
    try {
      await this.orderCancelQueue.add(
        'cancel-order',
        { orderId: savedOrder.id },
        { delay: normalOrderOvertime * 60 * 1000 },
      );
    } catch (e) {
      // BullMQ 入队失败：订单不会自动取消，需人工干预
      this.logger.error(
        `BullMQ 入队失败，orderId=${savedOrder.id}`,
        (e as Error).stack,
      );
    }

    // 查询已保存的 orderItemList
    const savedOrderItems = await this.orderItemRepo.findBy({
      orderId: savedOrder.id,
    });

    return { order: savedOrder, orderItemList: savedOrderItems };
  }

  /**
   * 支付成功回调
   * 迁移自 OmsPortalOrderServiceImpl.paySuccess()
   */
  async paySuccess(
    orderId: number,
    payType: number,
    memberId: number,
  ): Promise<void> {
    // 订单状态更新 + 库存扣减必须在同一事务中，避免部分失败导致数据不一致
    await this.transactionService.run(async (manager) => {
      // 更新订单状态（WHERE 条件同时校验 memberId 归属权，防止越权操作）
      const updateResult = await manager
        .createQueryBuilder()
        .update(OrderEntity)
        .set({
          status: OrderStatus.PAID,
          paymentTime: new Date(),
          payType,
        })
        .where(
          'id = :id AND memberId = :memberId AND status = :status AND deleteStatus = 0',
          {
            id: orderId,
            memberId,
            status: OrderStatus.PENDING_PAYMENT,
          },
        )
        .execute();

      if (updateResult.affected === 0) {
        throw new BadRequestException(
          '订单不存在、无权操作或订单状态不是未支付！',
        );
      }

      // 扣减真实库存（stock - qty, lock_stock - qty），使用悲观锁防止并发问题
      const orderItems = await manager.findBy(OrderItemEntity, { orderId });
      // 按 skuId 升序加锁，防止死锁
      const sortedItems = [...orderItems].sort(
        (a, b) => (a.productSkuId ?? 0) - (b.productSkuId ?? 0),
      );
      for (const item of sortedItems) {
        const qty = Number(item.productQuantity) || 0;
        if (qty <= 0) continue;

        // 悲观锁：SELECT ... FOR UPDATE
        const sku = await manager
          .createQueryBuilder(SkuStockEntity, 'sku')
          .setLock('pessimistic_write')
          .where('sku.id = :skuId', { skuId: item.productSkuId })
          .getOne();

        if (!sku || sku.lockStock < qty) {
          throw new BadRequestException(
            `SKU(${item.productSkuId}) 库存不足，无法完成支付`,
          );
        }

        const deductResult = await manager
          .createQueryBuilder()
          .update(SkuStockEntity)
          .set({
            stock: () => `stock - :deductQty`,
            lockStock: () => `lock_stock - :deductQty`,
          })
          .setParameter('deductQty', qty)
          .where('id = :skuId AND stock >= :deductQty', {
            skuId: item.productSkuId,
          })
          .execute();

        if (deductResult.affected === 0) {
          throw new BadRequestException(
            `SKU(${item.productSkuId}) 实际库存不足，无法完成支付`,
          );
        }
      }

      // 记录操作历史
      await manager.save(OrderOperateHistoryEntity, {
        orderId,
        operateMan: '系统',
        orderStatus: OrderStatus.PAID,
        note: `支付成功（支付方式: ${payType}）`,
        createTime: new Date(),
      });
    });
  }

  /**
   * 用户取消订单
   * 迁移自 OmsPortalOrderServiceImpl.cancelOrder()
   */
  async cancelOrder(memberId: number, orderId: number): Promise<void> {
    // 查询待付款订单
    const order = await this.orderRepo.findOne({
      where: {
        id: orderId,
        status: OrderStatus.PENDING_PAYMENT,
        deleteStatus: 0,
      },
    });
    if (!order) return;

    // 验证归属权（memberId=0 表示系统调用，跳过验证）
    if (memberId !== 0 && order.memberId !== memberId) return;

    const operateMan = memberId === 0 ? '系统' : '用户';

    // 事务：订单状态 + 释放库存 + 恢复优惠券 + 返还积分 + 操作历史，全部原子操作
    await this.transactionService.run(async (manager) => {
      // 更新订单状态为已取消（WHERE 加状态条件防止并发支付时误取消已付款订单）
      const cancelResult = await manager
        .createQueryBuilder()
        .update(OrderEntity)
        .set({ status: OrderStatus.CANCELLED })
        .where('id = :id AND status = :status', {
          id: orderId,
          status: OrderStatus.PENDING_PAYMENT,
        })
        .execute();

      // affected = 0 说明订单已被支付或被其他操作修改，直接返回
      if (cancelResult.affected === 0) return;

      // 释放 SKU 锁定库存（并行化，释放操作无需悲观锁）
      const orderItems = await manager.findBy(OrderItemEntity, { orderId });
      await Promise.all(
        orderItems
          .filter((item) => (Number(item.productQuantity) || 0) > 0)
          .map((item) => {
            const releaseQty = Number(item.productQuantity) || 0;
            return manager
              .createQueryBuilder()
              .update(SkuStockEntity)
              .set({ lockStock: () => `lock_stock - :releaseQty` })
              .setParameter('releaseQty', releaseQty)
              .where('id = :skuId AND lock_stock >= :releaseQty', {
                skuId: item.productSkuId,
              })
              .execute();
          }),
      );

      // 恢复优惠券状态
      if (order.couponId) {
        await this.updateCouponStatus(
          manager,
          order.couponId,
          order.memberId,
          0,
        );
      }

      // 返还积分
      if (order.useIntegration && order.useIntegration > 0) {
        await manager
          .createQueryBuilder()
          .update(MemberEntity)
          .set({ integration: () => `integration + :restoreIntegration` })
          .setParameter('restoreIntegration', order.useIntegration)
          .where('id = :id', {
            id: order.memberId,
          })
          .execute();
      }

      // 记录操作历史
      await manager.save(OrderOperateHistoryEntity, {
        orderId,
        operateMan,
        orderStatus: OrderStatus.CANCELLED,
        note: memberId === 0 ? '超时未支付，系统自动取消' : '用户取消订单',
        createTime: new Date(),
      });
    });
  }

  /**
   * 确认收货
   * 迁移自 OmsPortalOrderServiceImpl.confirmReceiveOrder()
   */
  async confirmReceive(memberId: number, orderId: number): Promise<void> {
    const order = await this.orderRepo.findOneBy({ id: orderId });
    if (!order) {
      throw new BadRequestException('订单不存在');
    }
    if (order.memberId !== memberId) {
      throw new BadRequestException('不能确认他人订单！');
    }
    if (order.status !== OrderStatus.SHIPPING) {
      throw new BadRequestException('该订单还未发货！');
    }

    await this.transactionService.run(async (manager) => {
      // CAS 保护：WHERE 带 status 条件，防止并发请求重复发放积分
      const updateResult = await manager
        .createQueryBuilder()
        .update(OrderEntity)
        .set({
          status: OrderStatus.COMPLETED,
          confirmStatus: 1,
          receiveTime: new Date(),
        })
        .where('id = :id AND status = :expectedStatus', {
          id: orderId,
          expectedStatus: OrderStatus.SHIPPING,
        })
        .execute();

      if (updateResult.affected === 0) {
        // 已被其他请求处理，跳过积分发放
        return;
      }

      // 发放积分和成长值到会员账户
      const giftIntegration = Number(order.integration) || 0;
      const giftGrowth = Number(order.growth) || 0;
      if (giftIntegration > 0 || giftGrowth > 0) {
        await manager
          .createQueryBuilder()
          .update(MemberEntity)
          .set({
            integration: () => `integration + :giftIntegration`,
            growth: () => `growth + :giftGrowth`,
          })
          .setParameter('giftIntegration', giftIntegration)
          .setParameter('giftGrowth', giftGrowth)
          .where('id = :memberId', { memberId })
          .execute();
      }

      // 记录操作历史
      await manager.save(OrderOperateHistoryEntity, {
        orderId,
        operateMan: '用户',
        orderStatus: OrderStatus.COMPLETED,
        note: '确认收货',
        createTime: new Date(),
      });
    });
  }

  /**
   * 用户订单列表（分页）
   * 迁移自 OmsPortalOrderServiceImpl.list()
   */
  async memberList(
    memberId: number,
    status: number,
    query: PageQueryDto,
  ): Promise<PageResult<any>> {
    // 构建查询条件
    const qb = this.orderRepo
      .createQueryBuilder('order')
      .where('order.memberId = :memberId AND order.deleteStatus = 0', {
        memberId,
      })
      .orderBy('order.createdAt', 'DESC')
      .skip((query.page - 1) * query.limit)
      .take(query.limit);

    if (status !== -1) {
      qb.andWhere('order.status = :status', { status });
    }

    const [orderList, total] = await qb.getManyAndCount();

    if (orderList.length === 0) {
      return PageResult.of([], total, query);
    }

    // 批量查询 order_items
    const orderIds = orderList.map((o) => o.id);
    const allOrderItems = await this.orderItemRepo.findBy({
      orderId: In(orderIds),
    });

    // 关联到各订单
    const orderDetailList = orderList.map((order) => ({
      ...order,
      orderItemList: allOrderItems.filter((item) => item.orderId === order.id),
    }));

    return PageResult.of(orderDetailList, total, query);
  }

  /**
   * 自动取消超时未支付订单（BullMQ 任务调用）
   */
  async autoCancelIfUnpaid(orderId: number): Promise<void> {
    const order = await this.orderRepo.findOne({
      where: {
        id: orderId,
        status: OrderStatus.PENDING_PAYMENT,
        deleteStatus: 0,
      },
    });
    if (!order) return;

    // 系统取消，memberId=0 跳过归属权验证
    await this.cancelOrder(0, orderId);
  }

  /**
   * 获取购物车促销信息列表
   * 迁移自 OmsCartItemServiceImpl.listPromotion()
   * 供前端购物车页展示折后价、前端结算时生成确认单使用
   */
  async listCartPromotion(
    memberId: number,
    cartIds?: number[],
  ): Promise<CartPromotionItem[]> {
    const where: Record<string, any> = { memberId };
    if (cartIds && cartIds.length > 0) {
      where.id = In(cartIds);
    }
    const cartItems = await this.cartItemRepo.find({ where });
    return this.calcCartPromotion(cartItems);
  }

  /**
   * 用户删除订单（软删除，仅允许删除已完成或已取消的订单）
   * 迁移自 OmsPortalOrderServiceImpl.deleteOrder()
   */
  async deleteOrder(memberId: number, orderId: number): Promise<void> {
    const order = await this.orderRepo.findOne({
      where: { id: orderId, memberId },
    });
    if (!order) throw new NotFoundException('订单不存在');
    if (
      order.status !== OrderStatus.COMPLETED &&
      order.status !== OrderStatus.CANCELLED
    ) {
      throw new BadRequestException('只能删除已完成或已取消的订单');
    }
    await this.orderRepo.update({ id: orderId }, { deleteStatus: 1 });
  }

  // ============ 私有辅助方法 ============

  /**
   * 构建无优惠的促销条目
   */
  private buildNoReducePromotionItem(
    item: CartItemEntity,
    skuStock: SkuStockEntity | null,
    giftPoint: number,
    giftGrowth: number,
  ): CartPromotionItem {
    const originalPrice = skuStock
      ? Number(skuStock.price)
      : Number(item.productPrice);
    const realStock = skuStock ? skuStock.stock - skuStock.lockStock : 0;

    return {
      id: item.id,
      productId: item.productId,
      productSkuId: item.productSkuId,
      productName: item.productName,
      productPic: item.productPic,
      productAttr: item.productAttr,
      productBrand: item.productBrand ?? '',
      productSn: item.productSn ?? '',
      price: originalPrice,
      quantity: item.productQuantity,
      productQuantity: item.productQuantity,
      productSkuCode: skuStock?.skuCode ?? '',
      productCategoryId: item.productCategoryId,
      promotionMessage: '无优惠',
      reduceAmount: 0,
      realStock,
      integration: giftPoint,
      growth: giftGrowth,
    };
  }

  /**
   * 根据购买数量获取满足条件的阶梯优惠（从大到小找第一个 count >= ladder.count）
   */
  private getMatchedLadder(
    count: number,
    ladderList: ProductLadderEntity[],
  ): ProductLadderEntity | null {
    const sorted = [...ladderList].sort((a, b) => b.count - a.count);
    for (const ladder of sorted) {
      if (count >= ladder.count) {
        return ladder;
      }
    }
    return null;
  }

  /**
   * 根据总金额获取满足条件的满减规则（从大到小找第一个 totalAmount >= fullPrice）
   */
  private getMatchedFullReduction(
    totalAmount: number,
    fullReductionList: ProductFullReductionEntity[],
  ): ProductFullReductionEntity | null {
    const sorted = [...fullReductionList].sort(
      (a, b) => Number(b.fullPrice) - Number(a.fullPrice),
    );
    for (const fr of sorted) {
      if (totalAmount >= Number(fr.fullPrice)) {
        return fr;
      }
    }
    return null;
  }

  /**
   * 生成订单号：yyyyMMdd + 2位sourceType + 2位payType + Redis INCR(6位)
   */
  private async generateOrderSn(
    sourceType: number,
    payType: number,
  ): Promise<string> {
    const now = new Date();
    const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const key = CACHE_KEYS.orderId(date);

    let increment: number;
    try {
      // 直接使用 ioredis 客户端执行 INCR，保证原子性和全局唯一性
      increment = await this.redisClient.incr(key);
      // 首次创建时设置 48 小时过期，防止历史 Key 永久堆积
      if (increment === 1) {
        await this.redisClient.expire(key, 48 * 60 * 60);
      }
    } catch (err) {
      // Redis 不可用时降级为随机序号，记录 warn 级别日志
      this.logger.warn(
        `订单号计数器 Redis 不可用，降级为随机序号: ${(err as Error).message}`,
      );
      increment = Math.floor(Math.random() * 900000) + 100000;
    }

    const paddedIncrement = String(increment).padStart(6, '0');
    return `${date}${String(sourceType).padStart(2, '0')}${String(payType).padStart(2, '0')}${paddedIncrement}`;
  }

  /**
   * 锁定库存：先用 SELECT ... FOR UPDATE 加行锁，再更新 lock_stock
   * 按 skuId 升序加锁，防止死锁；同一事务内执行，确保原子性
   */
  private async lockStock(
    manager: EntityManager,
    cartPromotionItemList: CartPromotionItem[],
  ): Promise<void> {
    // 按 skuId 升序排列，固定加锁顺序防止死锁
    const sorted = [...cartPromotionItemList].sort(
      (a, b) => a.productSkuId - b.productSkuId,
    );

    for (const item of sorted) {
      const qty = Number(item.quantity);
      if (!qty || qty <= 0) {
        throw new BadRequestException(`商品「${item.productName}」数量无效`);
      }

      // 悲观锁：SELECT ... FOR UPDATE
      const sku = await manager
        .createQueryBuilder(SkuStockEntity, 'sku')
        .setLock('pessimistic_write')
        .where('sku.id = :skuId', { skuId: item.productSkuId })
        .getOne();

      if (!sku) {
        throw new BadRequestException(`商品「${item.productName}」SKU 不存在`);
      }

      const available = sku.stock - sku.lockStock;
      if (available < qty) {
        throw new BadRequestException(
          `商品「${item.productName}」库存不足（可用: ${available}，需要: ${qty}）`,
        );
      }

      // 更新锁定库存
      await manager
        .createQueryBuilder()
        .update(SkuStockEntity)
        .set({ lockStock: () => `lock_stock + :addQty` })
        .setParameter('addQty', qty)
        .where('id = :skuId', { skuId: item.productSkuId })
        .execute();
    }
  }

  /**
   * 计算可用积分抵扣金额
   * 迁移自 OmsPortalOrderServiceImpl.getUseIntegrationAmount()
   */
  private async calcUsableIntegrationAmount(
    useIntegration: number,
    totalAmount: number,
    member: MemberEntity,
    hasCoupon: boolean,
  ): Promise<number> {
    // 检查积分余额
    if (useIntegration > (member.integration ?? 0)) {
      return 0;
    }

    const setting = await this.integrationConsumeSettingRepo.findOneBy({
      id: 1,
    });
    if (!setting) return 0;

    // 是否可与优惠券共用
    if (hasCoupon && setting.couponStatus === 0) {
      return 0;
    }

    // 是否达到最低使用门槛
    if (useIntegration < setting.useUnit) {
      return 0;
    }

    // 积分抵扣金额 = useIntegration / useUnit（每 useUnit 积分抵扣 1 元），四舍五入到分
    const integrationAmount =
      Math.round((useIntegration / setting.useUnit) * 100) / 100;

    // 是否超过订单最高抵用百分比，超过则按上限值返回
    const maxPercent = setting.maxPercentPerOrder / 100;
    const maxAmount = Math.round(totalAmount * maxPercent * 100) / 100;
    if (integrationAmount > maxAmount) {
      return maxAmount;
    }

    return integrationAmount;
  }

  /**
   * 获取该用户指定优惠券的可用详情
   */
  private async getUsableCoupon(
    memberId: number,
    couponId: number,
    cartPromotionItemList: CartPromotionItem[],
  ): Promise<CouponHistoryDetail | null> {
    const couponHistory = await this.couponHistoryRepo.findOne({
      where: { memberId, couponId, useStatus: 0 },
    });
    if (!couponHistory) return null;

    const coupon = await this.couponRepo.findOneBy({ id: couponId });
    if (!coupon) return null;

    // 验证满足最低消费
    const totalAmount = cartPromotionItemList.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    if (Number(coupon.minPoint) > totalAmount) return null;

    // 查询关联关系
    const productRelationList = await this.couponProductRelRepo.findBy({
      couponId,
    });
    const categoryRelationList = await this.couponCategoryRelRepo.findBy({
      couponId,
    });

    return { couponHistory, coupon, productRelationList, categoryRelationList };
  }

  /**
   * 处理优惠券抵扣金额分摊到各 orderItem
   * 迁移自 OmsPortalOrderServiceImpl.handleCouponAmount()
   */
  private handleCouponAmount(
    orderItems: Partial<OrderItemEntity>[],
    couponDetail: CouponHistoryDetail,
  ): void {
    const { coupon, productRelationList, categoryRelationList } = couponDetail;
    const couponAmount = Number(coupon.amount);

    if (coupon.useType === 0) {
      // 全场通用：按价格比例分摊
      this.calcPerCouponAmount(orderItems, couponAmount);
    } else if (coupon.useType === 1) {
      // 指定分类
      const categoryIds = categoryRelationList.map((r) => r.productCategoryId);
      const eligibleItems = orderItems.filter((item) =>
        categoryIds.includes(item.productCategoryId!),
      );
      const ineligibleItems = orderItems.filter(
        (item) => !categoryIds.includes(item.productCategoryId!),
      );
      ineligibleItems.forEach((item) => {
        item.couponAmount = String(0);
      });
      this.calcPerCouponAmount(eligibleItems, couponAmount);
    } else if (coupon.useType === 2) {
      // 指定商品
      const productIds = productRelationList.map((r) => r.productId);
      const eligibleItems = orderItems.filter((item) =>
        productIds.includes(item.productId!),
      );
      const ineligibleItems = orderItems.filter(
        (item) => !productIds.includes(item.productId!),
      );
      ineligibleItems.forEach((item) => {
        item.couponAmount = String(0);
      });
      this.calcPerCouponAmount(eligibleItems, couponAmount);
    }
  }

  /**
   * 对可用商品列表按价格比例分摊优惠券金额
   * 迁移自 OmsPortalOrderServiceImpl.calcPerCouponAmount()
   */
  private calcPerCouponAmount(
    orderItems: Partial<OrderItemEntity>[],
    couponAmount: number,
  ): void {
    const totalAmount = orderItems.reduce(
      (sum, item) =>
        sum + Number(item.productPrice ?? 0) * (item.productQuantity ?? 0),
      0,
    );
    if (totalAmount <= 0) return;

    // 按商品价格比例分摊优惠券金额（最后一项用补差法，避免浮点精度误差）
    let distributedCoupon = 0;
    for (let i = 0; i < orderItems.length; i++) {
      const item = orderItems[i];
      if (i === orderItems.length - 1) {
        item.couponAmount = String(
          Math.round((couponAmount - distributedCoupon) * 100) / 100,
        );
      } else {
        const perAmount =
          Math.round(
            (Number(item.productPrice ?? 0) / totalAmount) * couponAmount * 100,
          ) / 100;
        item.couponAmount = String(perAmount);
        distributedCoupon += perAmount;
      }
    }
  }

  /**
   * 更新优惠券使用状态
   * @param useStatus 0->未使用；1->已使用
   */
  private async updateCouponStatus(
    manager: EntityManager,
    couponId: number,
    memberId: number,
    useStatus: number,
  ): Promise<void> {
    if (!couponId) return;

    // 查找当前为反向状态的记录（若设为1则找状态为0的，反之亦然）
    const currentStatus = useStatus === 1 ? 0 : 1;
    const couponHistory = await manager.findOne(CouponHistoryEntity, {
      where: { memberId, couponId, useStatus: currentStatus },
    });

    if (!couponHistory) {
      // 使用优惠券时找不到可用记录，说明已被并发使用或状态异常
      if (useStatus === 1) {
        throw new BadRequestException('优惠券已被使用或不可用');
      }
      // 取消使用时找不到已使用记录，静默跳过（幂等）
      return;
    }

    await manager
      .createQueryBuilder()
      .update(CouponHistoryEntity)
      .set({
        useStatus,
        useTime: new Date(),
      })
      .where('id = :id', { id: couponHistory.id })
      .execute();

    // 同步更新优惠券的已使用数量
    if (useStatus === 1) {
      await manager.increment(CouponEntity, { id: couponId }, 'useCount', 1);
    } else if (useStatus === 0) {
      await manager.decrement(CouponEntity, { id: couponId }, 'useCount', 1);
    }
  }
}
