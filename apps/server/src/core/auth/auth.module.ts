import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AllConfigType } from '@/config/config.type';
import { AdminUserEntity } from '@/modules/ums/admin-user/infrastructure/persistence/relational/entities/admin-user.entity';
import { AdminLoginLogEntity } from '@/modules/ums/admin-user/infrastructure/persistence/relational/entities/admin-login-log.entity';
import { AdminRoleRelationEntity } from '@/modules/ums/admin-user/infrastructure/persistence/relational/entities/admin-role-relation.entity';
import { AdminRoleEntity } from '@/modules/ums/admin-role/infrastructure/persistence/relational/entities/admin-role.entity';
import { RoleMenuRelationEntity } from '@/modules/ums/admin-role/infrastructure/persistence/relational/entities/role-menu-relation.entity';
import { RoleResourceRelationEntity } from '@/modules/ums/admin-role/infrastructure/persistence/relational/entities/role-resource-relation.entity';
import { AdminResourceEntity } from '@/modules/ums/admin-resource/infrastructure/persistence/relational/entities/admin-resource.entity';
import { AdminMenuEntity } from '@/modules/ums/admin-menu/infrastructure/persistence/relational/entities/admin-menu.entity';
import { MemberEntity } from '@/modules/portal/member/infrastructure/persistence/relational/entities/member.entity';
import { MemberLevelEntity } from '@/modules/ums/member-level/infrastructure/persistence/relational/entities/member-level.entity';
import { SessionEntity } from './infrastructure/persistence/relational/entities/session.entity';
import { AuthService } from './auth.service';
import { AdminAuthController, PortalAuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ResourceGuard } from './guards/resource.guard';
import { AdminCacheService } from './services/admin-cache.service';

@Module({
  imports: [
    PassportModule,
    TypeOrmModule.forFeature([
      AdminUserEntity,
      AdminLoginLogEntity,
      AdminRoleRelationEntity,
      AdminRoleEntity,
      RoleMenuRelationEntity,
      RoleResourceRelationEntity,
      AdminResourceEntity,
      AdminMenuEntity,
      MemberEntity,
      MemberLevelEntity,
      SessionEntity,
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService<AllConfigType>) => ({
        secret: configService.getOrThrow('auth.secret', { infer: true }),
        signOptions: {
          expiresIn: configService.getOrThrow('auth.expires', { infer: true }),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AdminAuthController, PortalAuthController],
  providers: [
    AuthService,
    JwtStrategy,
    JwtRefreshStrategy,
    JwtAuthGuard,
    ResourceGuard,
    AdminCacheService,
  ],
  exports: [
    AuthService,
    JwtModule,
    JwtAuthGuard,
    ResourceGuard,
    AdminCacheService,
  ],
})
export class AuthModule {}
