import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { MemberService } from './member.service';
import { CurrentUser } from '@/core/auth/decorators/current-user.decorator';
import { JwtPayload } from '@/core/auth/types/jwt-payload.type';

@ApiTags('移动端-会员信息')
@Controller({ path: 'portal/sso', version: '1' })
export class MemberInfoController {
  constructor(private readonly memberService: MemberService) {}

  @Get('info')
  @ApiOperation({
    summary: '获取当前会员信息',
    description: '对应前端 GET /sso/info',
  })
  getInfo(@CurrentUser() user: JwtPayload) {
    return this.memberService.getCurrentMember(user.sub);
  }
}

@ApiTags('移动端-收货地址')
@Controller({ path: 'portal/member/address', version: '1' })
export class MemberAddressController {
  constructor(private readonly memberService: MemberService) {}

  @Get('list')
  @ApiOperation({
    summary: '获取收货地址列表',
    description: '对应前端 GET /member/address/list',
  })
  list(@CurrentUser() user: JwtPayload) {
    return this.memberService.listAddress(user.sub);
  }

  @Get(':id')
  @ApiOperation({
    summary: '获取收货地址详情',
    description: '对应前端 GET /member/address/:id',
  })
  detail(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.memberService.getAddress(id, user.sub);
  }

  @Post('add')
  @ApiOperation({
    summary: '添加收货地址',
    description: '对应前端 POST /member/address/add',
  })
  add(@Body() body: Record<string, unknown>, @CurrentUser() user: JwtPayload) {
    return this.memberService.addAddress(user.sub, body);
  }

  @Post('update/:id')
  @ApiOperation({
    summary: '更新收货地址',
    description: '对应前端 POST /member/address/update/:id',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: Record<string, unknown>,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.memberService.updateAddress(id, user.sub, body);
  }

  @Post('delete/:id')
  @ApiOperation({
    summary: '删除收货地址',
    description: '对应前端 POST /member/address/delete/:id',
  })
  delete(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.memberService.deleteAddress(id, user.sub);
  }
}

/** 移动端会员优惠券 Controller */
@ApiTags('移动端-会员优惠券')
@ApiBearerAuth()
@Controller({ path: 'portal/member/coupons', version: '1' })
export class MemberCouponController {
  constructor(private readonly memberService: MemberService) {}

  @Post(':couponId')
  @ApiOperation({ summary: '领取优惠券' })
  addCoupon(
    @Param('couponId', ParseIntPipe) couponId: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.memberService.addCoupon(user.sub, couponId);
  }

  @Get('list')
  @ApiOperation({ summary: '我的优惠券列表（返回优惠券对象）' })
  @ApiQuery({
    name: 'useStatus',
    required: false,
    description: '使用状态：0->未使用；1->已使用；2->已过期',
  })
  listCouponObjects(
    @CurrentUser() user: JwtPayload,
    @Query('useStatus') useStatus?: string,
  ) {
    const status = useStatus !== undefined ? Number(useStatus) : undefined;
    return this.memberService.listCouponObjects(user.sub, status);
  }

  @Get('listHistory')
  @ApiOperation({ summary: '我的优惠券历史记录（返回领取历史）' })
  @ApiQuery({
    name: 'useStatus',
    required: false,
    description: '使用状态：0->未使用；1->已使用；2->已过期',
  })
  listMemberCoupons(
    @CurrentUser() user: JwtPayload,
    @Query('useStatus') useStatus?: string,
  ) {
    const status = useStatus !== undefined ? Number(useStatus) : undefined;
    return this.memberService.listMemberCoupons(user.sub, status);
  }

  @Get('product/:productId')
  @ApiOperation({ summary: '查询商品相关可用优惠券' })
  listCouponsByProduct(
    @Param('productId', ParseIntPipe) productId: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.memberService.listCouponsByProduct(user.sub, productId);
  }
}
