import { EntityManager } from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import { SkuStockEntity } from './infrastructure/persistence/relational/entities/sku-stock.entity';

/**
 * 原子化扣减库存 — 使用 SQL 条件更新防止超卖
 *
 * @param manager EntityManager (事务内)
 * @param skuId SKU ID
 * @param quantity 扣减数量
 * @throws BadRequestException 库存不足
 */
export async function deductStock(
  manager: EntityManager,
  skuId: number,
  quantity: number,
): Promise<void> {
  const result = await manager
    .createQueryBuilder()
    .update(SkuStockEntity)
    .set({
      stock: () => `stock - ${quantity}`,
      lockStock: () => `lock_stock + ${quantity}`,
    })
    .where('id = :id AND stock >= :qty', { id: skuId, qty: quantity })
    .execute();

  if (result.affected === 0) {
    throw new BadRequestException(`SKU(${skuId}) 库存不足`);
  }
}

/**
 * 释放锁定库存（订单取消/超时时调用）
 */
export async function releaseStock(
  manager: EntityManager,
  skuId: number,
  quantity: number,
): Promise<void> {
  await manager
    .createQueryBuilder()
    .update(SkuStockEntity)
    .set({
      stock: () => `stock + ${quantity}`,
      lockStock: () => `GREATEST(lock_stock - ${quantity}, 0)`,
    })
    .where('id = :id', { id: skuId })
    .execute();
}
