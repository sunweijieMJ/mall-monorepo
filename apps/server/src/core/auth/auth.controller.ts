import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import { RegisterAdminDto } from './dto/register-admin.dto';
import {
  PortalLoginDto,
  PortalRegisterDto,
  PortalSmsLoginDto,
} from './dto/portal-login.dto';
import { Public } from './decorators/public.decorator';

// ======================== 管理端认证 ========================

@ApiTags('管理端-认证')
@Controller({ path: 'admin/auth', version: '1' })
export class AdminAuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '管理员注册',
    description: '对应前端 POST /admin/register',
  })
  adminRegister(@Body() dto: RegisterAdminDto) {
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
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '刷新 Token' })
  refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
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
  getAuthCode(@Query('phone') phone: string) {
    return this.authService.generateAuthCode(phone);
  }

  @Public()
  @Post('sms-login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '短信验证码登录' })
  smsLogin(@Body() _dto: PortalSmsLoginDto) {
    // TODO: implement SMS login
    return { message: 'TODO' };
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

  @Post('logout')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '退出登录' })
  logout(@Req() req: any) {
    return this.authService.logout(req.headers.authorization ?? '');
  }
}
