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
import * as crypto from 'crypto';

import { AllConfigType } from '@/config/config.type';
import { CACHE_TTL_MS } from '@/common/constants';
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
import { SessionEntity } from './infrastructure/persistence/relational/entities/session.entity';

import { CACHE_KEYS } from '@/common/constants';
const AUTH_CODE_TTL = 900 * 1000; // 15分钟
const AUTH_CODE_COOLDOWN = 60 * 1000; // 验证码发送冷却 60 秒
const LOGIN_FAIL_MAX = 5; // 最大登录失败次数
const LOGIN_LOCK_TTL = 15 * 60 * 1000; // 登录锁定时间 15 分钟
const LOGIN_FAIL_TTL = 30 * 60 * 1000; // 失败计数窗口 30 分钟

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
    @InjectRepository(SessionEntity)
    private readonly sessionRepo: Repository<SessionEntity>,
  ) {}

  /**
   * 管理员登录
   * 迁移自 mall-admin UmsAdminServiceImpl.login()
   */
  async adminLogin(
    dto: AdminLoginDto,
    ip = '0.0.0.0',
  ): Promise<LoginResponseDto> {
    // 0. 检查账号是否被锁定（防暴力破解）
    const isLocked = await this.cacheManager.get(
      CACHE_KEYS.loginLock(dto.username),
    );
    if (isLocked) {
      throw new UnauthorizedException('登录尝试过多，请 15 分钟后重试');
    }

    // 1. 登录流程始终查 DB，确保实时获取账号状态（避免缓存延迟导致禁用账号绕过）
    // addSelect 显式加载 select:false 的 password 字段（仅登录校验时需要）
    const admin = await this.adminRepo
      .createQueryBuilder('admin')
      .addSelect('admin.password')
      .where('admin.username = :username', { username: dto.username })
      .getOne();

    // 2. 不存在抛异常
    if (!admin) {
      await this.recordLoginFailure(dto.username);
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 3. bcrypt 验证密码
    const isPasswordValid = await bcrypt.compare(dto.password, admin.password);
    if (!isPasswordValid) {
      await this.recordLoginFailure(dto.username);
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 4. 检查账号状态（放在密码验证之后，防止状态枚举攻击）
    if (admin.status !== 1) {
      throw new UnauthorizedException('账号已被禁用');
    }

    // 6. 登录成功，清除失败计数
    await this.cacheManager.del(CACHE_KEYS.loginFail(dto.username));

    // 7. 写入 Redis 缓存（不存储密码 hash，防止 Redis 泄露后离线破解）
    await this.cacheManager.set(
      CACHE_KEYS.admin(dto.username),
      { ...admin, password: '' },
      CACHE_TTL_MS,
    );

    // 8. 签发 Token Pair (Access Token + Refresh Token)
    const tokenPair = await this.generateTokenPair(
      admin.id,
      admin.username,
      'admin',
    );

    // 9. 写入登录日志
    const loginLog = this.loginLogRepo.create({
      adminId: admin.id,
      ip,
      createTime: new Date(),
    });
    await this.loginLogRepo.save(loginLog);

    // 10. 更新登录时间
    await this.adminRepo.update(admin.id, { loginTime: new Date() });

    return tokenPair;
  }

  /**
   * 管理员注册
   * 迁移自 mall-admin UmsAdminServiceImpl.register()
   */
  async adminRegister(
    dto: RegisterAdminDto,
  ): Promise<Omit<AdminUserEntity, 'password'>> {
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
    const { password: _pw, ...result } = saved;
    return result;
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

  /** 登出：token 加入黑名单，删除 Session，清除相关缓存 */
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
    await this.cacheManager.del(CACHE_KEYS.jwtValid(pureToken));

    // 删除该用户的所有 Session，确保 Refresh Token 也同步失效
    if (decoded.sub) {
      await this.sessionRepo.delete({
        userId: decoded.sub,
        userType: decoded.type,
      });
    }

    if (decoded.username) {
      // 按用户类型只删除对应缓存，避免 admin/member 同名时互相清除
      if (decoded.type === 'admin') {
        await this.cacheManager.del(CACHE_KEYS.admin(decoded.username));
      } else {
        await this.cacheManager.del(CACHE_KEYS.member(decoded.username));
      }
    }

    if (decoded.sub) {
      await this.cacheManager.del(CACHE_KEYS.resourceList(decoded.sub));
    }
  }

  /**
   * 刷新 Token（双 Token 机制）
   * 使用 Refresh Token 签发新的 Access Token + Refresh Token 对
   * Refresh Token 由 JwtRefreshGuard 预验证签名和过期时间，此处验证 Session 有效性
   */
  async refreshToken(payload: JwtPayload): Promise<LoginResponseDto> {
    // 1. 从 payload 中取出 sessionId（JwtRefreshStrategy 已验证其存在）
    const { sessionId, sub, username, type, jti } = payload;

    // 2. 查找 Session 记录
    const session = await this.sessionRepo.findOne({
      where: { id: sessionId },
    });

    if (!session) {
      throw new UnauthorizedException('Session 不存在或已失效，请重新登录');
    }

    // 3. 验证 Session 归属
    if (session.userId !== sub || session.userType !== type) {
      throw new UnauthorizedException('Session 信息不匹配');
    }

    // 4. 验证 jti hash（防止 Session 被伪造）
    if (jti) {
      const isJtiValid = await bcrypt.compare(jti, session.hash);
      if (!isJtiValid) {
        await this.sessionRepo.delete({ id: sessionId });
        throw new UnauthorizedException('Token 验证失败');
      }
    }

    // 5. 检查账号状态（防止禁用账号仍可刷新 Token）
    if (type === 'admin') {
      const admin = await this.adminRepo.findOne({ where: { id: sub } });
      if (!admin || admin.status !== 1) {
        await this.sessionRepo.delete({ id: sessionId });
        throw new UnauthorizedException('账号已被禁用');
      }
    } else if (type === 'member') {
      const member = await this.memberRepo.findOne({ where: { id: sub } });
      if (!member || member.status !== 1) {
        await this.sessionRepo.delete({ id: sessionId });
        throw new UnauthorizedException('账号已被禁用');
      }
    }

    // 5. 删除旧 Session（Rotation：每次刷新都使旧 Refresh Token 失效）
    await this.sessionRepo.delete({ id: sessionId });

    // 6. 签发新的 Token Pair
    return this.generateTokenPair(sub, username, type);
  }

  /**
   * 移动端登录
   * 迁移自 mall UmsMemberServiceImpl.login()
   */
  async portalLogin(dto: PortalLoginDto): Promise<LoginResponseDto> {
    // 0. 检查账号是否被锁定（防暴力破解）
    const isLocked = await this.cacheManager.get(
      CACHE_KEYS.loginLock(dto.username),
    );
    if (isLocked) {
      throw new UnauthorizedException('登录尝试过多，请 15 分钟后重试');
    }

    // 1. 登录流程始终查 DB，确保实时获取账号状态（避免缓存延迟导致禁用账号绕过）
    // addSelect 显式加载 select:false 的 password 字段（仅登录校验时需要）
    const member = await this.memberRepo
      .createQueryBuilder('member')
      .addSelect('member.password')
      .where('member.username = :username', { username: dto.username })
      .getOne();

    // 2. 不存在
    if (!member) {
      await this.recordLoginFailure(dto.username);
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 3. 验证密码
    const isPasswordValid = await bcrypt.compare(dto.password, member.password);
    if (!isPasswordValid) {
      await this.recordLoginFailure(dto.username);
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 4. 检查状态（放在密码验证之后，防止状态枚举攻击）
    if (member.status !== 1) {
      throw new UnauthorizedException('账号已被禁用');
    }

    // 6. 登录成功，清除失败计数
    await this.cacheManager.del(CACHE_KEYS.loginFail(dto.username));

    // 6.5. 更新登录时间
    await this.memberRepo.update(member.id, { loginTime: new Date() });

    // 7. 缓存会员信息（不存储密码 hash，防止 Redis 泄露后离线破解）
    await this.cacheManager.set(
      CACHE_KEYS.member(dto.username),
      { ...member, password: '' },
      CACHE_TTL_MS,
    );

    // 8. 签发 Token Pair (Access Token + Refresh Token)
    const tokenPair = await this.generateTokenPair(
      member.id,
      member.username,
      'member',
    );

    return tokenPair;
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

    // 2. 查重（手机号同时作为 username，只需查一个）
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

    // 5. 插入会员记录（telephone 同时作为 username 使用）
    const member = this.memberRepo.create({
      username: dto.telephone,
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
    // 1. 检查 60 秒冷却（防止频繁发送）
    const recentSend = await this.cacheManager.get(
      CACHE_KEYS.authCodeCooldown(telephone),
    );
    if (recentSend) {
      throw new BadRequestException('验证码发送过于频繁，请 60 秒后再试');
    }

    // 2. 生成6位随机数字（使用加密安全随机数）
    const code = String(crypto.randomInt(100000, 1000000));

    // 3. 存入 Redis，15分钟过期
    await this.cacheManager.set(
      CACHE_KEYS.authCode(telephone),
      code,
      AUTH_CODE_TTL,
    );

    // 4. 记录发送冷却（60 秒）
    await this.cacheManager.set(
      CACHE_KEYS.authCodeCooldown(telephone),
      '1',
      AUTH_CODE_COOLDOWN,
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

  /**
   * 生成 Token Pair (Access Token + Refresh Token)
   * - Access Token: 短期，用 auth.secret 签名，不含 sessionId
   * - Refresh Token: 长期，用 auth.refreshSecret 签名，包含 sessionId
   */
  private async generateTokenPair(
    userId: number,
    username: string,
    userType: 'admin' | 'member',
  ): Promise<LoginResponseDto> {
    const refreshSecret =
      this.configService.get('auth.refreshSecret', { infer: true }) ||
      this.configService.getOrThrow('auth.secret', { infer: true });
    const refreshExpires =
      this.configService.get('auth.refreshExpires', { infer: true }) || '3650d';

    // 1. 生成 jti 并创建 Session 记录
    const jti = crypto.randomBytes(16).toString('hex');
    const hash = await bcrypt.hash(jti, 10);
    const session = this.sessionRepo.create({
      userId,
      userType,
      hash,
      expiresAt: this.parseExpiresDate(refreshExpires),
    });
    const savedSession = await this.sessionRepo.save(session);

    // 2. 签发 Access Token（短期，不含 sessionId）
    const accessPayload: JwtPayload = {
      sub: userId,
      username,
      type: userType,
    };
    const token = this.jwtService.sign(accessPayload);

    // 3. 签发 Refresh Token（长期，包含 sessionId 和 jti）
    const refreshPayload: JwtPayload = {
      sub: userId,
      username,
      type: userType,
      sessionId: savedSession.id,
      jti,
    };
    const refreshToken = this.jwtService.sign(refreshPayload, {
      secret: refreshSecret,
      expiresIn: refreshExpires as any,
    });

    return { token, refreshToken, tokenHead: 'Bearer' };
  }

  /** 将 JWT 过期时间字符串（如 '3650d', '15m', '1h'）转换为 Date */
  private parseExpiresDate(expires: string): Date {
    const now = Date.now();
    const match = expires.match(/^(\d+)(s|m|h|d)$/);
    if (!match) {
      // 默认 10 年
      return new Date(now + 10 * 365 * 24 * 60 * 60 * 1000);
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];
    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    return new Date(now + value * multipliers[unit]);
  }

  /** 记录登录失败次数，达到上限后锁定账号 */
  private async recordLoginFailure(username: string): Promise<void> {
    const failCount =
      ((await this.cacheManager.get<number>(CACHE_KEYS.loginFail(username))) ??
        0) + 1;
    await this.cacheManager.set(
      CACHE_KEYS.loginFail(username),
      failCount,
      LOGIN_FAIL_TTL,
    );
    if (failCount >= LOGIN_FAIL_MAX) {
      await this.cacheManager.set(
        CACHE_KEYS.loginLock(username),
        '1',
        LOGIN_LOCK_TTL,
      );
    }
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
