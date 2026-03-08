import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CouponService } from './coupon.service';
import { PageQueryDto } from '@/common/dto/page-result.dto';
import { CreateCouponDto, UpdateCouponDto } from './dto/create-coupon.dto';
import { ApiPaginatedResponse } from '@/common/decorators/api-paginated-response.decorator';
import { CouponVo } from './vo/coupon.vo';
import { CouponHistoryVo } from './vo/coupon-history.vo';
import { CouponDetailVo } from './vo/coupon-detail.vo';

@ApiTags('admin-coupon')
@ApiBearerAuth('admin-jwt')
@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'admin/sms/coupons', version: '1' })
export class CouponController {
  constructor(private readonly service: CouponService) {}

  @Get('list')
  @ApiOperation({ summary: '分页获取优惠券列表' })
  @ApiPaginatedResponse(CouponVo)
  @ApiQuery({ name: 'keyword', required: false })
  @ApiQuery({ name: 'type', required: false, type: Number, enum: [0, 1, 2] })
  list(
    @Query() q: PageQueryDto,
    @Query('keyword') keyword?: string,
    @Query('type') type?: string,
  ) {
    return this.service.list(
      Object.assign(q, {
        keyword,
        type: type != null ? Number(type) : undefined,
      }),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: '获取优惠券详情（含关联商品/分类）' })
  @ApiOkResponse({ type: CouponDetailVo })
  getItem(@Param('id', ParseIntPipe) id: number) {
    return this.service.detail(id);
  }

  @Post('create')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '添加优惠券' })
  @ApiOkResponse({ type: CouponVo })
  create(@Body() dto: CreateCouponDto) {
    return this.service.create(dto);
  }

  @Put('update/:id')
  @ApiOperation({ summary: '修改优惠券' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCouponDto) {
    return this.service.update(id, dto);
  }

  @Delete('delete/:id')
  @ApiOperation({ summary: '删除优惠券' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }
}

@ApiTags('admin-coupon')
@ApiBearerAuth('admin-jwt')
@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'admin/sms/coupon-histories', version: '1' })
export class CouponHistoryController {
  constructor(private readonly service: CouponService) {}

  @Get('list')
  @ApiOperation({ summary: '分页查询优惠券领取记录' })
  @ApiPaginatedResponse(CouponHistoryVo)
  @ApiQuery({ name: 'couponId', required: false, type: Number })
  @ApiQuery({
    name: 'useStatus',
    required: false,
    type: Number,
    enum: [0, 1, 2],
  })
  @ApiQuery({ name: 'orderSn', required: false })
  list(
    @Query() q: PageQueryDto,
    @Query('couponId') couponId?: string,
    @Query('useStatus') useStatus?: string,
    @Query('orderSn') orderSn?: string,
  ) {
    return this.service.listHistory(
      Object.assign(q, {
        couponId: couponId != null ? Number(couponId) : undefined,
        useStatus: useStatus != null ? Number(useStatus) : undefined,
        orderSn,
      }),
    );
  }
}
