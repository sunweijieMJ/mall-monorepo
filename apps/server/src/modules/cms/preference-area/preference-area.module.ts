import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PreferenceAreaEntity } from './infrastructure/persistence/relational/entities/preference-area.entity';
import { PreferenceAreaProductRelationEntity } from './infrastructure/persistence/relational/entities/preference-area-product-relation.entity';
import { ProductEntity } from '@/modules/pms/product/infrastructure/persistence/relational/entities/product.entity';
import { PreferenceAreaService } from './preference-area.service';
import { PreferenceAreaController } from './preference-area.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PreferenceAreaEntity,
      PreferenceAreaProductRelationEntity,
      ProductEntity,
    ]),
  ],
  controllers: [PreferenceAreaController],
  providers: [PreferenceAreaService],
  exports: [PreferenceAreaService],
})
export class PreferenceAreaModule {}
