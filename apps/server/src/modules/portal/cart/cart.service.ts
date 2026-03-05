import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CartItemEntity } from './infrastructure/persistence/relational/entities/cart-item.entity';
import { SkuStockEntity } from '@/modules/pms/sku-stock/infrastructure/persistence/relational/entities/sku-stock.entity';
import { ProductEntity } from '@/modules/pms/product/infrastructure/persistence/relational/entities/product.entity';

/** 加入购物车的请求体 */
export interface AddCartDto {
  productId: number;
  productSkuId: number;
  quantity: number;
  /** 其他可选字段（商品名、规格等），如果不传则从数据库读取 */
  productName?: string;
  productPic?: string;
  productAttr?: string;
  productBrand?: string;
  productSn?: string;
  productSkuCode?: string;
}

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItemEntity)
    private readonly cartRepo: Repository<CartItemEntity>,
    @InjectRepository(SkuStockEntity)
    private readonly skuStockRepo: Repository<SkuStockEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepo: Repository<ProductEntity>,
  ) {}

  /**
   * 获取购物车列表，并标记库存不足的商品
   * deleteStatus=1 表示有效，deleteStatus=0 表示无效（库存不足时被标记）
   * @param memberId 会员 ID
   */
  async getCartList(memberId: number): Promise<CartItemEntity[]> {
    // 查询该会员的所有购物车商品（含库存不足的，前端自行区分）
    const items = await this.cartRepo.find({
      where: { memberId },
    });

    if (items.length === 0) return items;

    // 批量查询 SKU 库存，标记库存不足的商品
    const skuIds = items.map((i) => i.productSkuId).filter((id) => id != null);

    if (skuIds.length > 0) {
      const skuList = await this.skuStockRepo.find({
        where: { id: In(skuIds) },
      });
      const skuMap = new Map(skuList.map((s) => [s.id, s]));

      for (const item of items) {
        const sku = skuMap.get(item.productSkuId);
        if (sku) {
          // 可用库存 = 库存 - 锁定库存，若 <= 0 则标记为库存不足（deleteStatus=0）
          const available = (sku.stock ?? 0) - (sku.lockStock ?? 0);
          if (available <= 0) {
            item.deleteStatus = 0;
          }
        }
      }
    }

    return items;
  }

  /**
   * 加入购物车
   * 若相同会员+商品+SKU 已存在，则数量累加；否则创建新购物车条目
   * @param memberId 会员 ID
   * @param dto 加购信息
   */
  async add(memberId: number, dto: AddCartDto): Promise<CartItemEntity> {
    const { productId, productSkuId, quantity } = dto;

    // 查询是否已有相同 SKU 的购物车条目（deleteStatus=1 即有效）
    const existing = await this.cartRepo.findOne({
      where: { memberId, productId, productSkuId, deleteStatus: 1 },
    });

    if (existing) {
      // 已存在则数量累加
      existing.productQuantity += quantity;
      return this.cartRepo.save(existing);
    }

    // 查询 SKU 信息
    const sku = await this.skuStockRepo.findOne({
      where: { id: productSkuId },
    });
    if (!sku) {
      throw new NotFoundException(`SKU ${productSkuId} 不存在`);
    }

    // 查询商品信息
    const product = await this.productRepo.findOne({
      where: { id: productId },
    });
    if (!product) {
      throw new NotFoundException(`商品 ${productId} 不存在`);
    }

    // 构建新购物车条目
    const item = this.cartRepo.create({
      memberId,
      productId: product.id,
      productSkuId: sku.id,
      productName: dto.productName ?? product.name,
      productBrand: dto.productBrand ?? product.brandName,
      productSn: dto.productSn ?? product.productSn,
      productPic: dto.productPic ?? product.pic,
      productAttr: dto.productAttr ?? sku.spData,
      productPrice: sku.price,
      productQuantity: quantity,
      productCategoryId: product.productCategoryId,
      deleteStatus: 1,
    });

    return this.cartRepo.save(item);
  }

  /**
   * 修改购物车商品数量
   * 验证归属权后更新数量
   * @param memberId 会员 ID
   * @param id 购物车条目 ID
   * @param quantity 新数量
   */
  async updateQuantity(
    memberId: number,
    id: number,
    quantity: number,
  ): Promise<void> {
    // 验证该购物车条目归属于当前会员
    const item = await this.cartRepo.findOne({ where: { id, memberId } });
    if (!item) {
      throw new NotFoundException('购物车条目不存在或无权操作');
    }
    await this.cartRepo.update(id, { productQuantity: quantity });
  }

  /**
   * 删除购物车商品（硬删除，验证归属权）
   * @param memberId 会员 ID
   * @param ids 购物车条目 ID 数组
   */
  async delete(memberId: number, ids: number[]): Promise<void> {
    await this.cartRepo
      .createQueryBuilder()
      .delete()
      .where('id IN (:...ids) AND member_id = :memberId', { ids, memberId })
      .execute();
  }

  /**
   * 清空购物车
   * @param memberId 会员 ID
   */
  async clear(memberId: number): Promise<void> {
    await this.cartRepo.delete({ memberId });
  }

  /**
   * 获取有效购物车商品数量
   * @param memberId 会员 ID
   */
  async getCount(memberId: number): Promise<number> {
    // deleteStatus=1 表示有效商品
    return this.cartRepo.count({ where: { memberId, deleteStatus: 1 } });
  }

  /**
   * 获取购物车商品的规格信息（用于重新选择规格）
   * 迁移自 OmsCartItemServiceImpl.getCartProduct()
   * 返回商品主体信息 + 该商品所有 SKU 列表
   * @param productId 商品 ID
   */
  async getCartProduct(productId: number) {
    const product = await this.productRepo.findOne({
      where: { id: productId },
    });
    if (!product) throw new NotFoundException(`商品 ${productId} 不存在`);
    const skuList = await this.skuStockRepo.find({ where: { productId } });
    return { ...product, skuStockList: skuList };
  }

  /**
   * 修改购物车商品规格
   * 迁移自 OmsCartItemServiceImpl.updateAttr()
   * 若目标 SKU 已存在购物车条目则合并数量，否则更新当前条目的 SKU 信息
   * @param memberId 会员 ID
   * @param dto 含 id（原购物车条目）和 productSkuId（新 SKU）
   */
  async updateAttr(
    memberId: number,
    dto: { id: number; productSkuId: number },
  ): Promise<void> {
    const cartItem = await this.cartRepo.findOne({
      where: { id: dto.id, memberId },
    });
    if (!cartItem) throw new NotFoundException('购物车条目不存在或无权操作');

    const newSku = await this.skuStockRepo.findOne({
      where: { id: dto.productSkuId },
    });
    if (!newSku) throw new NotFoundException(`SKU ${dto.productSkuId} 不存在`);

    // 检查目标 SKU 可用库存是否充足
    const available = (newSku.stock ?? 0) - (newSku.lockStock ?? 0);
    if (available < cartItem.productQuantity) {
      throw new BadRequestException(
        `SKU ${dto.productSkuId} 可用库存不足（可用 ${available}，需要 ${cartItem.productQuantity}）`,
      );
    }

    // 检查目标 SKU 是否已存在同一商品的购物车条目
    const existingItem = await this.cartRepo.findOne({
      where: {
        memberId,
        productId: cartItem.productId,
        productSkuId: dto.productSkuId,
        deleteStatus: 1,
      },
    });

    if (existingItem && existingItem.id !== cartItem.id) {
      // 合并数量到已有条目
      existingItem.productQuantity += cartItem.productQuantity;
      await this.cartRepo.save(existingItem);
      await this.cartRepo.delete({ id: cartItem.id });
    } else {
      // 更新当前条目的 SKU 信息
      cartItem.productSkuId = newSku.id;
      cartItem.productPrice = newSku.price;
      cartItem.productAttr = newSku.spData ?? cartItem.productAttr;
      await this.cartRepo.save(cartItem);
    }
  }
}
