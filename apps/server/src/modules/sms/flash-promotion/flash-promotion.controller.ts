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
import { FlashPromotionService } from './flash-promotion.service';
import {
  CreateFlashPromotionDto,
  UpdateFlashPromotionDto,
  CreateFlashSessionDto,
  UpdateFlashSessionDto,
  CreateFlashProductRelationDto,
  UpdateFlashProductRelationDto,
} from './dto/create-flash-promotion.dto';

// ---- 秒杀活动 ----
@ApiTags('管理端-SMS-秒杀活动')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'flash', version: '1' })
export class FlashPromotionController {
  constructor(private readonly service: FlashPromotionService) {}

  @Post('create')
  @ApiOperation({ summary: '添加秒杀活动' })
  create(@Body() dto: CreateFlashPromotionDto) {
    return this.service.createFlash(dto);
  }

  @Post('update/:id')
  @ApiOperation({ summary: '编辑秒杀活动' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFlashPromotionDto,
  ) {
    return this.service.updateFlash(id, dto);
  }

  @Post('delete/:id')
  @ApiOperation({ summary: '删除秒杀活动' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.deleteFlash(id);
  }

  @Post('update/status/:id')
  @ApiOperation({ summary: '修改活动上下线状态' })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Query('status') status: string,
  ) {
    return this.service.updateFlashStatus(id, Number(status));
  }

  @Get('list')
  @ApiOperation({ summary: '根据活动名称分页查询' })
  list(
    @Query('keyword') keyword: string,
    @Query('pageSize') pageSize: string,
    @Query('pageNum') pageNum: string,
  ) {
    return this.service.listFlash(
      keyword,
      Number(pageNum) || 1,
      Number(pageSize) || 5,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: '获取活动详情' })
  getItem(@Param('id', ParseIntPipe) id: number) {
    return this.service.getFlashItem(id);
  }
}

// ---- 秒杀场次 ----
@ApiTags('管理端-SMS-秒杀场次')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'flashSession', version: '1' })
export class FlashSessionController {
  constructor(private readonly service: FlashPromotionService) {}

  @Post('create')
  @ApiOperation({ summary: '添加场次' })
  create(@Body() dto: CreateFlashSessionDto) {
    return this.service.createSession(dto);
  }

  @Post('update/:id')
  @ApiOperation({ summary: '修改场次' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFlashSessionDto,
  ) {
    return this.service.updateSession(id, dto);
  }

  @Post('update/status/:id')
  @ApiOperation({ summary: '修改场次启用状态' })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Query('status') status: string,
  ) {
    return this.service.updateSessionStatus(id, Number(status));
  }

  @Post('delete/:id')
  @ApiOperation({ summary: '删除场次' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.deleteSession(id);
  }

  @Get('selectList')
  @ApiOperation({ summary: '获取全部可选场次及其数量' })
  selectList(@Query('flashPromotionId') flashPromotionId: string) {
    return this.service.selectList(Number(flashPromotionId));
  }

  @Get('list')
  @ApiOperation({ summary: '获取全部场次' })
  list() {
    return this.service.listSession();
  }

  @Get(':id')
  @ApiOperation({ summary: '获取场次详情' })
  getItem(@Param('id', ParseIntPipe) id: number) {
    return this.service.getSessionItem(id);
  }
}

// ---- 秒杀商品关联 ----
@ApiTags('管理端-SMS-秒杀商品关联')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'flashProductRelation', version: '1' })
export class FlashProductRelationController {
  constructor(private readonly service: FlashPromotionService) {}

  @Post('create')
  @ApiOperation({ summary: '批量选择商品添加关联' })
  create(@Body() relationList: CreateFlashProductRelationDto[]) {
    const converted = relationList.map((item) => ({
      ...item,
      flashPromotionPrice:
        item.flashPromotionPrice != null
          ? String(item.flashPromotionPrice)
          : undefined,
    }));
    return this.service.createRelation(converted);
  }

  @Post('update/:id')
  @ApiOperation({ summary: '修改关联信息' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFlashProductRelationDto,
  ) {
    const { flashPromotionPrice, ...rest } = dto;
    const converted = {
      ...rest,
      ...(flashPromotionPrice != null
        ? { flashPromotionPrice: String(flashPromotionPrice) }
        : {}),
    };
    return this.service.updateRelation(id, converted);
  }

  @Post('delete/:id')
  @ApiOperation({ summary: '删除关联' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.deleteRelation(id);
  }

  @Get('list')
  @ApiOperation({ summary: '分页查询不同场次关联及商品信息' })
  list(
    @Query('flashPromotionId') flashPromotionId: string,
    @Query('flashPromotionSessionId') flashPromotionSessionId: string,
    @Query('pageSize') pageSize: string,
    @Query('pageNum') pageNum: string,
  ) {
    return this.service.listRelation(
      Number(flashPromotionId),
      Number(flashPromotionSessionId),
      Number(pageNum) || 1,
      Number(pageSize) || 5,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: '获取关联商品促销信息' })
  getItem(@Param('id', ParseIntPipe) id: number) {
    return this.service.getRelationItem(id);
  }
}
