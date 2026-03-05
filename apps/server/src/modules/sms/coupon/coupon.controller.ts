import {
  Body,
  Controller,
  Delete,
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

@ApiTags('管理端-SMS-优惠券')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'admin/sms/coupons', version: '1' })
export class CouponController {
  constructor(private readonly service: CouponService) {}

  @Get('list') list(@Query() q: PageQueryDto) {
    return this.service.list(q);
  }
  @Get(':id') detail(@Param('id', ParseIntPipe) id: number) {
    return this.service.detail(id);
  }
  @Post('create') create(@Body() dto: any) {
    return this.service.create(dto);
  }
  @Post('update/:id') update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: any,
  ) {
    return this.service.update(id, dto);
  }
  @Delete('delete') delete(@Query('ids') ids: string) {
    return this.service.delete(ids.split(',').map(Number));
  }

  @Get(':id/history')
  @ApiOperation({
    summary: '优惠券领取记录',
    description: '对应前端 GET /couponHistory/list?couponId=xx',
  })
  listHistory(
    @Param('id', ParseIntPipe) couponId: number,
    @Query() q: PageQueryDto,
  ) {
    return this.service.listHistory(couponId, q);
  }
}
