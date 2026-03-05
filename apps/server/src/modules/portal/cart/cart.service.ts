import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItemEntity } from './infrastructure/persistence/relational/entities/cart-item.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItemEntity)
    private readonly cartRepo: Repository<CartItemEntity>,
  ) {}

  /**
   * 获取购物车列表
   * TODO: 迁移自 OmsCartItemServiceImpl.list()
   *   - 查询当前会员购物车，标记库存不足/下架商品
   */
  async getCartList(memberId: number): Promise<CartItemEntity[]> {
    // TODO: implement - 关联校验商品状态、库存
    return this.cartRepo.find({ where: { memberId, deleteStatus: 1 } });
  }

  /**
   * 加入购物车
   * TODO: 迁移自 OmsCartItemServiceImpl.add()
   *   - 检查是否已有相同 SKU（有则数量累加）
   *   - 查询商品当前价格/图片/名称写入
   */
  async add(memberId: number, dto: any): Promise<CartItemEntity> {
    // TODO: implement
    throw new Error('TODO: CartService.add');
  }

  /**
   * 更新购物车商品数量
   * TODO: 迁移自 OmsCartItemServiceImpl.updateQuantity()
   */
  async updateQuantity(
    memberId: number,
    id: number,
    quantity: number,
  ): Promise<void> {
    // TODO: implement - 验证归属权
    await this.cartRepo.update(id, { productQuantity: quantity });
  }

  /**
   * 删除购物车商品
   * TODO: 迁移自 OmsCartItemServiceImpl.delete()
   */
  async delete(memberId: number, ids: number[]): Promise<void> {
    // TODO: implement - 验证归属权
    await this.cartRepo.delete(ids);
  }

  /**
   * 清空购物车
   * TODO: 迁移自 OmsCartItemServiceImpl.clear()
   */
  async clear(memberId: number): Promise<void> {
    // TODO: implement
    await this.cartRepo.delete({ memberId });
  }

  /** 获取购物车数量 */
  async getCount(memberId: number): Promise<number> {
    return this.cartRepo.count({ where: { memberId, deleteStatus: 1 } });
  }
}
