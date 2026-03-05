import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  HomeAdvertiseEntity,
  HomeBrandEntity,
  HomeSubjectEntity,
  HomeNewProductEntity,
  HomeHotProductEntity,
} from './infrastructure/persistence/relational/entities/home-content.entity';
import { HomeContentService } from './home-content.service';
import {
  HomeAdvertiseController,
  HomeBrandController,
  HomeSubjectController,
  HomeNewProductController,
  HomeRecommendProductController,
} from './home-content.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      HomeAdvertiseEntity,
      HomeBrandEntity,
      HomeSubjectEntity,
      HomeNewProductEntity,
      HomeHotProductEntity,
    ]),
  ],
  controllers: [
    HomeAdvertiseController,
    HomeBrandController,
    HomeSubjectController,
    HomeNewProductController,
    HomeRecommendProductController,
  ],
  providers: [HomeContentService],
  exports: [HomeContentService],
})
export class HomeContentModule {}
