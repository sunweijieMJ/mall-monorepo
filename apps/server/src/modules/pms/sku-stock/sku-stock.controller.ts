import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { SkuStockService } from './sku-stock.service';
import { SkuStockItemDto } from './dto/update-sku-stock.dto';

@ApiTags('管理端-PMS-SKU库存')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('sku/stock')
export class SkuStockController {
  constructor(private readonly service: SkuStockService) {}

  @Get(':pid')
  @ApiOperation({ summary: '查询 SKU 库存列表' })
  getList(
    @Param('pid', ParseIntPipe) pid: number,
    @Query('keyword') keyword?: string,
  ) {
    return this.service.getList(pid, keyword);
  }

  @Post('update/:pid')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '批量更新SKU库存' })
  update(
    @Param('pid', ParseIntPipe) pid: number,
    @Body() stocks: SkuStockItemDto[],
  ) {
    // 将 DTO 中的 decimal 字段从 number 转为 string，以匹配 Entity 类型
    const converted = stocks.map(({ price, promotionPrice, ...rest }) => ({
      ...rest,
      ...(price != null ? { price: String(price) } : {}),
      ...(promotionPrice != null
        ? { promotionPrice: String(promotionPrice) }
        : {}),
    }));
    return this.service.update(pid, converted);
  }
}
