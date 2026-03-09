import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ApiWrappedResponse } from '@/common/decorators/api-wrapped-response.decorator';
import { OrderSettingVo } from './vo/order-setting.vo';
import { AuthGuard } from '@nestjs/passport';
import { OrderSettingService } from './order-setting.service';
import { UpdateOrderSettingDto } from './dto/update-order-setting.dto';

@ApiTags('admin-order-setting')
@ApiBearerAuth('admin-jwt')
@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'admin/oms/order-settings', version: '1' })
export class OrderSettingController {
  constructor(private readonly service: OrderSettingService) {}

  @Put(':id')
  @ApiOperation({ summary: '更新订单设置' })
  @ApiParam({ name: 'id', description: '订单设置ID', type: 'integer' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateOrderSettingDto,
  ) {
    return this.service.update(id, body);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取订单设置' })
  @ApiParam({ name: 'id', description: '订单设置ID', type: 'integer' })
  @ApiWrappedResponse(OrderSettingVo)
  getItem(@Param('id', ParseIntPipe) id: number) {
    return this.service.getItem(id);
  }
}
