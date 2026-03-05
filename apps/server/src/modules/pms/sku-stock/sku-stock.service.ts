import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { SkuStockEntity } from './infrastructure/persistence/relational/entities/sku-stock.entity';

@Injectable()
export class SkuStockService {
  constructor(
    @InjectRepository(SkuStockEntity)
    private readonly skuRepo: Repository<SkuStockEntity>,
  ) {}

  async getList(
    productId: number,
    keyword?: string,
  ): Promise<SkuStockEntity[]> {
    const where: any = { productId };
    if (keyword) {
      where.skuCode = Like(`%${keyword}%`);
    }
    return this.skuRepo.find({ where });
  }

  async update(
    productId: number,
    stocks: Partial<SkuStockEntity>[],
  ): Promise<void> {
    // 过滤只属于该商品的 SKU
    const filtered = stocks.filter(
      (item) => !item.productId || item.productId === productId,
    );
    // 确保所有项都关联到此商品
    const entities = filtered.map((item) => ({
      ...item,
      productId,
    }));
    // save() 会自动根据有无 id 决定 insert 或 update
    await this.skuRepo.save(entities);
  }
}
