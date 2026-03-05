import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { OrderService } from './order.service';
import { PageQueryDto } from '@/common/dto/page-result.dto';
import { CurrentUser } from '@/core/auth/decorators/current-user.decorator';
import { JwtPayload } from '@/core/auth/types/jwt-payload.type';
import { AdminOrderQueryDto } from './dto/admin-order-query.dto';
import { AdminOrderDeliveryDto } from './dto/admin-order-delivery.dto';
import { AdminOrderReceiverDto } from './dto/admin-order-receiver.dto';
import { AdminOrderMoneyDto } from './dto/admin-order-money.dto';
import { AdminOrderNoteDto } from './dto/admin-order-note.dto';
import { AdminOrderCloseDto } from './dto/admin-order-close.dto';
import { PortalGenerateOrderDto } from './dto/portal-generate-order.dto';
import { PortalConfirmOrderDto } from './dto/portal-confirm-order.dto';

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
  list(@Query() query: AdminOrderQueryDto) {
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
  delivery(@Body() deliveryList: AdminOrderDeliveryDto[]) {
    return this.orderService.delivery(deliveryList);
  }

  @Post('close')
  @ApiOperation({
    summary: '关闭订单',
    description: '对应前端 POST /order/close',
  })
  close(@Body() body: AdminOrderCloseDto) {
    return this.orderService.close(body.ids, body.note);
  }

  @Put(':id/receiverInfo')
  @ApiOperation({
    summary: '修改收货人信息',
    description: '对应前端 PUT /order/:id/receiverInfo',
  })
  updateReceiverInfo(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AdminOrderReceiverDto,
  ) {
    return this.orderService.updateReceiverInfo({ ...dto, orderId: id });
  }

  @Put(':id/moneyInfo')
  @ApiOperation({
    summary: '修改费用信息',
    description: '对应前端 PUT /order/:id/moneyInfo',
  })
  updateMoneyInfo(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AdminOrderMoneyDto,
  ) {
    return this.orderService.updateMoneyInfo({ ...dto, orderId: id });
  }

  @Put(':id/note')
  @ApiOperation({
    summary: '修改订单备注',
    description: '对应前端 PUT /order/:id/note',
  })
  updateNote(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: AdminOrderNoteDto,
  ) {
    return this.orderService.updateNote(id, body.note, body.status);
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
  generateConfirmOrder(
    @CurrentUser() user: JwtPayload,
    @Body() dto: PortalConfirmOrderDto,
  ) {
    return this.orderService.generateConfirmOrder(user.sub, dto.cartIds ?? []);
  }

  @Post('generateOrder')
  @ApiOperation({
    summary: '提交订单',
    description: '对应前端 POST /order/generateOrder',
  })
  generateOrder(
    @CurrentUser() user: JwtPayload,
    @Body() dto: PortalGenerateOrderDto,
  ) {
    return this.orderService.generateOrder(user.sub, dto);
  }

  @Get('list')
  @ApiOperation({
    summary: '我的订单列表',
    description: '对应前端 GET /order/list',
  })
  memberList(
    @CurrentUser() user: JwtPayload,
    @Query('status') status: string,
    @Query() query: PageQueryDto,
  ) {
    return this.orderService.memberList(user.sub, Number(status ?? -1), query);
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
  cancelOrder(
    @CurrentUser() user: JwtPayload,
    @Body('orderId', ParseIntPipe) orderId: number,
  ) {
    return this.orderService.cancelOrder(user.sub, orderId);
  }

  @Post('confirmReceiveOrder')
  @ApiOperation({
    summary: '确认收货',
    description: '对应前端 POST /order/confirmReceiveOrder',
  })
  confirmReceive(
    @CurrentUser() user: JwtPayload,
    @Body('orderId', ParseIntPipe) orderId: number,
  ) {
    return this.orderService.confirmReceive(user.sub, orderId);
  }

  @Post('deleteOrder')
  @ApiOperation({
    summary: '删除订单',
    description:
      '仅允许删除已完成或已取消的订单，对应前端 POST /order/deleteOrder',
  })
  deleteOrder(
    @CurrentUser() user: JwtPayload,
    @Body('orderId', ParseIntPipe) orderId: number,
  ) {
    return this.orderService.deleteOrder(user.sub, orderId);
  }
}
