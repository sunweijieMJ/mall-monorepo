import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartItemEntity } from './infrastructure/persistence/relational/entities/cart-item.entity';
import { SkuStockEntity } from '@/modules/pms/sku-stock/infrastructure/persistence/relational/entities/sku-stock.entity';
import { ProductEntity } from '@/modules/pms/product/infrastructure/persistence/relational/entities/product.entity';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { OrderModule } from '@/modules/oms/order/order.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CartItemEntity, SkuStockEntity, ProductEntity]),
    OrderModule,
  ],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}
