import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrefrenceAreaEntity } from './infrastructure/persistence/relational/entities/prefrence-area.entity';
import { PrefrenceAreaProductRelationEntity } from './infrastructure/persistence/relational/entities/prefrence-area-product-relation.entity';
import { ProductEntity } from '@/modules/pms/product/infrastructure/persistence/relational/entities/product.entity';
import { PrefrenceAreaService } from './prefrence-area.service';
import { PrefrenceAreaController } from './prefrence-area.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PrefrenceAreaEntity,
      PrefrenceAreaProductRelationEntity,
      ProductEntity,
    ]),
  ],
  controllers: [PrefrenceAreaController],
  providers: [PrefrenceAreaService],
  exports: [PrefrenceAreaService],
})
export class PrefrenceAreaModule {}
