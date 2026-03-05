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
import { OrderService } from './order.service';
import { PageQueryDto } from '@/common/dto/page-result.dto';

// ======================== 管理端 ========================

@ApiTags('管理端-OMS-订单管理')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'admin/oms/orders', version: '1' })
export class AdminOrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get('list')
  @ApiOperation({
    summary: '管理端订单列表',
    description: '对应前端 GET /order/list',
  })
  list(@Query() query: any) {
    return this.orderService.adminList(query);
  }

  @Get('detail/:id')
  @ApiOperation({
    summary: '订单详情',
    description: '对应前端 GET /order/detail/:id',
  })
  detail(@Param('id', ParseIntPipe) id: number) {
    return this.orderService.detail(id);
  }

  @Delete('delete')
  @ApiOperation({
    summary: '删除订单',
    description: '对应前端 DELETE /order/delete?ids=1,2',
  })
  delete(@Query('ids') ids: string) {
    return this.orderService.adminDelete(ids.split(',').map(Number));
  }

  @Post('delivery')
  @ApiOperation({
    summary: '批量发货',
    description: '对应前端 POST /order/delivery',
  })
  delivery(@Body() deliveryList: any[]) {
    return this.orderService.delivery(deliveryList);
  }

  @Post('close')
  @ApiOperation({
    summary: '关闭订单',
    description: '对应前端 POST /order/close?ids=1&note=备注',
  })
  close(@Query('ids') ids: string, @Query('note') note: string) {
    return this.orderService.close(ids.split(',').map(Number), note);
  }
}

// ======================== 移动端 ========================

@ApiTags('移动端-OMS-订单')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'portal/orders', version: '1' })
export class PortalOrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('generateConfirmOrder')
  @ApiOperation({
    summary: '生成确认订单',
    description: '对应前端 POST /order/generateConfirmOrder',
  })
  generateConfirmOrder(@Body() dto: any) {
    // TODO: 从 JWT 取 memberId
    return this.orderService.generateConfirmOrder(0, dto.cartIds ?? []);
  }

  @Post('generateOrder')
  @ApiOperation({
    summary: '提交订单',
    description: '对应前端 POST /order/generateOrder',
  })
  generateOrder(@Body() dto: any) {
    // TODO: 从 JWT 取 memberId
    return this.orderService.generateOrder(0, dto);
  }

  @Get('list')
  @ApiOperation({
    summary: '我的订单列表',
    description: '对应前端 GET /order/list',
  })
  memberList(@Query('status') status: string, @Query() query: PageQueryDto) {
    // TODO: 从 JWT 取 memberId
    return this.orderService.memberList(0, Number(status ?? -1), query);
  }

  @Get('detail/:orderId')
  @ApiOperation({
    summary: '订单详情',
    description: '对应前端 GET /order/detail/:orderId',
  })
  detail(@Param('orderId', ParseIntPipe) orderId: number) {
    return this.orderService.detail(orderId);
  }

  @Post('paySuccess')
  @ApiOperation({
    summary: '支付成功回调',
    description: '对应前端 POST /order/paySuccess',
  })
  paySuccess(
    @Body('orderId') orderId: number,
    @Body('payType') payType: number,
  ) {
    return this.orderService.paySuccess(orderId, payType);
  }

  @Post('cancelUserOrder')
  @ApiOperation({
    summary: '取消订单',
    description: '对应前端 POST /order/cancelUserOrder',
  })
  cancelOrder(@Body() dto: any) {
    return this.orderService.cancelOrder(0, dto.orderId);
  }

  @Post('confirmReceiveOrder')
  @ApiOperation({
    summary: '确认收货',
    description: '对应前端 POST /order/confirmReceiveOrder',
  })
  confirmReceive(@Body() dto: any) {
    return this.orderService.confirmReceive(0, dto.orderId);
  }
}
