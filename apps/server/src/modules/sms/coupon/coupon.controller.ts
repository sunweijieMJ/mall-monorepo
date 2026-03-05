import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CouponService } from './coupon.service';
import { PageQueryDto } from '@/common/dto/page-result.dto';
import { CreateCouponDto, UpdateCouponDto } from './dto/create-coupon.dto';

@ApiTags('管理端-SMS-优惠券')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'admin/sms/coupons', version: '1' })
export class CouponController {
  constructor(private readonly service: CouponService) {}

  @Get('list')
  @ApiOperation({ summary: '分页获取优惠券列表' })
  list(
    @Query() q: PageQueryDto,
    @Query('name') name?: string,
    @Query('type') type?: string,
  ) {
    return this.service.list(
      Object.assign(q, {
        name,
        type: type != null ? Number(type) : undefined,
      }),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: '获取优惠券详情（含关联商品/分类）' })
  detail(@Param('id', ParseIntPipe) id: number) {
    return this.service.detail(id);
  }

  @Post('create')
  @ApiOperation({ summary: '添加优惠券' })
  create(@Body() dto: CreateCouponDto) {
    return this.service.create(dto);
  }

  @Post('update/:id')
  @ApiOperation({ summary: '修改优惠券' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCouponDto) {
    return this.service.update(id, dto);
  }

  @Post('delete/:id')
  @ApiOperation({ summary: '删除优惠券' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }
}

@ApiTags('管理端-SMS-优惠券领取记录')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'admin/sms/coupon-histories', version: '1' })
export class CouponHistoryController {
  constructor(private readonly service: CouponService) {}

  @Get('list')
  @ApiOperation({ summary: '分页查询优惠券领取记录' })
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
