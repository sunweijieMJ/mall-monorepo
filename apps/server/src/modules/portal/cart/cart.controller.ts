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

  @Get('list')
  @ApiOperation({
    summary: '获取购物车列表',
    description: '对应前端 GET /cart/list',
  })
  @ApiOkResponse({ type: [CartItemVo] })
  list(@CurrentUser() user: JwtPayload) {
    return this.service.getCartList(user.sub);
  }

  @Get('count')
  @ApiOperation({ summary: '获取购物车商品数量' })
  @ApiOkResponse({ type: Number, description: '购物车商品数量' })
  count(@CurrentUser() user: JwtPayload) {
    return this.service.getCount(user.sub);
  }

  @Post('create')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '加入购物车',
    description: '对应前端 POST /cart/add',
  })
  @ApiOkResponse({ type: CartItemVo })
  create(@CurrentUser() user: JwtPayload, @Body() dto: AddCartDto) {
    return this.service.add(user.sub, dto);
  }

  @Put('update/quantity')
  @ApiOperation({ summary: '修改购物车商品数量' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  updateQuantity(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateCartQuantityDto,
  ) {
    return this.service.updateQuantity(user.sub, dto.id, dto.productQuantity);
  }

  @Delete('delete')
  @ApiOperation({
    summary: '删除购物车商品',
    description: '对应前端 POST /cart/delete?ids=1,2',
  })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  delete(@CurrentUser() user: JwtPayload, @Body() dto: BatchDeleteDto) {
    return this.service.delete(user.sub, dto.ids);
  }

  @Delete('clear')
  @ApiOperation({ summary: '清空购物车' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  clear(@CurrentUser() user: JwtPayload) {
    return this.service.clear(user.sub);
  }

  @Get('promotion')
  @ApiOperation({
    summary: '获取含促销信息的购物车列表',
    description: '对应前端 GET /cart/promotion，结算页用于展示折后价和优惠信息',
  })
  @ApiOkResponse({ type: [CartPromotionItemVo] })
  @ApiQuery({
    name: 'cartIds',
    required: false,
    description: '购物车条目 ID，逗号分隔',
    type: 'array',
    items: { type: 'integer' },
  })
  promotionList(
    @CurrentUser() user: JwtPayload,
    @Query(
      'cartIds',
      new ParseArrayPipe({ items: Number, separator: ',', optional: true }),
    )
    cartIds?: number[],
  ) {
    return this.orderService.listCartPromotion(user.sub, cartIds);
  }

  @Get('product/:productId')
  @ApiOperation({
    summary: '获取购物车商品的规格列表',
    description: '对应前端 GET /cart/getProduct/:productId，用于重新选择规格',
  })
  @ApiParam({ name: 'productId', description: '商品ID', type: 'integer' })
  @ApiOkResponse({ type: CartProductVo })
  cartProduct(@Param('productId', ParseIntPipe) productId: number) {
    return this.service.getCartProduct(productId);
  }

  @Put('update/attr')
  @ApiOperation({
    summary: '修改购物车商品规格',
    description: '对应前端 POST /cart/update/attr',
  })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  updateAttr(@CurrentUser() user: JwtPayload, @Body() dto: UpdateCartAttrDto) {
    return this.service.updateAttr(user.sub, dto);
  }
}
