import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import { TransactionService } from '@/infrastructure/database/transaction/transaction.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
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
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
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
  async detail(id: number): Promise<
    OrderEntity & {
      orderItemList: OrderItemEntity[];
      historyList: OrderOperateHistoryEntity[];
    }
  > {
    const order = await this.orderRepo.findOneBy({ id });
    if (!order) throw new Error(`订单 ${id} 不存在`);

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
    for (const item of deliveryList) {
      await this.orderRepo
        .createQueryBuilder()
        .update()
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

      const history = this.historyRepo.create({
        orderId: item.orderId,
        operateMan: '后台管理员',
        orderStatus: OrderStatus.SHIPPING,
        note: '完成发货',
        createTime: new Date(),
      });
      await this.historyRepo.save(history);
    }
  }

  /**
   * 关闭订单
   * 迁移自 OmsOrderServiceImpl.close()
   */
  async close(ids: number[], note: string): Promise<void> {
    await this.orderRepo
      .createQueryBuilder()
      .update()
      .set({ status: OrderStatus.CLOSED })
      .where('id IN (:...ids) AND deleteStatus = 0', { ids })
      .execute();

    const histories = ids.map((orderId) =>
      this.historyRepo.create({
        orderId,
        operateMan: '后台管理员',
        orderStatus: OrderStatus.CLOSED,
        note: `订单关闭:${note}`,
        createTime: new Date(),
      }),
    );
    await this.historyRepo.save(histories);
  }

  /**
   * 修改收货人信息
   * 迁移自 OmsOrderServiceImpl.updateReceiverInfo()
   */
  async updateReceiverInfo(dto: UpdateReceiverInfoDto): Promise<void> {
    const { orderId, status, ...receiverFields } = dto;

    await this.orderRepo
      .createQueryBuilder()
      .update()
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

    const history = this.historyRepo.create({
      orderId,
      operateMan: '后台管理员',
      orderStatus: status,
      note: '修改收货人信息',
      createTime: new Date(),
    });
    await this.historyRepo.save(history);
  }

  /**
   * 修改费用信息
   * 迁移自 OmsOrderServiceImpl.updateMoneyInfo()
   */
  async updateMoneyInfo(dto: UpdateMoneyInfoDto): Promise<void> {
    const { orderId, status, freightAmount, discountAmount } = dto;

    const updateFields: Partial<OrderEntity> = { freightAmount };
    if (discountAmount !== undefined) {
      updateFields.promotionAmount = discountAmount;
    }

    await this.orderRepo
      .createQueryBuilder()
      .update()
      .set(updateFields)
      .where('id = :id', { id: orderId })
      .execute();

    const history = this.historyRepo.create({
      orderId,
      operateMan: '后台管理员',
      orderStatus: status,
      note: '修改费用信息',
      createTime: new Date(),
    });
    await this.historyRepo.save(history);
  }

  /**
   * 修改订单备注
   * 迁移自 OmsOrderServiceImpl.updateNote()
   */
  async updateNote(id: number, note: string, status: number): Promise<void> {
    await this.orderRepo
      .createQueryBuilder()
      .update()
      .set({ note })
      .where('id = :id', { id })
      .execute();

    const history = this.historyRepo.create({
      orderId: id,
      operateMan: '后台管理员',
      orderStatus: status,
      note: `修改备注信息：${note}`,
      createTime: new Date(),
    });
    await this.historyRepo.save(history);
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
          const originalPrice = skuStock
            ? parseFloat(skuStock.price as any)
            : 0;
          const promotionPrice = skuStock?.promotionPrice
            ? parseFloat(skuStock.promotionPrice as any)
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
          const discount = parseFloat(matchedLadder.discount as any);
          const message = `打折优惠：满${matchedLadder.count}件，打${(discount * 10).toFixed(1)}折`;

          for (const item of itemList) {
            const skuStock = productSkuList.find(
              (s) => s.id === item.productSkuId,
            );
            const originalPrice = skuStock
              ? parseFloat(skuStock.price as any)
              : 0;
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
          const price = skuStock ? parseFloat(skuStock.price as any) : 0;
          totalAmount += price * item.productQuantity;
        }

        const matchedFullReduction = this.getMatchedFullReduction(
          totalAmount,
          productFullReductionList,
        );

        if (matchedFullReduction) {
          const reducePrice = parseFloat(
            matchedFullReduction.reducePrice as any,
          );
          const message = `满减优惠：满${matchedFullReduction.fullPrice}元，减${matchedFullReduction.reducePrice}元`;

          for (const item of itemList) {
            const skuStock = productSkuList.find(
              (s) => s.id === item.productSkuId,
            );
            const originalPrice = skuStock
              ? parseFloat(skuStock.price as any)
              : 0;
            // (商品原价 / 该商品总金额) * 满减金额
            const reduceAmount =
              totalAmount > 0 ? (originalPrice / totalAmount) * reducePrice : 0;
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
            item !== null &&
            parseFloat(item.coupon.minPoint as any) <= totalAmount,
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
        productPrice: promo.price,
        productQuantity: promo.quantity,
        productSkuId: promo.productSkuId,
        productSkuCode: promo.productSkuCode,
        productCategoryId: promo.productCategoryId,
        promotionAmount: promo.reduceAmount,
        promotionName: promo.promotionMessage,
        giftIntegration: promo.integration,
        giftGrowth: promo.growth,
        couponAmount: 0,
        integrationAmount: 0,
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
    if (dto.useIntegration && dto.useIntegration > 0) {
      const totalProductAmount = orderItems.reduce(
        (sum, item) =>
          sum + (item.productPrice ?? 0) * (item.productQuantity ?? 0),
        0,
      );
      const integrationAmount = await this.calcUsableIntegrationAmount(
        dto.useIntegration,
        totalProductAmount,
        member!,
        !!dto.couponId,
      );
      if (integrationAmount <= 0) {
        throw new BadRequestException('积分不可用');
      }
      // 按商品价格比例分摊积分抵扣金额
      for (const item of orderItems) {
        const perAmount =
          totalProductAmount > 0
            ? ((item.productPrice ?? 0) / totalProductAmount) *
              integrationAmount
            : 0;
        item.integrationAmount = perAmount;
      }
    }

    // 6. 计算每个 orderItem 的实付金额
    for (const item of orderItems) {
      item.realAmount =
        (item.productPrice ?? 0) -
        (item.promotionAmount ?? 0) -
        (item.couponAmount ?? 0) -
        (item.integrationAmount ?? 0);
    }

    // 8. 构建订单主体
    const address = await this.memberAddressRepo.findOneBy({
      id: dto.memberReceiveAddressId,
    });
    if (!address) {
      throw new BadRequestException('收货地址不存在');
    }

    // 计算各金额
    const totalAmount = orderItems.reduce(
      (sum, item) =>
        sum + (item.productPrice ?? 0) * (item.productQuantity ?? 0),
      0,
    );
    const promotionAmount = orderItems.reduce(
      (sum, item) =>
        sum + (item.promotionAmount ?? 0) * (item.productQuantity ?? 0),
      0,
    );
    const couponAmount = dto.couponId
      ? orderItems.reduce(
          (sum, item) =>
            sum + (item.couponAmount ?? 0) * (item.productQuantity ?? 0),
          0,
        )
      : 0;
    const integrationAmount =
      dto.useIntegration && dto.useIntegration > 0
        ? orderItems.reduce(
            (sum, item) =>
              sum + (item.integrationAmount ?? 0) * (item.productQuantity ?? 0),
            0,
          )
        : 0;
    const payAmount =
      totalAmount + 0 - promotionAmount - couponAmount - integrationAmount;

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
      totalAmount,
      payAmount,
      freightAmount: 0,
      promotionAmount,
      couponAmount,
      integrationAmount,
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
      if (safeUseIntegration > 0 && member) {
        await manager
          .createQueryBuilder()
          .update(MemberEntity)
          .set({ integration: () => `integration - ${safeUseIntegration}` })
          .where('id = :id AND integration >= :useIntegration', {
            id: memberId,
            useIntegration: safeUseIntegration,
          })
          .execute();
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
      console.error(
        `[OrderService] BullMQ 入队失败，orderId=${savedOrder.id}`,
        e,
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
  async paySuccess(orderId: number, payType: number): Promise<void> {
    // 订单状态更新 + 库存扣减必须在同一事务中，避免部分失败导致数据不一致
    await this.transactionService.run(async (manager) => {
      // 更新订单状态
      const updateResult = await manager
        .createQueryBuilder()
        .update(OrderEntity)
        .set({
          status: OrderStatus.PAID,
          paymentTime: new Date(),
          payType,
        })
        .where('id = :id AND status = :status AND deleteStatus = 0', {
          id: orderId,
          status: OrderStatus.PENDING_PAYMENT,
        })
        .execute();

      if (updateResult.affected === 0) {
        throw new BadRequestException('订单不存在或订单状态不是未支付！');
      }

      // 扣减真实库存（stock - qty, lock_stock - qty）
      const orderItems = await manager.findBy(OrderItemEntity, { orderId });
      for (const item of orderItems) {
        const qty = Number(item.productQuantity);
        await manager
          .createQueryBuilder()
          .update(SkuStockEntity)
          .set({
            stock: () => `stock - ${qty}`,
            lockStock: () => `lock_stock - ${qty}`,
          })
          .where('id = :skuId AND lock_stock >= :qty', {
            skuId: item.productSkuId,
            qty,
          })
          .execute();
      }
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

    // 更新订单状态为已取消
    await this.orderRepo
      .createQueryBuilder()
      .update()
      .set({ status: OrderStatus.CANCELLED })
      .where('id = :id', { id: orderId })
      .execute();

    // 释放 SKU 锁定库存
    const orderItems = await this.orderItemRepo.findBy({ orderId });
    for (const item of orderItems) {
      await this.skuStockRepo
        .createQueryBuilder()
        .update()
        .set({
          lockStock: () => `lock_stock - ${item.productQuantity}`,
        })
        .where('id = :skuId AND lock_stock >= :qty', {
          skuId: item.productSkuId,
          qty: item.productQuantity,
        })
        .execute();
    }

    // 恢复优惠券状态
    if (order.couponId) {
      // 使用 couponHistoryRepo.manager 获取默认 EntityManager，避免直接依赖 DataSource
      await this.updateCouponStatus(
        this.couponHistoryRepo.manager,
        order.couponId,
        order.memberId,
        0,
      );
    }

    // 返还积分
    if (order.useIntegration && order.useIntegration > 0) {
      await this.memberRepo
        .createQueryBuilder()
        .update()
        .set({
          integration: () => `integration + ${order.useIntegration}`,
        })
        .where('id = :id', { id: order.memberId })
        .execute();
    }
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

    await this.orderRepo
      .createQueryBuilder()
      .update()
      .set({
        status: OrderStatus.COMPLETED,
        confirmStatus: 1,
        receiveTime: new Date(),
      })
      .where('id = :id', { id: orderId })
      .execute();
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
      ? parseFloat(skuStock.price as any)
      : parseFloat(item.productPrice as any);
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
      (a, b) => parseFloat(b.fullPrice as any) - parseFloat(a.fullPrice as any),
    );
    for (const fr of sorted) {
      if (totalAmount >= parseFloat(fr.fullPrice as any)) {
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
    const key = `mall:orderId:${date}`;

    // 通过底层 Redis 客户端执行 INCR
    const redisStore = (this.cacheManager as any).store;
    const redisClient = redisStore.client;
    const increment: number = await redisClient.incr(key);

    const incrementStr = String(increment);
    const paddedIncrement =
      incrementStr.length <= 6 ? incrementStr.padStart(6, '0') : incrementStr;

    return `${date}${String(sourceType).padStart(2, '0')}${String(payType).padStart(2, '0')}${paddedIncrement}`;
  }

  /**
   * 锁定库存：UPDATE sku_stock SET lock_stock=lock_stock+qty WHERE id=skuId AND stock-lock_stock>=qty
   * 接受 EntityManager 以便在事务中执行，确保库存锁定与订单插入的原子性
   */
  private async lockStock(
    manager: EntityManager,
    cartPromotionItemList: CartPromotionItem[],
  ): Promise<void> {
    for (const item of cartPromotionItemList) {
      const result = await manager
        .createQueryBuilder()
        .update(SkuStockEntity)
        .set({
          lockStock: () => `lock_stock + ${item.quantity}`,
        })
        .where('id = :skuId AND (stock - lock_stock) >= :qty', {
          skuId: item.productSkuId,
          qty: item.quantity,
        })
        .execute();

      if (result.affected === 0) {
        throw new BadRequestException(
          `商品「${item.productName}」库存不足，无法下单`,
        );
      }
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

    // 积分抵扣金额 = useIntegration / useUnit（每 useUnit 积分抵扣 1 元）
    const integrationAmount = useIntegration / setting.useUnit;

    // 是否超过订单最高抵用百分比
    const maxPercent = setting.maxPercentPerOrder / 100;
    if (integrationAmount > totalAmount * maxPercent) {
      return 0;
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
    if (parseFloat(coupon.minPoint as any) > totalAmount) return null;

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
    const couponAmount = parseFloat(coupon.amount as any);

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
        item.couponAmount = 0;
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
        item.couponAmount = 0;
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
        sum + (item.productPrice ?? 0) * (item.productQuantity ?? 0),
      0,
    );
    if (totalAmount <= 0) return;

    for (const item of orderItems) {
      // (商品价格 / 可用商品总价) * 优惠券面额
      item.couponAmount =
        ((item.productPrice ?? 0) / totalAmount) * couponAmount;
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

    if (couponHistory) {
      await manager
        .createQueryBuilder()
        .update(CouponHistoryEntity)
        .set({
          useStatus,
          useTime: new Date(),
        })
        .where('id = :id', { id: couponHistory.id })
        .execute();
    }
  }
}
