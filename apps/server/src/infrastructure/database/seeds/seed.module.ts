import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import appConfig from '@/config/app.config';
import databaseConfig from '@/infrastructure/database/config/database.config';
import { TypeOrmConfigService } from '@/infrastructure/database/typeorm-config.service';
import { RoleSeedModule } from './role/role-seed.module';
import { MenuSeedModule } from './menu/menu-seed.module';
import { ResourceSeedModule } from './resource/resource-seed.module';
import { AdminSeedModule } from './admin/admin-seed.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig],
      envFilePath: ['.env'],
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),
    RoleSeedModule,
    MenuSeedModule,
    ResourceSeedModule,
    AdminSeedModule,
  ],
})
export class SeedModule {}
