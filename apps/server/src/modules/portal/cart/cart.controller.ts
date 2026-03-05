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
import { CartService, AddCartDto } from './cart.service';
import { OrderService } from '@/modules/oms/order/order.service';
import { CurrentUser } from '@/core/auth/decorators/current-user.decorator';
import { JwtPayload } from '@/core/auth/types/jwt-payload.type';

@ApiTags('移动端-购物车')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'portal/cart', version: '1' })
export class CartController {
  constructor(
    private readonly service: CartService,
    private readonly orderService: OrderService,
  ) {}

  @Get('list')
  @ApiOperation({
    summary: '获取购物车列表',
    description: '对应前端 GET /cart/list',
  })
  getList(@CurrentUser() user: JwtPayload) {
    return this.service.getCartList(user.sub);
  }

  @Get('getCartItemCount')
  @ApiOperation({ summary: '获取购物车商品数量' })
  getCount(@CurrentUser() user: JwtPayload) {
    return this.service.getCount(user.sub);
  }

  @Post('add')
  @ApiOperation({
    summary: '加入购物车',
    description: '对应前端 POST /cart/add',
  })
  add(@CurrentUser() user: JwtPayload, @Body() dto: AddCartDto) {
    return this.service.add(user.sub, dto);
  }

  @Post('update/quantity')
  @ApiOperation({ summary: '修改购物车商品数量' })
  updateQuantity(
    @CurrentUser() user: JwtPayload,
    @Query('id') id: string,
    @Query('quantity') quantity: string,
  ) {
    return this.service.updateQuantity(user.sub, Number(id), Number(quantity));
  }

  @Post('delete')
  @ApiOperation({
    summary: '删除购物车商品',
    description: '对应前端 POST /cart/delete?ids=1,2',
  })
  delete(@CurrentUser() user: JwtPayload, @Query('ids') ids: string) {
    return this.service.delete(user.sub, ids.split(',').map(Number));
  }

  @Post('clear')
  @ApiOperation({ summary: '清空购物车' })
  clear(@CurrentUser() user: JwtPayload) {
    return this.service.clear(user.sub);
  }

  @Get('list/promotion')
  @ApiOperation({
    summary: '获取含促销信息的购物车列表',
    description:
      '对应前端 GET /cart/list/promotion，结算页用于展示折后价和优惠信息',
  })
  listPromotion(
    @CurrentUser() user: JwtPayload,
    @Query('cartIds') cartIds?: string,
  ) {
    const ids = cartIds ? cartIds.split(',').map(Number) : undefined;
    return this.orderService.listCartPromotion(user.sub, ids);
  }

  @Get('getProduct/:productId')
  @ApiOperation({
    summary: '获取购物车商品的规格列表',
    description: '对应前端 GET /cart/getProduct/:productId，用于重新选择规格',
  })
  getCartProduct(@Param('productId', ParseIntPipe) productId: number) {
    return this.service.getCartProduct(productId);
  }

  @Post('update/attr')
  @ApiOperation({
    summary: '修改购物车商品规格',
    description: '对应前端 POST /cart/update/attr',
  })
  updateAttr(@CurrentUser() user: JwtPayload, @Body() dto: any) {
    return this.service.updateAttr(user.sub, dto);
  }
}
