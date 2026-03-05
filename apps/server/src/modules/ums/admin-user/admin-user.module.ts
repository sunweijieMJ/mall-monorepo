import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminUserEntity } from './infrastructure/persistence/relational/entities/admin-user.entity';
import { AdminRoleRelationEntity } from './infrastructure/persistence/relational/entities/admin-role-relation.entity';
import { AdminRoleEntity } from '@/modules/ums/admin-role/infrastructure/persistence/relational/entities/admin-role.entity';
import { AdminUserService } from './admin-user.service';
import { AdminUserController } from './admin-user.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AdminUserEntity,
      AdminRoleRelationEntity,
      AdminRoleEntity,
    ]),
  ],
  controllers: [AdminUserController],
  providers: [AdminUserService],
  exports: [AdminUserService],
})
export class AdminUserModule {}
