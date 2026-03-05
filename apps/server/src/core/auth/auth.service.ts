import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import * as bcrypt from 'bcryptjs';

import { AllConfigType } from '@/config/config.type';
import { AdminLoginDto } from './dto/admin-login.dto';
import { RegisterAdminDto } from './dto/register-admin.dto';
import { PortalLoginDto, PortalRegisterDto } from './dto/portal-login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { JwtPayload } from './types/jwt-payload.type';

import { AdminUserEntity } from '@/modules/ums/admin-user/infrastructure/persistence/relational/entities/admin-user.entity';
import { AdminLoginLogEntity } from '@/modules/ums/admin-user/infrastructure/persistence/relational/entities/admin-login-log.entity';
import { AdminRoleRelationEntity } from '@/modules/ums/admin-user/infrastructure/persistence/relational/entities/admin-role-relation.entity';
import { AdminRoleEntity } from '@/modules/ums/admin-role/infrastructure/persistence/relational/entities/admin-role.entity';
import { RoleMenuRelationEntity } from '@/modules/ums/admin-role/infrastructure/persistence/relational/entities/role-menu-relation.entity';
import { AdminMenuEntity } from '@/modules/ums/admin-menu/infrastructure/persistence/relational/entities/admin-menu.entity';
import { MemberEntity } from '@/modules/portal/member/infrastructure/persistence/relational/entities/member.entity';
import { MemberLevelEntity } from '@/modules/ums/member-level/infrastructure/persistence/relational/entities/member-level.entity';

// Redis 缓存 Key 规范
const CACHE_KEYS = {
  admin: (username: string) => `mall:admin:${username}`,
  resourceList: (adminId: number) => `mall:resourceList:${adminId}`,
  authCode: (phone: string) => `mall:authCode:${phone}`,
  tokenBlacklist: (token: string) => `mall:token_blacklist:${token}`,
  member: (username: string) => `mall:member:${username}`,
};
const CACHE_TTL = 3600 * 1000; // 1小时（cache-manager v5+ 使用毫秒）
const AUTH_CODE_TTL = 900 * 1000; // 15分钟

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<AllConfigType>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @InjectRepository(AdminUserEntity)
    private readonly adminRepo: Repository<AdminUserEntity>,
    @InjectRepository(AdminLoginLogEntity)
    private readonly loginLogRepo: Repository<AdminLoginLogEntity>,
    @InjectRepository(AdminRoleRelationEntity)
    private readonly adminRoleRelationRepo: Repository<AdminRoleRelationEntity>,
    @InjectRepository(AdminRoleEntity)
    private readonly adminRoleRepo: Repository<AdminRoleEntity>,
    @InjectRepository(RoleMenuRelationEntity)
    private readonly roleMenuRelationRepo: Repository<RoleMenuRelationEntity>,
    @InjectRepository(AdminMenuEntity)
    private readonly adminMenuRepo: Repository<AdminMenuEntity>,
    @InjectRepository(MemberEntity)
    private readonly memberRepo: Repository<MemberEntity>,
    @InjectRepository(MemberLevelEntity)
    private readonly memberLevelRepo: Repository<MemberLevelEntity>,
  ) {}

  /**
   * 管理员登录
   * 迁移自 mall-admin UmsAdminServiceImpl.login()
   */
  async adminLogin(
    dto: AdminLoginDto,
    ip = '0.0.0.0',
  ): Promise<LoginResponseDto> {
    // 1. 先从 Redis 缓存查 admin 信息
    let admin: AdminUserEntity | null =
      (await this.cacheManager.get<AdminUserEntity>(
        CACHE_KEYS.admin(dto.username),
      )) ?? null;

    // 2. 缓存没有则从 DB 查
    if (!admin) {
      admin = await this.adminRepo.findOne({
        where: { username: dto.username },
      });
    }

    // 3. 不存在抛异常
    if (!admin) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 4. bcrypt 验证密码
    const isPasswordValid = await bcrypt.compare(dto.password, admin.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 5. 检查账号状态
    if (admin.status !== 1) {
      throw new UnauthorizedException('账号已被禁用');
    }

    // 6. 写入 Redis 缓存（不存储密码 hash，防止 Redis 泄露后离线破解）
    await this.cacheManager.set(
      CACHE_KEYS.admin(dto.username),
      { ...admin, password: '' },
      CACHE_TTL,
    );

    // 7. 签发 JWT
    const payload: JwtPayload = {
      sub: admin.id,
      username: admin.username,
      type: 'admin',
    };
    const token = this.jwtService.sign(payload);

    // 8. 写入登录日志
    const loginLog = this.loginLogRepo.create({
      adminId: admin.id,
      ip,
      createTime: new Date(),
    });
    await this.loginLogRepo.save(loginLog);

    // 9. 更新登录时间
    await this.adminRepo.update(admin.id, { loginTime: new Date() });

    return { token, tokenHead: 'Bearer' };
  }

  /**
   * 管理员注册
   * 迁移自 mall-admin UmsAdminServiceImpl.register()
   */
  async adminRegister(dto: RegisterAdminDto): Promise<AdminUserEntity> {
    // 1. 查重
    const existing = await this.adminRepo.findOne({
      where: { username: dto.username },
    });
    if (existing) {
      throw new BadRequestException('用户名已存在');
    }

    // 2. bcrypt 加密密码
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // 3. 插入记录
    const admin = this.adminRepo.create({
      username: dto.username,
      password: hashedPassword,
      email: dto.email,
      nickName: dto.nickName,
      note: dto.note,
      icon: dto.icon,
      status: 1,
    });
    const saved = await this.adminRepo.save(admin);

    // 4. 返回时隐藏密码
    saved.password = '';
    return saved;
  }

  /**
   * 获取管理员信息（角色 + 菜单树）
   * 迁移自 mall-admin UmsAdminController.getAdminInfo()
   */
  async getAdminInfo(adminId: number): Promise<Record<string, unknown>> {
    // 1. 查 admin 信息
    const admin = await this.adminRepo.findOne({ where: { id: adminId } });
    if (!admin) {
      throw new UnauthorizedException('管理员不存在');
    }

    // 2. 查角色列表
    const roleRelations = await this.adminRoleRelationRepo.find({
      where: { adminId },
    });
    const roleIds = roleRelations.map((r) => r.roleId);

    let roles: AdminRoleEntity[] = [];
    if (roleIds.length > 0) {
      roles = await this.adminRoleRepo.find({
        where: { id: In(roleIds) },
      });
    }

    // 3. 查菜单列表
    let menus: AdminMenuEntity[] = [];
    if (roleIds.length > 0) {
      const menuRelations = await this.roleMenuRelationRepo.find({
        where: { roleId: In(roleIds) },
      });
      const menuIds = [...new Set(menuRelations.map((r) => r.menuId))];

      if (menuIds.length > 0) {
        menus = await this.adminMenuRepo.find({
          where: { id: In(menuIds) },
        });
      }
    }

    // 4. 构建菜单树
    const menuTree = this.buildMenuTree(menus);

    return {
      username: admin.username,
      icon: admin.icon,
      roles: roles.map((r) => r.name),
      menus: menuTree,
    };
  }

  /** 登出：token 加入黑名单，清除相关缓存 */
  async logout(authorization: string): Promise<void> {
    const pureToken = authorization.replace(/^Bearer\s+/i, '');
    if (!pureToken) return;

    const decoded = this.jwtService.decode(pureToken) as JwtPayload | null;
    if (!decoded) return;

    if (decoded.exp) {
      const remainingMs = decoded.exp * 1000 - Date.now();
      if (remainingMs > 0) {
        await this.cacheManager.set(
          CACHE_KEYS.tokenBlacklist(pureToken),
          '1',
          remainingMs,
        );
      }
    }

    // 同步删除 JWT 有效性缓存，确保登出立即生效（不等 30 秒过期）
    await this.cacheManager.del(`mall:jwt_valid:${pureToken}`);

    if (decoded.username) {
      await this.cacheManager.del(CACHE_KEYS.admin(decoded.username));
      await this.cacheManager.del(CACHE_KEYS.member(decoded.username));
    }

    if (decoded.sub) {
      await this.cacheManager.del(CACHE_KEYS.resourceList(decoded.sub));
    }
  }

  /**
   * 刷新 Token
   * 迁移自 mall JwtTokenUtil.refreshHeadToken()
   */
  async refreshToken(oldToken: string): Promise<LoginResponseDto> {
    // 1. 提取纯 token
    const pureToken = oldToken.replace(/^Bearer\s+/i, '');

    // 2. 解析 payload（不验证过期）
    const decoded = this.jwtService.decode(pureToken) as JwtPayload | null;
    if (!decoded) {
      throw new UnauthorizedException('无效的 Token');
    }

    const now = Math.floor(Date.now() / 1000);

    // 3. 超过宽限期（24小时）的过期 token，拒绝刷新
    const REFRESH_WINDOW_SECONDS = 24 * 60 * 60;
    if (decoded.exp && decoded.exp < now - REFRESH_WINDOW_SECONDS) {
      throw new UnauthorizedException('Token 已过期太久，请重新登录');
    }

    // 4. token 未过期且 30 分钟内刚签发过，直接返回原 token（不需要刷新）
    if (
      decoded.exp &&
      decoded.exp > now &&
      decoded.iat &&
      now - decoded.iat < 30 * 60
    ) {
      return { token: pureToken, tokenHead: 'Bearer' };
    }

    // 5. 重新签发
    const payload: JwtPayload = {
      sub: decoded.sub,
      username: decoded.username,
      type: decoded.type,
    };
    const newToken = this.jwtService.sign(payload);

    return { token: newToken, tokenHead: 'Bearer' };
  }

  /**
   * 移动端登录
   * 迁移自 mall UmsMemberServiceImpl.login()
   */
  async portalLogin(dto: PortalLoginDto): Promise<LoginResponseDto> {
    // 1. 先从 Redis 查
    let member: MemberEntity | null =
      (await this.cacheManager.get<MemberEntity>(
        CACHE_KEYS.member(dto.username),
      )) ?? null;

    // 2. 没有则从 DB 查
    if (!member) {
      member = await this.memberRepo.findOne({
        where: { username: dto.username },
      });
    }

    // 3. 不存在
    if (!member) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 4. 验证密码
    const isPasswordValid = await bcrypt.compare(dto.password, member.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 5. 检查状态
    if (member.status !== 1) {
      throw new UnauthorizedException('账号已被禁用');
    }

    // 6. 缓存会员信息（不存储密码 hash，防止 Redis 泄露后离线破解）
    await this.cacheManager.set(
      CACHE_KEYS.member(dto.username),
      { ...member, password: '' },
      CACHE_TTL,
    );

    // 7. 签发 JWT
    const payload: JwtPayload = {
      sub: member.id,
      username: member.username,
      type: 'member',
    };
    const token = this.jwtService.sign(payload);

    return { token, tokenHead: 'Bearer' };
  }

  /**
   * 移动端注册
   * 迁移自 mall UmsMemberServiceImpl.register()
   */
  async portalRegister(dto: PortalRegisterDto): Promise<void> {
    // 1. 验证验证码
    const cachedCode = await this.cacheManager.get<string>(
      CACHE_KEYS.authCode(dto.telephone),
    );
    if (!cachedCode || cachedCode !== dto.authCode) {
      throw new BadRequestException('验证码错误');
    }

    // 2. 查重
    const existingByUsername = await this.memberRepo.findOne({
      where: { username: dto.username },
    });
    if (existingByUsername) {
      throw new BadRequestException('用户名已存在');
    }

    const existingByPhone = await this.memberRepo.findOne({
      where: { phone: dto.telephone },
    });
    if (existingByPhone) {
      throw new BadRequestException('手机号已注册');
    }

    // 3. 查默认会员等级
    const defaultLevel = await this.memberLevelRepo.findOne({
      where: { defaultStatus: 1 },
    });

    // 4. 加密密码
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // 5. 插入会员记录
    const member = this.memberRepo.create({
      username: dto.username,
      password: hashedPassword,
      phone: dto.telephone,
      status: 1,
      createTime: new Date(),
      memberLevelId: defaultLevel?.id,
    });
    await this.memberRepo.save(member);

    // 注册成功后立即删除验证码，防止重复使用
    await this.cacheManager.del(CACHE_KEYS.authCode(dto.telephone));
  }

  /** 获取会员信息 */
  async getMemberInfo(memberId: number): Promise<Record<string, unknown>> {
    const member = await this.memberRepo.findOne({
      where: { id: memberId },
    });
    if (!member) {
      throw new UnauthorizedException('会员不存在');
    }

    // 隐藏密码
    const { password: _, ...memberInfo } = member;
    return memberInfo;
  }

  /**
   * 生成短信验证码
   * 迁移自 mall UmsMemberServiceImpl.generateAuthCode()
   */
  async generateAuthCode(telephone: string): Promise<string> {
    // 生成6位随机数字
    const code = String(Math.floor(100000 + Math.random() * 900000));

    // 存入 Redis，15分钟过期
    await this.cacheManager.set(
      CACHE_KEYS.authCode(telephone),
      code,
      AUTH_CODE_TTL,
    );

    return code;
  }

  /**
   * 修改会员密码
   * 迁移自 mall UmsMemberServiceImpl.updatePassword()
   */
  async updateMemberPassword(
    telephone: string,
    password: string,
    authCode: string,
  ): Promise<void> {
    // 1. 验证验证码
    const cachedCode = await this.cacheManager.get<string>(
      CACHE_KEYS.authCode(telephone),
    );
    if (!cachedCode || cachedCode !== authCode) {
      throw new BadRequestException('验证码错误');
    }

    // 2. 查 member
    const member = await this.memberRepo.findOne({
      where: { phone: telephone },
    });
    if (!member) {
      throw new BadRequestException('该手机号未注册');
    }

    // 3. 加密并更新密码
    const hashedPassword = await bcrypt.hash(password, 10);
    await this.memberRepo.update(member.id, { password: hashedPassword });

    // 清除缓存
    await this.cacheManager.del(CACHE_KEYS.member(member.username));
  }

  /** 构建菜单树（parentId=0 为根节点，递归组装 children） */
  private buildMenuTree(
    menus: AdminMenuEntity[],
    parentId: number = 0,
  ): (AdminMenuEntity & { children?: AdminMenuEntity[] })[] {
    return menus
      .filter((m) => m.parentId === parentId)
      .sort((a, b) => a.sort - b.sort)
      .map((menu) => ({
        ...menu,
        children: this.buildMenuTree(menus, menu.id),
      }));
  }
}
