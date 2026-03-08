import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BatchDeleteDto } from '@/common/dto/batch-delete.dto';
import { BatchUpdateStatusDto } from '@/common/dto/batch-update-status.dto';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ApiPaginatedResponse } from '@/common/decorators/api-paginated-response.decorator';
import { ReturnReasonVo } from './vo/return-reason.vo';
import { AuthGuard } from '@nestjs/passport';
import { ReturnReasonService } from './return-reason.service';
import { PageQueryDto } from '@/common/dto/page-result.dto';
import { CreateReturnReasonDto } from './dto/create-return-reason.dto';
import { UpdateReturnReasonDto } from './dto/update-return-reason.dto';

@ApiTags('admin-return-reason')
@ApiBearerAuth('admin-jwt')
@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'admin/oms/return-reasons', version: '1' })
export class ReturnReasonController {
  constructor(private readonly service: ReturnReasonService) {}

  @Post('create')
  @ApiOperation({ summary: '添加退货原因' })
  @ApiOkResponse({ type: ReturnReasonVo })
  create(@Body() dto: CreateReturnReasonDto) {
    return this.service.create(dto);
  }

  @Put('update/status')
  @ApiOperation({ summary: '修改退货原因启用状态' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  updateStatus(@Body() dto: BatchUpdateStatusDto) {
    return this.service.updateStatus(dto.ids, dto.status);
  }

  @Put('update/:id')
  @ApiOperation({ summary: '修改退货原因' })
  @ApiParam({ name: 'id', description: '退货原因ID', type: 'integer' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateReturnReasonDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete('delete')
  @ApiOperation({ summary: '批量删除退货原因' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  batchDelete(@Body() dto: BatchDeleteDto) {
    return this.service.delete(dto.ids);
  }

  @Get('list')
  @ApiOperation({ summary: '分页查询退货原因' })
  @ApiPaginatedResponse(ReturnReasonVo)
  list(@Query() q: PageQueryDto) {
    return this.service.list(q);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取退货原因详情' })
  @ApiParam({ name: 'id', description: '退货原因ID', type: 'integer' })
  @ApiOkResponse({ type: ReturnReasonVo })
  getItem(@Param('id', ParseIntPipe) id: number) {
    return this.service.getItem(id);
  }
}
