import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
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
import { SkuStockService } from './sku-stock.service';
import { BatchUpdateSkuStockDto } from './dto/update-sku-stock.dto';
import { SkuStockVo } from './vo/sku-stock.vo';

@ApiTags('admin-sku-stock')
@ApiBearerAuth('admin-jwt')
@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'admin/pms/sku-stocks', version: '1' })
export class SkuStockController {
  constructor(private readonly service: SkuStockService) {}

  @Get(':productId')
  @ApiOperation({ summary: '查询 SKU 库存列表' })
  @ApiParam({ name: 'productId', description: '商品ID', type: 'integer' })
  @ApiWrappedResponse(SkuStockVo, { isArray: true })
  @ApiQuery({ name: 'keyword', required: false })
  list(
    @Param('productId', ParseIntPipe) productId: number,
    @Query('keyword') keyword?: string,
  ) {
    return this.service.getList(productId, keyword);
  }

  @Put(':productId')
  @ApiOperation({ summary: '批量更新SKU库存' })
  @ApiParam({ name: 'productId', description: '商品ID', type: 'integer' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  update(
    @Param('productId', ParseIntPipe) productId: number,
    @Body() dto: BatchUpdateSkuStockDto,
  ) {
    // 将 DTO 中的 decimal 字段从 number 转为 string，以匹配 Entity 类型
    const converted = dto.stocks.map(({ price, promotionPrice, ...rest }) => ({
      ...rest,
      ...(price != null ? { price: String(price) } : {}),
      ...(promotionPrice != null
        ? { promotionPrice: String(promotionPrice) }
        : {}),
    }));
    return this.service.update(productId, converted);
  }
}
