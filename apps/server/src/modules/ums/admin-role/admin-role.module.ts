import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminRoleEntity } from './infrastructure/persistence/relational/entities/admin-role.entity';
import { AdminRoleRelationEntity } from '@/modules/ums/admin-user/infrastructure/persistence/relational/entities/admin-role-relation.entity';
import { RoleMenuRelationEntity } from './infrastructure/persistence/relational/entities/role-menu-relation.entity';
import { RoleResourceRelationEntity } from './infrastructure/persistence/relational/entities/role-resource-relation.entity';
import { AdminMenuEntity } from '@/modules/ums/admin-menu/infrastructure/persistence/relational/entities/admin-menu.entity';
import { AdminResourceEntity } from '@/modules/ums/admin-resource/infrastructure/persistence/relational/entities/admin-resource.entity';
import { AdminRoleService } from './admin-role.service';
import { AdminRoleController } from './admin-role.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AdminRoleEntity,
      AdminRoleRelationEntity,
      RoleMenuRelationEntity,
      RoleResourceRelationEntity,
      AdminMenuEntity,
      AdminResourceEntity,
    ]),
  ],
  controllers: [AdminRoleController],
  providers: [AdminRoleService],
  exports: [AdminRoleService],
})
export class AdminRoleModule {}
