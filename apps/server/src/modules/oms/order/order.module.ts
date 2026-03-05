import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderEntity } from './infrastructure/persistence/relational/entities/order.entity';
import { OrderService } from './order.service';
import {
  AdminOrderController,
  PortalOrderController,
} from './order.controller';

@Module({
  imports: [TypeOrmModule.forFeature([OrderEntity])],
  controllers: [AdminOrderController, PortalOrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
