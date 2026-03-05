import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BrandEntity } from './infrastructure/persistence/relational/entities/brand.entity';
import { ProductEntity } from '@/modules/pms/product/infrastructure/persistence/relational/entities/product.entity';
import { BrandService } from './brand.service';
import { BrandController, PortalBrandController } from './brand.controller';

@Module({
  imports: [TypeOrmModule.forFeature([BrandEntity, ProductEntity])],
  controllers: [BrandController, PortalBrandController],
  providers: [BrandService],
  exports: [BrandService],
})
export class BrandModule {}
