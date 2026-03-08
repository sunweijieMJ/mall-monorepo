import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  NotImplementedException,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { ApiWrappedResponse } from '@/common/decorators/api-wrapped-response.decorator';
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
import { CurrentUser } from './decorators/current-user.decorator';
import { JwtPayload } from './types/jwt-payload.type';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { LoginResponseDto } from './dto/login-response.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AdminInfoVo } from './vo/admin-info.vo';
import { AdminUserVo } from '@/modules/ums/admin-user/vo/admin-user.vo';

// ======================== 管理端认证 ========================

@ApiTags('admin-auth')
@Controller({ path: 'admin/auth', version: '1' })
export class AdminAuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiBearerAuth('admin-jwt')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '管理员注册（需已登录管理员权限）',
    description: '对应前端 POST /admin/register',
  })
  @ApiWrappedResponse(AdminUserVo)
  register(@Body() dto: RegisterAdminDto, @CurrentUser() user: JwtPayload) {
    // 只允许 admin 类型用户调用，防止 member token 越权创建管理员
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
  @ApiWrappedResponse(LoginResponseDto)
  login(@Body() dto: AdminLoginDto, @Req() req: Request) {
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.ip ||
      '0.0.0.0';
    return this.authService.adminLogin(dto, ip);
  }

  @Get('info')
  @ApiBearerAuth('admin-jwt')
  @ApiOperation({
    summary: '获取管理员信息',
    description: '对应前端 GET /admin/info',
  })
  @ApiWrappedResponse(AdminInfoVo)
  getInfo(@CurrentUser() user: JwtPayload) {
    return this.authService.getAdminInfo(user.sub);
  }

  @Post('logout')
  @ApiBearerAuth('admin-jwt')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '管理员登出' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  logout(@Req() req: Request) {
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
  @ApiBody({ type: RefreshTokenDto })
  @ApiWrappedResponse(LoginResponseDto)
  refresh(@CurrentUser() user: JwtPayload) {
    return this.authService.refreshToken(user);
  }
}

// ======================== 移动端认证 ========================

@ApiTags('portal-auth')
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
  @ApiWrappedResponse(LoginResponseDto)
  login(@Body() dto: PortalLoginDto) {
    return this.authService.portalLogin(dto);
  }

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '手机号注册',
    description: '对应前端 POST /sso/register',
  })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  register(@Body() dto: PortalRegisterDto) {
    return this.authService.portalRegister(dto);
  }

  @Public()
  @Post('sms-code')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '获取短信验证码' })
  @ApiOkResponse({ type: String })
  getAuthCode(@Body() dto: GetAuthCodeDto) {
    return this.authService.generateAuthCode(dto.phone);
  }

  @Public()
  @Post('sms-login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '短信验证码登录（暂未开放）' })
  @ApiWrappedResponse(LoginResponseDto)
  smsLogin(@Body() _dto: PortalSmsLoginDto) {
    throw new NotImplementedException('短信验证码登录功能暂未开放');
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
  @ApiBody({ type: RefreshTokenDto })
  @ApiWrappedResponse(LoginResponseDto)
  refresh(@CurrentUser() user: JwtPayload) {
    return this.authService.refreshToken(user);
  }

  @Public()
  @Put('password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '修改会员密码（短信验证码验证）' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  updatePassword(@Body() dto: UpdateMemberPasswordDto) {
    return this.authService.updateMemberPassword(
      dto.telephone,
      dto.password,
      dto.authCode,
    );
  }

  @Post('logout')
  @ApiBearerAuth('portal-jwt')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '退出登录' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  logout(@Req() req: Request) {
    return this.authService.logout(req.headers.authorization ?? '');
  }
}
