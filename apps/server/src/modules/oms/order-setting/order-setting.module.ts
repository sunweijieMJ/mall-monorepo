import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderSettingEntity } from './infrastructure/persistence/relational/entities/order-setting.entity';
import { OrderSettingService } from './order-setting.service';
import { OrderSettingController } from './order-setting.controller';

@Module({
  imports: [TypeOrmModule.forFeature([OrderSettingEntity])],
  controllers: [OrderSettingController],
  providers: [OrderSettingService],
})
export class OrderSettingModule {}
