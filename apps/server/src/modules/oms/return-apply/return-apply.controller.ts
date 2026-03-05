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
import { CurrentUser } from '@/core/auth/decorators/current-user.decorator';
import { JwtPayload } from '@/core/auth/types/jwt-payload.type';
import { UpdateReturnStatusDto } from './dto/update-return-status.dto';
import { HandleReturnApplyDto } from './dto/handle-return-apply.dto';
import { ConfirmReceiveDto } from './dto/confirm-receive.dto';
import { PortalCreateReturnApplyDto } from './dto/portal-create-return-apply.dto';

@ApiTags('管理端-OMS-退货申请')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'admin/oms/returns', version: '1' })
export class ReturnApplyController {
  constructor(private readonly service: ReturnApplyService) {}

  @Get('list')
  @ApiOperation({
    summary: '退货申请列表',
    description: '支持过滤：status / startTime / endTime',
  })
  list(@Query() query: PageQueryDto & Record<string, any>) {
    return this.service.list(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: '退货申请详情',
    description: '对应前端 GET /returnApply/detail/:id',
  })
  detail(@Param('id', ParseIntPipe) id: number) {
    return this.service.detail(id);
  }

  @Post('update/status')
  @ApiOperation({
    summary: '更新退货申请状态',
    description: '对应前端 POST /returnApply/update/status，body 中需传 id',
  })
  updateStatus(@Body() dto: UpdateReturnStatusDto) {
    const { id, ...rest } = dto;
    return this.service.updateStatus(Number(id), rest);
  }

  @Post('update/:id')
  @ApiOperation({
    summary: '处理退货申请',
    description: '对应前端 POST /returnApply/update/:id',
  })
  handle(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: HandleReturnApplyDto,
  ) {
    return this.service.handle(id, dto);
  }

  @Post(':id/receive')
  @ApiOperation({
    summary: '确认收货',
    description: '对应前端 POST /returnApply/receive/:id',
  })
  confirmReceive(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ConfirmReceiveDto,
  ) {
    return this.service.confirmReceive(id, dto);
  }

  @Delete('delete')
  @ApiOperation({ summary: '删除退货申请' })
  delete(@Query('ids') ids: string) {
    return this.service.delete(ids.split(',').map(Number));
  }
}

/** 移动端退货申请 Controller */
@ApiTags('移动端-OMS-退货申请')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'portal/return-applies', version: '1' })
export class PortalReturnApplyController {
  constructor(private readonly returnApplyService: ReturnApplyService) {}

  @Post('create')
  @ApiOperation({ summary: '申请退货' })
  create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: PortalCreateReturnApplyDto,
  ) {
    return this.returnApplyService.portalCreate(user.sub, dto);
  }

  @Get('list')
  @ApiOperation({ summary: '我的退货申请列表' })
  list(@CurrentUser() user: JwtPayload, @Query() query: PageQueryDto) {
    return this.returnApplyService.portalList(user.sub, query);
  }
}
