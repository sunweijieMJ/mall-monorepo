import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminRoleEntity } from './infrastructure/persistence/relational/entities/admin-role.entity';
import { AdminRoleService } from './admin-role.service';
import { AdminRoleController } from './admin-role.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AdminRoleEntity])],
  controllers: [AdminRoleController],
  providers: [AdminRoleService],
  exports: [AdminRoleService],
})
export class AdminRoleModule {}
