import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  NotImplementedException,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import { RegisterAdminDto } from './dto/register-admin.dto';
import {
  PortalLoginDto,
  PortalRegisterDto,
  PortalSmsLoginDto,
  GetAuthCodeDto,
  UpdateMemberPasswordDto,
} from './dto/portal-login.dto';
import { Public } from './decorators/public.decorator';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';

// ======================== 管理端认证 ========================

@ApiTags('管理端-认证')
@Controller({ path: 'admin/auth', version: '1' })
export class AdminAuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '管理员注册（需已登录管理员权限）',
    description: '对应前端 POST /admin/register',
  })
  adminRegister(@Body() dto: RegisterAdminDto, @Req() req: any) {
    // 只允许 admin 类型用户调用，防止 member token 越权创建管理员
    const user = req.user as { type?: string };
    if (user?.type !== 'admin') {
      throw new ForbiddenException('无权执行此操作');
    }
    return this.authService.adminRegister(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '管理员登录',
    description: '对应前端 POST /admin/login',
  })
  adminLogin(@Body() dto: AdminLoginDto, @Req() req: any) {
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.ip ||
      '0.0.0.0';
    return this.authService.adminLogin(dto, ip);
  }

  @Get('info')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '获取管理员信息',
    description: '对应前端 GET /admin/info',
  })
  getAdminInfo(@Req() req: any) {
    return this.authService.getAdminInfo(req.user.sub as number);
  }

  @Post('logout')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '管理员登出' })
  adminLogout(@Req() req: any) {
    return this.authService.logout(req.headers.authorization ?? '');
  }

  @Public()
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '刷新 Token',
    description:
      '使用 Refresh Token 获取新的 Access Token + Refresh Token 对（Rotation 机制，旧 Refresh Token 立即失效）',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        refreshToken: {
          type: 'string',
          description: 'Refresh Token',
        },
      },
      required: ['refreshToken'],
    },
  })
  refresh(@Req() req: any) {
    return this.authService.refreshToken(req.user);
  }
}

// ======================== 移动端认证 ========================

@ApiTags('移动端-认证')
@Controller({ path: 'portal/auth', version: '1' })
export class PortalAuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '手机号+密码登录',
    description: '对应前端 POST /sso/login',
  })
  portalLogin(@Body() dto: PortalLoginDto) {
    return this.authService.portalLogin(dto);
  }

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '手机号注册',
    description: '对应前端 POST /sso/register',
  })
  portalRegister(@Body() dto: PortalRegisterDto) {
    return this.authService.portalRegister(dto);
  }

  @Public()
  @Get('sms-code')
  @ApiOperation({ summary: '获取短信验证码' })
  getAuthCode(@Query() dto: GetAuthCodeDto) {
    return this.authService.generateAuthCode(dto.phone);
  }

  @Public()
  @Post('sms-login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '短信验证码登录（暂未开放）' })
  smsLogin(@Body() _dto: PortalSmsLoginDto) {
    throw new NotImplementedException('短信验证码登录功能暂未开放');
  }

  @Get('info')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '获取会员信息',
    description: '对应前端 GET /member/info',
  })
  getMemberInfo(@Req() req: any) {
    return this.authService.getMemberInfo(req.user.sub as number);
  }

  @Public()
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '刷新 Token',
    description:
      '使用 Refresh Token 获取新的 Access Token + Refresh Token 对（Rotation 机制，旧 Refresh Token 立即失效）',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        refreshToken: {
          type: 'string',
          description: 'Refresh Token',
        },
      },
      required: ['refreshToken'],
    },
  })
  portalRefresh(@Req() req: any) {
    return this.authService.refreshToken(req.user);
  }

  @Public()
  @Post('updatePassword')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '修改会员密码（短信验证码验证）' })
  updatePassword(@Body() dto: UpdateMemberPasswordDto) {
    return this.authService.updateMemberPassword(
      dto.telephone,
      dto.password,
      dto.authCode,
    );
  }

  @Post('logout')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '退出登录' })
  logout(@Req() req: any) {
    return this.authService.logout(req.headers.authorization ?? '');
  }
}
