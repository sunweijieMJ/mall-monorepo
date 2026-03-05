import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HomeService } from './home.service';
import { HomeController } from './home.controller';
import { HomeAdvertiseEntity } from '@/modules/sms/home-content/infrastructure/persistence/relational/entities/home-advertise.entity';
import { HomeBrandEntity } from '@/modules/sms/home-content/infrastructure/persistence/relational/entities/home-brand.entity';
import { HomeNewProductEntity } from '@/modules/sms/home-content/infrastructure/persistence/relational/entities/home-new-product.entity';
import { HomeHotProductEntity } from '@/modules/sms/home-content/infrastructure/persistence/relational/entities/home-content.entity';
import { HomeRecommendSubjectEntity } from '@/modules/sms/home-content/infrastructure/persistence/relational/entities/home-recommend-subject.entity';
import {
  FlashPromotionEntity,
  FlashProductRelationEntity,
  FlashSessionEntity,
} from '@/modules/sms/flash-promotion/infrastructure/persistence/relational/entities/flash-promotion.entity';
import { ProductEntity } from '@/modules/pms/product/infrastructure/persistence/relational/entities/product.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      HomeAdvertiseEntity,
      HomeBrandEntity,
      HomeNewProductEntity,
      HomeHotProductEntity,
      HomeRecommendSubjectEntity,
      FlashPromotionEntity,
      FlashSessionEntity,
      FlashProductRelationEntity,
      ProductEntity,
    ]),
  ],
  controllers: [HomeController],
  providers: [HomeService],
})
export class PortalHomeModule {}
