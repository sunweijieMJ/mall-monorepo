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
import { ReturnReasonService } from './return-reason.service';
import { PageQueryDto } from '@/common/dto/page-result.dto';

@ApiTags('管理端-OMS-退货原因')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'admin/oms/return-reasons', version: '1' })
export class ReturnReasonController {
  constructor(private readonly service: ReturnReasonService) {}

  @Get('list') list(@Query() q: PageQueryDto) {
    return this.service.list(q);
  }
  @Post('create') create(@Body() dto: any) {
    return this.service.create(dto);
  }
  @Post('update/:id') update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: any,
  ) {
    return this.service.update(id, dto);
  }
  @Delete('delete') delete(@Query('ids') ids: string) {
    return this.service.delete(ids.split(',').map(Number));
  }
  @Post('update/status') updateStatus(
    @Query('ids') ids: string,
    @Query('status') status: string,
  ) {
    return this.service.updateStatus(
      ids.split(',').map(Number),
      Number(status),
    );
  }
}
