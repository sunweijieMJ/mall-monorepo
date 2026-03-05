import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ProductAttrEntity,
  ProductAttrCategoryEntity,
} from './infrastructure/persistence/relational/entities/product-attr.entity';
import { ProductAttrService } from './product-attr.service';
import {
  ProductAttrController,
  ProductAttrCategoryController,
} from './product-attr.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductAttrEntity, ProductAttrCategoryEntity]),
  ],
  controllers: [ProductAttrController, ProductAttrCategoryController],
  providers: [ProductAttrService],
  exports: [ProductAttrService],
})
export class ProductAttrModule {}
