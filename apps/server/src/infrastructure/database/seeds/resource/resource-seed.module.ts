import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  AdminResourceEntity,
  AdminResourceCategoryEntity,
} from '@/modules/ums/admin-resource/infrastructure/persistence/relational/entities/admin-resource.entity';
import { ResourceSeedService } from './resource-seed.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AdminResourceEntity,
      AdminResourceCategoryEntity,
    ]),
  ],
  providers: [ResourceSeedService],
  exports: [ResourceSeedService],
})
export class ResourceSeedModule {}
