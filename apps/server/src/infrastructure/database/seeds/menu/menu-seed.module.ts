import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminMenuEntity } from '@/modules/ums/admin-menu/infrastructure/persistence/relational/entities/admin-menu.entity';
import { MenuSeedService } from './menu-seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([AdminMenuEntity])],
  providers: [MenuSeedService],
  exports: [MenuSeedService],
})
export class MenuSeedModule {}
