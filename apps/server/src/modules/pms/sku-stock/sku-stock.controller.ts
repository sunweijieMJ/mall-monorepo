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
import { SkuStockService } from './sku-stock.service';

@ApiTags('管理端-PMS-SKU库存')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'admin/pms/sku-stocks', version: '1' })
export class SkuStockController {
  constructor(private readonly service: SkuStockService) {}

  @Get('list/:productId')
  @ApiOperation({
    summary: '查询 SKU 库存列表',
    description: '对应前端 GET /skuStock/list/:productId',
  })
  getList(
    @Param('productId', ParseIntPipe) productId: number,
    @Query('keyword') keyword?: string,
  ) {
    return this.service.getList(productId, keyword);
  }

  @Post('update/:productId')
  @ApiOperation({
    summary: '批量更新SKU库存',
    description: '对应前端 POST /skuStock/update/:productId',
  })
  update(
    @Param('productId', ParseIntPipe) productId: number,
    @Body() stocks: any[],
  ) {
    return this.service.update(productId, stocks);
  }
}
