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
import { BatchDeleteDto } from '@/common/dto/batch-delete.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ApiWrappedResponse } from '@/common/decorators/api-wrapped-response.decorator';
import { ApiPaginatedResponse } from '@/common/decorators/api-paginated-response.decorator';
import { OrderVo } from './vo/order.vo';
import { OrderDetailVo } from './vo/order-detail.vo';
import { ConfirmOrderResultVo } from './vo/confirm-order-result.vo';
import { GenerateOrderResultVo } from './vo/generate-order-result.vo';
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
import { PaySuccessDto } from './dto/portal-order-action.dto';

// ======================== 管理端 ========================

@ApiTags('admin-order')
@ApiBearerAuth('admin-jwt')
@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'admin/oms/orders', version: '1' })
export class AdminOrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get('list')
  @ApiOperation({
    summary: '管理端订单列表',
    description: '对应前端 GET /order/list',
  })
  @ApiPaginatedResponse(OrderVo)
  list(@Query() query: AdminOrderQueryDto) {
    return this.orderService.adminList(query);
  }

  @Get('detail/:id')
  @ApiOperation({
    summary: '订单详情',
    description: '对应前端 GET /order/detail/:id',
  })
  @ApiParam({ name: 'id', description: '订单ID', type: 'integer' })
  @ApiWrappedResponse(OrderDetailVo)
  getItem(@Param('id', ParseIntPipe) id: number) {
    return this.orderService.detail(id);
  }

  @Delete('delete')
  @ApiOperation({
    summary: '删除订单',
    description: '对应前端 DELETE /order/delete?ids=1,2',
  })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  batchDelete(@Body() dto: BatchDeleteDto) {
    return this.orderService.adminDelete(dto.ids);
  }

  @Post('delivery')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '批量发货',
    description: '对应前端 POST /order/delivery',
  })
  @ApiBody({ type: [AdminOrderDeliveryDto] })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  delivery(@Body() deliveryList: AdminOrderDeliveryDto[]) {
    return this.orderService.delivery(deliveryList);
  }

  @Post('close')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '关闭订单',
    description: '对应前端 POST /order/close',
  })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  close(@Body() body: AdminOrderCloseDto) {
    return this.orderService.close(body.ids, body.note);
  }

  @Put(':id/receiver-info')
  @ApiOperation({
    summary: '修改收货人信息',
    description: '对应前端 PUT /order/:id/receiverInfo',
  })
  @ApiParam({ name: 'id', description: '订单ID', type: 'integer' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  updateReceiverInfo(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AdminOrderReceiverDto,
  ) {
    return this.orderService.updateReceiverInfo({ ...dto, orderId: id });
  }

  @Put(':id/money-info')
  @ApiOperation({
    summary: '修改费用信息',
    description: '对应前端 PUT /order/:id/moneyInfo',
  })
  @ApiParam({ name: 'id', description: '订单ID', type: 'integer' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
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
  @ApiParam({ name: 'id', description: '订单ID', type: 'integer' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  updateNote(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: AdminOrderNoteDto,
  ) {
    return this.orderService.updateNote(id, body.note, body.status);
  }
}

// ======================== 移动端 ========================

@ApiTags('portal-order')
@ApiBearerAuth('portal-jwt')
@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'portal/orders', version: '1' })
export class PortalOrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('confirm')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '生成确认订单',
    description: '对应前端 POST /order/generateConfirmOrder',
  })
  @ApiWrappedResponse(ConfirmOrderResultVo)
  confirm(@CurrentUser() user: JwtPayload, @Body() dto: PortalConfirmOrderDto) {
    return this.orderService.generateConfirmOrder(user.sub, dto.cartIds ?? []);
  }

  @Post('generate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '提交订单',
    description: '对应前端 POST /order/generateOrder',
  })
  @ApiWrappedResponse(GenerateOrderResultVo)
  generate(
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
  @ApiPaginatedResponse(OrderVo)
  @ApiQuery({
    name: 'status',
    required: false,
    type: Number,
    enum: [0, 1, 2, 3, 4, 5],
    description: '订单状态',
  })
  list(
    @CurrentUser() user: JwtPayload,
    @Query('status', new ParseIntPipe({ optional: true })) status?: number,
    @Query() query?: PageQueryDto,
  ) {
    return this.orderService.memberList(user.sub, status ?? -1, query!);
  }

  @Get('detail/:orderId')
  @ApiOperation({
    summary: '订单详情',
    description: '对应前端 GET /order/detail/:orderId',
  })
  @ApiParam({ name: 'orderId', description: '订单ID', type: 'integer' })
  @ApiWrappedResponse(OrderDetailVo)
  getItem(
    @CurrentUser() user: JwtPayload,
    @Param('orderId', ParseIntPipe) orderId: number,
  ) {
    return this.orderService.detail(orderId, user.sub);
  }

  @Post(':orderId/pay')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '支付成功回调',
    description: '对应前端 POST /order/:orderId/pay',
  })
  @ApiParam({ name: 'orderId', description: '订单ID', type: 'integer' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  paySuccess(
    @CurrentUser() user: JwtPayload,
    @Param('orderId', ParseIntPipe) orderId: number,
    @Body() dto: PaySuccessDto,
  ) {
    return this.orderService.paySuccess(orderId, dto.payType ?? 0, user.sub);
  }

  @Put(':orderId/cancel')
  @ApiOperation({
    summary: '取消订单',
    description: '对应前端 PUT /order/:orderId/cancel',
  })
  @ApiParam({ name: 'orderId', description: '订单ID', type: 'integer' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  cancel(
    @CurrentUser() user: JwtPayload,
    @Param('orderId', ParseIntPipe) orderId: number,
  ) {
    return this.orderService.cancelOrder(user.sub, orderId);
  }

  @Put(':orderId/confirm-receive')
  @ApiOperation({
    summary: '确认收货',
    description: '对应前端 PUT /order/:orderId/confirm-receive',
  })
  @ApiParam({ name: 'orderId', description: '订单ID', type: 'integer' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  confirmReceive(
    @CurrentUser() user: JwtPayload,
    @Param('orderId', ParseIntPipe) orderId: number,
  ) {
    return this.orderService.confirmReceive(user.sub, orderId);
  }

  @Delete(':orderId')
  @ApiOperation({
    summary: '删除订单',
    description:
      '仅允许删除已完成或已取消的订单，对应前端 DELETE /order/:orderId',
  })
  @ApiParam({ name: 'orderId', description: '订单ID', type: 'integer' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  delete(
    @CurrentUser() user: JwtPayload,
    @Param('orderId', ParseIntPipe) orderId: number,
  ) {
    return this.orderService.deleteOrder(user.sub, orderId);
  }
}
