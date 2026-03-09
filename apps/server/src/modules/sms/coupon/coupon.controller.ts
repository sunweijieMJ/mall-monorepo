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
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ApiWrappedResponse } from '@/common/decorators/api-wrapped-response.decorator';
import { AuthGuard } from '@nestjs/passport';
import { CouponService } from './coupon.service';
import { QueryCouponDto, QueryCouponHistoryDto } from './dto/query-coupon.dto';
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

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '添加优惠券' })
  @ApiWrappedResponse(CouponVo)
  create(@Body() dto: CreateCouponDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: '分页获取优惠券列表' })
  @ApiPaginatedResponse(CouponVo)
  list(@Query() query: QueryCouponDto) {
    return this.service.list(query);
  }

  @Put(':id')
  @ApiOperation({ summary: '修改优惠券' })
  @ApiParam({ name: 'id', description: '优惠券ID', type: 'integer' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCouponDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除优惠券' })
  @ApiParam({ name: 'id', description: '优惠券ID', type: 'integer' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取优惠券详情（含关联商品/分类）' })
  @ApiParam({ name: 'id', description: '优惠券ID', type: 'integer' })
  @ApiWrappedResponse(CouponDetailVo)
  getItem(@Param('id', ParseIntPipe) id: number) {
    return this.service.detail(id);
  }
}

@ApiTags('admin-coupon')
@ApiBearerAuth('admin-jwt')
@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'admin/sms/coupon-histories', version: '1' })
export class CouponHistoryController {
  constructor(private readonly service: CouponService) {}

  @Get()
  @ApiOperation({ summary: '分页查询优惠券领取记录' })
  @ApiPaginatedResponse(CouponHistoryVo)
  list(@Query() query: QueryCouponHistoryDto) {
    return this.service.listHistory(query);
  }
}
