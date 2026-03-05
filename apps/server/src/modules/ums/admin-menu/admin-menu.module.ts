import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminMenuEntity } from './infrastructure/persistence/relational/entities/admin-menu.entity';
import { AdminMenuService } from './admin-menu.service';
import { AdminMenuController } from './admin-menu.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AdminMenuEntity])],
  controllers: [AdminMenuController],
  providers: [AdminMenuService],
  exports: [AdminMenuService],
})
export class AdminMenuModule {}
