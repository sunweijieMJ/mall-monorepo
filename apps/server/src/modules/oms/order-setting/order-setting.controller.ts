import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { OrderSettingService } from './order-setting.service';
import { UpdateOrderSettingDto } from './dto/update-order-setting.dto';

@ApiTags('管理端-订单设置')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'orderSetting', version: '1' })
export class OrderSettingController {
  constructor(private readonly service: OrderSettingService) {}

  @Get(':id')
  @ApiOperation({ summary: '获取订单设置' })
  getItem(@Param('id', ParseIntPipe) id: number) {
    return this.service.getItem(id);
  }

  @Post('update/:id')
  @ApiOperation({ summary: '更新订单设置' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateOrderSettingDto,
  ) {
    return this.service.update(id, body);
  }
}
