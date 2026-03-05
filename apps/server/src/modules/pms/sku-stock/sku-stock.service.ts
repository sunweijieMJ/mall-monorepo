import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SkuStockEntity } from './infrastructure/persistence/relational/entities/sku-stock.entity';

@Injectable()
export class SkuStockService {
  constructor(
    @InjectRepository(SkuStockEntity)
    private readonly skuRepo: Repository<SkuStockEntity>,
  ) {}

  /** 查询 SKU 库存列表 - TODO: 迁移自 PmsSkuStockServiceImpl.getList() */
  async getList(
    productId: number,
    keyword?: string,
  ): Promise<SkuStockEntity[]> {
    // TODO: implement - 支持 skuCode 关键词搜索
    return this.skuRepo.find({ where: { productId } });
  }

  /** 批量更新 SKU 库存 - TODO: 迁移自 PmsSkuStockServiceImpl.update() */
  async update(
    productId: number,
    stocks: Partial<SkuStockEntity>[],
  ): Promise<void> {
    // TODO: implement - 批量 upsert（有 id 则更新，无 id 则插入）
    throw new Error('TODO: SkuStockService.update');
  }
}
