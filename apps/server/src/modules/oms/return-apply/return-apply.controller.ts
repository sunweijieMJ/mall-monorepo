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
import { ReturnApplyService } from './return-apply.service';
import { PageQueryDto } from '@/common/dto/page-result.dto';

@ApiTags('管理端-OMS-退货申请')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'admin/oms/return-applies', version: '1' })
export class ReturnApplyController {
  constructor(private readonly service: ReturnApplyService) {}

  @Get('list')
  @ApiOperation({
    summary: '退货申请列表',
    description: '对应前端 GET /returnApply/list',
  })
  list(@Query() query: PageQueryDto) {
    return this.service.list(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: '退货详情',
    description: '对应前端 GET /returnApply/detail/:id',
  })
  detail(@Param('id', ParseIntPipe) id: number) {
    return this.service.detail(id);
  }

  @Post('update/:id')
  @ApiOperation({
    summary: '处理退货申请',
    description: '对应前端 POST /returnApply/update/:id',
  })
  handle(@Param('id', ParseIntPipe) id: number, @Body() dto: any) {
    return this.service.handle(id, dto);
  }

  @Post(':id/receive')
  @ApiOperation({
    summary: '确认收货',
    description: '对应前端 POST /returnApply/receive/:id',
  })
  confirmReceive(@Param('id', ParseIntPipe) id: number, @Body() dto: any) {
    return this.service.confirmReceive(id, dto);
  }

  @Delete('delete')
  @ApiOperation({ summary: '删除退货申请' })
  delete(@Query('ids') ids: string) {
    return this.service.delete(ids.split(',').map(Number));
  }
}
