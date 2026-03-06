import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderEntity } from '@/modules/oms/order/infrastructure/persistence/relational/entities/order.entity';
import { OrderModule } from '@/modules/oms/order/order.module';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { AlipayService } from './alipay.service';
import paymentConfig from './config/payment.config';

@Module({
  imports: [
    ConfigModule.forFeature(paymentConfig),
    TypeOrmModule.forFeature([OrderEntity]),
    OrderModule,
  ],
  controllers: [PaymentController],
  providers: [PaymentService, AlipayService],
  exports: [PaymentService],
})
export class PaymentModule {}
