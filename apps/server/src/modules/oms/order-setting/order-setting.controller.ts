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
  ApiTags,
} from '@nestjs/swagger';
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

  @Get(':id')
  @ApiOperation({ summary: '获取订单设置' })
  @ApiOkResponse({ type: OrderSettingVo })
  getItem(@Param('id', ParseIntPipe) id: number) {
    return this.service.getItem(id);
  }

  @Put('update/:id')
  @ApiOperation({ summary: '更新订单设置' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateOrderSettingDto,
  ) {
    return this.service.update(id, body);
  }
}
