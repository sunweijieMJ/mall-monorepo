import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  AdminResourceEntity,
  AdminResourceCategoryEntity,
} from './infrastructure/persistence/relational/entities/admin-resource.entity';
import { AuthModule } from '@/core/auth/auth.module';
import { AdminResourceService } from './admin-resource.service';
import {
  AdminResourceController,
  AdminResourceCategoryController,
} from './admin-resource.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AdminResourceEntity,
      AdminResourceCategoryEntity,
    ]),
    AuthModule,
  ],
  controllers: [AdminResourceController, AdminResourceCategoryController],
  providers: [AdminResourceService],
  exports: [AdminResourceService],
})
export class AdminResourceModule {}
