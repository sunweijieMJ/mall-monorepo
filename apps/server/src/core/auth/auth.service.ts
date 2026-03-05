import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from '@/config/config.type';
import { AdminLoginDto } from './dto/admin-login.dto';
import { PortalLoginDto, PortalRegisterDto } from './dto/portal-login.dto';
import { LoginResponseDto } from './dto/login-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<AllConfigType>,
  ) {}

  /**
   * 管理员登录（对应前端 POST /admin/login）
   * TODO: 迁移自 mall-admin UmsAdminServiceImpl.login()
   *   - 查询 ums_admin 表，验证账号密码（BCrypt）
   *   - 验证账号是否启用（enabled = 1）
   *   - 生成 JWT，写入 tokenHead + token 字段
   */
  async adminLogin(dto: AdminLoginDto): Promise<LoginResponseDto> {
    // TODO: implement
    throw new UnauthorizedException('TODO: adminLogin not implemented');
  }

  /**
   * 移动端手机号+密码登录（对应前端 POST /sso/login）
   * TODO: 迁移自 mall UmsMemberServiceImpl.login()
   *   - 查询 ums_member 表，验证手机号+密码
   *   - 验证账号状态（status = 1）
   *   - 生成 JWT token
   */
  async portalLogin(dto: PortalLoginDto): Promise<LoginResponseDto> {
    // TODO: implement
    throw new UnauthorizedException('TODO: portalLogin not implemented');
  }

  /**
   * 移动端注册（对应前端 POST /sso/register）
   * TODO: 迁移自 mall UmsMemberServiceImpl.register()
   *   - 检查手机号是否已注册
   *   - 验证短信验证码（authCode）
   *   - 插入 ums_member 记录，密码 BCrypt 加密
   */
  async portalRegister(dto: PortalRegisterDto): Promise<void> {
    // TODO: implement
    throw new Error('TODO: portalRegister not implemented');
  }

  /**
   * 获取管理员信息（对应前端 GET /admin/info）
   * TODO: 根据 JWT payload 中的 adminId 查询管理员详情 + 角色 + 菜单权限
   */
  async getAdminInfo(adminId: number): Promise<Record<string, unknown>> {
    // TODO: implement
    throw new Error('TODO: getAdminInfo not implemented');
  }

  /**
   * 获取移动端用户信息（对应前端 GET /member/info）
   * TODO: 根据 JWT payload 中的 memberId 查询会员信息
   */
  async getMemberInfo(memberId: number): Promise<Record<string, unknown>> {
    // TODO: implement
    throw new Error('TODO: getMemberInfo not implemented');
  }

  /** 刷新 Access Token */
  async refreshToken(refreshToken: string): Promise<LoginResponseDto> {
    // TODO: implement - 验证 refresh token，生成新的 access token
    throw new UnauthorizedException('TODO: refreshToken not implemented');
  }

  /** 登出 */
  async logout(token: string): Promise<void> {
    // TODO: implement - 将 token 加入黑名单（Redis），删除 Session
  }
}
