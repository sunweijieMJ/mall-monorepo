import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { OrderSettingService } from './order-setting.service';

@ApiTags('管理端-订单设置')
@Controller({ path: 'admin/oms/orderSetting', version: '1' })
export class OrderSettingController {
  constructor(private readonly orderSettingService: OrderSettingService) {}

  @Get(':id')
  @ApiOperation({
    summary: '获取订单设置',
    description: '对应前端 GET /orderSetting/:id',
  })
  getItem(@Param('id', ParseIntPipe) id: number) {
    return this.orderSettingService.getItem(id);
  }

  @Post('update/:id')
  @ApiOperation({
    summary: '更新订单设置',
    description: '对应前端 POST /orderSetting/update/:id',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: Record<string, unknown>,
  ) {
    return this.orderSettingService.update(id, body);
  }
}
