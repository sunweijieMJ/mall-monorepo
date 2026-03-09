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
  UseGuards,
} from '@nestjs/common';
import { BatchDeleteDto } from '@/common/dto/batch-delete.dto';
import { UpdateCartQuantityDto } from '@/common/dto/batch-update-status.dto';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ApiWrappedResponse } from '@/common/decorators/api-wrapped-response.decorator';
import { AuthGuard } from '@nestjs/passport';
import { CartService } from './cart.service';
import { AddCartDto } from './dto/add-cart.dto';
import { UpdateCartAttrDto } from './dto/update-cart-attr.dto';
import { OrderService } from '@/modules/oms/order/order.service';
import { CurrentUser } from '@/core/auth/decorators/current-user.decorator';
import { JwtPayload } from '@/core/auth/types/jwt-payload.type';
import { CartItemVo } from './vo/cart-item.vo';
import { CartPromotionItemVo } from '@/modules/oms/order/vo/cart-promotion-item.vo';
import { CartProductVo } from './vo/cart-product.vo';

@ApiTags('portal-cart')
@ApiBearerAuth('portal-jwt')
@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'portal/carts', version: '1' })
export class CartController {
  constructor(
    private readonly service: CartService,
    private readonly orderService: OrderService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '加入购物车',
    description: '对应前端 POST /cart/add',
  })
  @ApiWrappedResponse(CartItemVo)
  create(@CurrentUser() user: JwtPayload, @Body() dto: AddCartDto) {
    return this.service.add(user.sub, dto);
  }

  @Post('batch-delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '删除购物车商品',
    description: '对应前端 POST /cart/delete?ids=1,2',
  })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  delete(@CurrentUser() user: JwtPayload, @Body() dto: BatchDeleteDto) {
    return this.service.delete(user.sub, dto.ids);
  }

  @Get()
  @ApiOperation({
    summary: '获取购物车列表',
    description: '对应前端 GET /cart/list',
  })
  @ApiWrappedResponse(CartItemVo, { isArray: true })
  list(@CurrentUser() user: JwtPayload) {
    return this.service.getCartList(user.sub);
  }

  @Get('count')
  @ApiOperation({ summary: '获取购物车商品数量' })
  @ApiOkResponse({ type: Number, description: '购物车商品数量' })
  count(@CurrentUser() user: JwtPayload) {
    return this.service.getCount(user.sub);
  }

  @Get('promotion')
  @ApiOperation({
    summary: '获取含促销信息的购物车列表',
    description: '对应前端 GET /cart/promotion，结算页用于展示折后价和优惠信息',
  })
  @ApiWrappedResponse(CartPromotionItemVo, { isArray: true })
  @ApiQuery({
    name: 'cartIds',
    required: true,
    description: '购物车条目 ID，逗号分隔',
    type: 'array',
    items: { type: 'integer' },
  })
  promotionList(
    @CurrentUser() user: JwtPayload,
    @Query('cartIds', new ParseArrayPipe({ items: Number, separator: ',' }))
    cartIds: number[],
  ) {
    return this.orderService.listCartPromotion(user.sub, cartIds);
  }

  @Get('products/:productId')
  @ApiOperation({
    summary: '获取购物车商品的规格列表',
    description: '对应前端 GET /cart/getProduct/:productId，用于重新选择规格',
  })
  @ApiParam({ name: 'productId', description: '商品ID', type: 'integer' })
  @ApiWrappedResponse(CartProductVo)
  cartProduct(@Param('productId', ParseIntPipe) productId: number) {
    return this.service.getCartProduct(productId);
  }

  @Delete('clear')
  @ApiOperation({ summary: '清空购物车' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  clear(@CurrentUser() user: JwtPayload) {
    return this.service.clear(user.sub);
  }

  @Put(':id/quantity')
  @ApiOperation({ summary: '修改购物车商品数量' })
  @ApiParam({ name: 'id', description: '购物车条目ID', type: 'integer' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  updateQuantity(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateCartQuantityDto,
  ) {
    return this.service.updateQuantity(user.sub, id, dto.productQuantity);
  }

  @Put(':id/attr')
  @ApiOperation({
    summary: '修改购物车商品规格',
    description: '对应前端 POST /cart/update/attr',
  })
  @ApiParam({ name: 'id', description: '购物车条目ID', type: 'integer' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  updateAttr(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateCartAttrDto,
  ) {
    return this.service.updateAttr(user.sub, id, dto);
  }
}
