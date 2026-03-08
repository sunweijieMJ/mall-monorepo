import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseArrayPipe,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { MemberService } from './member.service';
import { CurrentUser } from '@/core/auth/decorators/current-user.decorator';
import { JwtPayload } from '@/core/auth/types/jwt-payload.type';
import { Public } from '@/core/auth/decorators/public.decorator';
import { UpdateMemberInfoDto } from './dto/update-member-info.dto';
import {
  CreateMemberAddressDto,
  UpdateMemberAddressDto,
} from './dto/member-address.dto';
import { MemberVo } from './vo/member.vo';
import { MemberAddressVo } from './vo/member-address.vo';
import { CouponVo } from '@/modules/sms/coupon/vo/coupon.vo';
import { CouponHistoryVo } from '@/modules/sms/coupon/vo/coupon-history.vo';
import { ApiPaginatedResponse } from '@/common/decorators/api-paginated-response.decorator';
import { PageQueryDto } from '@/common/dto/page-result.dto';

@ApiTags('portal-member-profile')
@ApiBearerAuth('portal-jwt')
@Controller({ path: 'portal/member', version: '1' })
export class MemberInfoController {
  constructor(private readonly memberService: MemberService) {}

  @Get('info')
  @ApiOperation({
    summary: '获取当前会员信息',
    description: '对应前端 GET /member/info',
  })
  @ApiOkResponse({ type: MemberVo })
  getInfo(@CurrentUser() user: JwtPayload) {
    return this.memberService.getCurrentMember(user.sub);
  }

  @Put('update')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '更新会员基本信息',
    description: '对应前端 POST /member/update',
  })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  updateInfo(
    @Body() body: UpdateMemberInfoDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.memberService.updateInfo(user.sub, body);
  }
}

@ApiTags('portal-member-address')
@ApiBearerAuth('portal-jwt')
@Controller({ path: 'portal/member/address', version: '1' })
export class MemberAddressController {
  constructor(private readonly memberService: MemberService) {}

  @Get('list')
  @ApiOperation({
    summary: '获取收货地址列表',
    description: '对应前端 GET /member/address/list',
  })
  @ApiOkResponse({ type: [MemberAddressVo] })
  list(@CurrentUser() user: JwtPayload) {
    return this.memberService.listAddress(user.sub);
  }

  @Get(':id')
  @ApiOperation({
    summary: '获取收货地址详情',
    description: '对应前端 GET /member/address/:id',
  })
  @ApiParam({ name: 'id', description: '收货地址ID', type: 'integer' })
  @ApiOkResponse({ type: MemberAddressVo })
  getItem(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.memberService.getAddress(id, user.sub);
  }

  @Post('create')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '添加收货地址',
    description: '对应前端 POST /member/address/create',
  })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  create(
    @Body() body: CreateMemberAddressDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.memberService.addAddress(user.sub, body);
  }

  @Put('update/:id')
  @ApiOperation({
    summary: '更新收货地址',
    description: '对应前端 PUT /member/address/update/:id',
  })
  @ApiParam({ name: 'id', description: '收货地址ID', type: 'integer' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateMemberAddressDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.memberService.updateAddress(id, user.sub, body);
  }

  @Delete('delete/:id')
  @ApiOperation({
    summary: '删除收货地址',
    description: '对应前端 DELETE /member/address/delete/:id',
  })
  @ApiParam({ name: 'id', description: '收货地址ID', type: 'integer' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  delete(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.memberService.deleteAddress(id, user.sub);
  }
}

/** 移动端会员优惠券 Controller */
@ApiTags('portal-coupon')
@ApiBearerAuth('portal-jwt')
@Controller({ path: 'portal/member/coupons', version: '1' })
export class MemberCouponController {
  constructor(private readonly memberService: MemberService) {}

  @Post(':couponId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '领取优惠券' })
  @ApiParam({ name: 'couponId', description: '优惠券ID', type: 'integer' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  create(
    @Param('couponId', ParseIntPipe) couponId: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.memberService.addCoupon(user.sub, couponId);
  }

  @Get('list')
  @ApiOperation({ summary: '我的优惠券列表（返回优惠券对象）' })
  @ApiPaginatedResponse(CouponVo)
  @ApiQuery({
    name: 'useStatus',
    required: false,
    type: Number,
    enum: [0, 1, 2],
    description: '使用状态：0->未使用；1->已使用；2->已过期',
  })
  listCouponObjects(
    @CurrentUser() user: JwtPayload,
    @Query('useStatus', new ParseIntPipe({ optional: true }))
    useStatus?: number,
    @Query() query?: PageQueryDto,
  ) {
    return this.memberService.listCouponObjects(user.sub, useStatus, query);
  }

  @Get('list-history')
  @ApiOperation({ summary: '我的优惠券历史记录（返回领取历史）' })
  @ApiPaginatedResponse(CouponHistoryVo)
  @ApiQuery({
    name: 'useStatus',
    required: false,
    type: Number,
    enum: [0, 1, 2],
    description: '使用状态：0->未使用；1->已使用；2->已过期',
  })
  listMemberCoupons(
    @CurrentUser() user: JwtPayload,
    @Query('useStatus', new ParseIntPipe({ optional: true }))
    useStatus?: number,
    @Query() query?: PageQueryDto,
  ) {
    return this.memberService.listMemberCoupons(user.sub, useStatus, query);
  }

  @Get('product/:productId')
  @ApiOperation({ summary: '查询商品相关可用优惠券' })
  @ApiParam({ name: 'productId', description: '商品ID', type: 'integer' })
  @ApiOkResponse({ type: [CouponVo] })
  listCouponsByProduct(
    @Param('productId', ParseIntPipe) productId: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.memberService.listCouponsByProduct(user.sub, productId);
  }

  @Get('list-cart')
  @ApiOperation({ summary: '获取购物车可用优惠券列表（结算页使用）' })
  @ApiOkResponse({ type: [CouponVo] })
  @ApiQuery({
    name: 'cartIds',
    required: true,
    description: '购物车条目 ID，逗号分隔',
    type: 'array',
    items: { type: 'integer' },
  })
  listCartCoupons(
    @CurrentUser() user: JwtPayload,
    @Query('cartIds', new ParseArrayPipe({ items: Number, separator: ',' }))
    cartIds: number[],
  ) {
    if (cartIds.length === 0) return [];
    return this.memberService.listCartCoupons(user.sub, cartIds);
  }
}

/** 移动端领券中心（公开接口） */
@ApiTags('portal-coupon')
@Controller({ path: 'portal/coupons', version: '1' })
export class PortalCouponController {
  constructor(private readonly memberService: MemberService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: '获取可领取的优惠券列表（领券中心）' })
  @ApiPaginatedResponse(CouponVo)
  listAvailableCoupons(@Query() query: PageQueryDto) {
    return this.memberService.listAvailableCoupons(query.page, query.limit);
  }
}
