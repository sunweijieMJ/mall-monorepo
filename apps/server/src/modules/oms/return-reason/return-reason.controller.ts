import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ReturnReasonService } from './return-reason.service';
import { PageQueryDto } from '@/common/dto/page-result.dto';
import { CreateReturnReasonDto } from './dto/create-return-reason.dto';
import { UpdateReturnReasonDto } from './dto/update-return-reason.dto';

@ApiTags('管理端-OMS-退货原因')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'returnReason', version: '1' })
export class ReturnReasonController {
  constructor(private readonly service: ReturnReasonService) {}

  @Post('create')
  @ApiOperation({ summary: '添加退货原因' })
  create(@Body() dto: CreateReturnReasonDto) {
    return this.service.create(dto);
  }

  @Post('update/:id')
  @ApiOperation({ summary: '修改退货原因' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateReturnReasonDto,
  ) {
    return this.service.update(id, dto);
  }

  @Post('delete')
  @ApiOperation({ summary: '批量删除退货原因' })
  delete(@Query('ids') ids: string) {
    return this.service.delete(ids.split(',').map(Number));
  }

  @Post('update/status')
  @ApiOperation({ summary: '修改退货原因启用状态' })
  updateStatus(@Query('ids') ids: string, @Query('status') status: string) {
    return this.service.updateStatus(
      ids.split(',').map(Number),
      Number(status),
    );
  }

  @Get('list')
  @ApiOperation({ summary: '分页查询退货原因' })
  list(@Query() q: PageQueryDto) {
    return this.service.list(q);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取退货原因详情' })
  getItem(@Param('id', ParseIntPipe) id: number) {
    return this.service.getItem(id);
  }
}
