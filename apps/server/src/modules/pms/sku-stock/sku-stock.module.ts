import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SkuStockEntity } from './infrastructure/persistence/relational/entities/sku-stock.entity';
import { SkuStockService } from './sku-stock.service';
import { SkuStockController } from './sku-stock.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SkuStockEntity])],
  controllers: [SkuStockController],
  providers: [SkuStockService],
  exports: [SkuStockService],
})
export class SkuStockModule {}
