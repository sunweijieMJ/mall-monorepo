import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  AdminResourceEntity,
  AdminResourceCategoryEntity,
} from './infrastructure/persistence/relational/entities/admin-resource.entity';
import { RoleResourceRelationEntity } from '@/modules/ums/admin-role/infrastructure/persistence/relational/entities/role-resource-relation.entity';
import { AdminRoleRelationEntity } from '@/modules/ums/admin-user/infrastructure/persistence/relational/entities/admin-role-relation.entity';
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
      RoleResourceRelationEntity,
      AdminRoleRelationEntity,
    ]),
  ],
  controllers: [AdminResourceController, AdminResourceCategoryController],
  providers: [AdminResourceService],
  exports: [AdminResourceService],
})
export class AdminResourceModule {}
