import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  FlashPromotionEntity,
  FlashSessionEntity,
  FlashProductRelationEntity,
} from './infrastructure/persistence/relational/entities/flash-promotion.entity';
import { FlashPromotionService } from './flash-promotion.service';
import {
  FlashPromotionController,
  FlashSessionController,
  FlashProductRelationController,
} from './flash-promotion.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FlashPromotionEntity,
      FlashSessionEntity,
      FlashProductRelationEntity,
    ]),
  ],
  controllers: [
    FlashPromotionController,
    FlashSessionController,
    FlashProductRelationController,
  ],
  providers: [FlashPromotionService],
  exports: [FlashPromotionService],
})
export class FlashPromotionModule {}
