import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BatchDeleteDto } from '@/common/dto/batch-delete.dto';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ApiPaginatedResponse } from '@/common/decorators/api-paginated-response.decorator';
import { ApiWrappedResponse } from '@/common/decorators/api-wrapped-response.decorator';
import { ReturnApplyVo } from './vo/return-apply.vo';
import { AuthGuard } from '@nestjs/passport';
import { ReturnApplyService } from './return-apply.service';
import { PageQueryDto } from '@/common/dto/page-result.dto';
import { ReturnApplyQueryDto } from './dto/return-apply-query.dto';
import { CurrentUser } from '@/core/auth/decorators/current-user.decorator';
import { JwtPayload } from '@/core/auth/types/jwt-payload.type';
import { UpdateReturnStatusDto } from './dto/update-return-status.dto';
import { HandleReturnApplyDto } from './dto/handle-return-apply.dto';
import { ConfirmReceiveDto } from './dto/confirm-receive.dto';
import { PortalCreateReturnApplyDto } from './dto/portal-create-return-apply.dto';

@ApiTags('admin-return-apply')
@ApiBearerAuth('admin-jwt')
@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'admin/oms/return-applies', version: '1' })
export class ReturnApplyController {
  constructor(private readonly service: ReturnApplyService) {}

  @Get('list')
  @ApiOperation({
    summary: '退货申请列表',
    description: '支持过滤：status / startTime / endTime',
  })
  @ApiPaginatedResponse(ReturnApplyVo)
  list(@Query() query: ReturnApplyQueryDto) {
    return this.service.list(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: '退货申请详情',
    description: '对应前端 GET /returnApply/detail/:id',
  })
  @ApiParam({ name: 'id', description: '退货申请ID', type: 'integer' })
  @ApiOkResponse({ type: ReturnApplyVo })
  getItem(@Param('id', ParseIntPipe) id: number) {
    return this.service.detail(id);
  }

  @Put('update/status')
  @ApiOperation({
    summary: '更新退货申请状态',
    description: '对应前端 PUT /returnApply/update/status，body 中需传 id',
  })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  updateStatus(@Body() dto: UpdateReturnStatusDto) {
    const { id, ...rest } = dto;
    return this.service.updateStatus(Number(id), rest);
  }

  @Put('update/:id')
  @ApiOperation({
    summary: '处理退货申请',
    description: '对应前端 PUT /returnApply/update/:id',
  })
  @ApiParam({ name: 'id', description: '退货申请ID', type: 'integer' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  handle(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: HandleReturnApplyDto,
  ) {
    return this.service.handle(id, dto);
  }

  @Post(':id/receive')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '确认收货',
    description: '对应前端 POST /returnApply/receive/:id',
  })
  @ApiParam({ name: 'id', description: '退货申请ID', type: 'integer' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  confirmReceive(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ConfirmReceiveDto,
  ) {
    return this.service.confirmReceive(id, dto);
  }

  @Delete('delete')
  @ApiOperation({ summary: '删除退货申请' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  batchDelete(@Body() dto: BatchDeleteDto) {
    return this.service.delete(dto.ids);
  }
}

/** 移动端退货申请 Controller */
@ApiTags('portal-return-apply')
@ApiBearerAuth('portal-jwt')
@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'portal/return-applies', version: '1' })
export class PortalReturnApplyController {
  constructor(private readonly returnApplyService: ReturnApplyService) {}

  @Post('create')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '申请退货' })
  @ApiOkResponse({ type: ReturnApplyVo })
  create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: PortalCreateReturnApplyDto,
  ) {
    return this.returnApplyService.portalCreate(user.sub, dto);
  }

  @Get('list')
  @ApiOperation({ summary: '我的退货申请列表' })
  @ApiPaginatedResponse(ReturnApplyVo)
  list(@CurrentUser() user: JwtPayload, @Query() query: PageQueryDto) {
    return this.returnApplyService.portalList(user.sub, query);
  }

  @Get(':id')
  @ApiOperation({ summary: '退货申请详情（会员端）' })
  @ApiParam({ name: 'id', description: '退货申请ID', type: 'integer' })
  @ApiWrappedResponse(ReturnApplyVo)
  getItem(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.returnApplyService.portalDetail(id, user.sub);
  }
}
