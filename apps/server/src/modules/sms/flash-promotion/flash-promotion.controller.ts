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
import { FlashPromotionService } from './flash-promotion.service';
import { PageQueryDto } from '@/common/dto/page-result.dto';

@ApiTags('管理端-SMS-秒杀活动')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'admin/sms/flash-promotions', version: '1' })
export class FlashPromotionController {
  constructor(private readonly service: FlashPromotionService) {}

  @Get('list') list(@Query() q: PageQueryDto) {
    return this.service.listFlash(q);
  }
  @Post('create') create(@Body() dto: any) {
    return this.service.createFlash(dto);
  }
  @Post('update/:id') update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: any,
  ) {
    return this.service.updateFlash(id, dto);
  }
  @Delete(':id') delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.deleteFlash(id);
  }
  @Post(':id/status') updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Query('status') status: string,
  ) {
    return this.service.updateFlashStatus(id, Number(status));
  }
}

@ApiTags('管理端-SMS-秒杀场次')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'admin/sms/flash-sessions', version: '1' })
export class FlashSessionController {
  constructor(private readonly service: FlashPromotionService) {}

  @Get('list') list(@Query('flashId') flashId: string) {
    return this.service.listSession(Number(flashId));
  }
  @Post('create') create(@Body() dto: any) {
    return this.service.createSession(dto);
  }
  @Post('update/:id') update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: any,
  ) {
    return this.service.updateSession(id, dto);
  }
  @Delete(':id') delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.deleteSession(id);
  }
  @Post(':id/status') updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Query('status') status: string,
  ) {
    return this.service.updateSessionStatus(id, Number(status));
  }
}

@ApiTags('管理端-SMS-秒杀商品关联')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'admin/sms/flash-product-relations', version: '1' })
export class FlashProductRelationController {
  constructor(private readonly service: FlashPromotionService) {}

  @Get('list') list(@Query() query: any) {
    return this.service.listRelation(query);
  }
  @Post('create') create(@Body() dto: any) {
    return this.service.createRelation(dto);
  }
  @Post('update/:id') update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: any,
  ) {
    return this.service.updateRelation(id, dto);
  }
  @Delete('delete') delete(@Query('ids') ids: string) {
    return this.service.deleteRelation(ids.split(',').map(Number));
  }
}
