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
import { CartService } from './cart.service';

@ApiTags('移动端-购物车')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'portal/cart', version: '1' })
export class CartController {
  constructor(private readonly service: CartService) {}

  @Get('list')
  @ApiOperation({
    summary: '获取购物车列表',
    description: '对应前端 GET /cart/list',
  })
  getList() {
    /* TODO: 从 JWT 取 memberId */ return this.service.getCartList(0);
  }

  @Get('getCartItemCount')
  @ApiOperation({ summary: '获取购物车商品数量' })
  getCount() {
    return this.service.getCount(0);
  }

  @Post('add')
  @ApiOperation({
    summary: '加入购物车',
    description: '对应前端 POST /cart/add',
  })
  add(@Body() dto: any) {
    return this.service.add(0, dto);
  }

  @Post('update/quantity')
  @ApiOperation({ summary: '修改购物车商品数量' })
  updateQuantity(@Query('id') id: string, @Query('quantity') quantity: string) {
    return this.service.updateQuantity(0, Number(id), Number(quantity));
  }

  @Post('delete')
  @ApiOperation({
    summary: '删除购物车商品',
    description: '对应前端 POST /cart/delete?ids=1,2',
  })
  delete(@Query('ids') ids: string) {
    return this.service.delete(0, ids.split(',').map(Number));
  }

  @Post('clear')
  @ApiOperation({ summary: '清空购物车' })
  clear() {
    return this.service.clear(0);
  }
}
