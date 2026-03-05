import { NestFactory } from '@nestjs/core';
import { SeedModule } from './seed.module';
import { RoleSeedService } from './role/role-seed.service';
import { MenuSeedService } from './menu/menu-seed.service';
import { ResourceSeedService } from './resource/resource-seed.service';
import { AdminSeedService } from './admin/admin-seed.service';

/**
 * 数据库种子执行脚本
 *
 * 执行顺序很重要：Role → Menu → Resource → Admin
 * 因为 Admin 需要关联 Role，菜单和资源是独立数据
 *
 * 用法: pnpm seed:run
 */
async function bootstrap() {
  const app = await NestFactory.create(SeedModule);

  // 按依赖顺序执行
  await app.get(RoleSeedService).run();
  await app.get(MenuSeedService).run();
  await app.get(ResourceSeedService).run();
  await app.get(AdminSeedService).run();

  await app.close();
  console.log('✅ 所有种子数据已初始化');
}

bootstrap();
