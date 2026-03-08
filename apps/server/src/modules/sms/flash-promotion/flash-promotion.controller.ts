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
  ParseArrayPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { FlashPromotionService } from './flash-promotion.service';
import { UpdateSingleStatusDto } from '@/common/dto/batch-update-status.dto';
import { PageQueryDto } from '@/common/dto/page-result.dto';
import {
  CreateFlashPromotionDto,
  UpdateFlashPromotionDto,
  CreateFlashSessionDto,
  UpdateFlashSessionDto,
  CreateFlashProductRelationDto,
  UpdateFlashProductRelationDto,
} from './dto/create-flash-promotion.dto';
import { ApiPaginatedResponse } from '@/common/decorators/api-paginated-response.decorator';
import { FlashPromotionVo } from './vo/flash-promotion.vo';
import { FlashSessionVo } from './vo/flash-session.vo';
import { FlashProductRelationVo } from './vo/flash-product-relation.vo';
import { FlashSessionWithCountVo } from './vo/flash-session-with-count.vo';

// ---- 秒杀活动 ----
@ApiTags('admin-flash-promotion')
@ApiBearerAuth('admin-jwt')
@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'admin/sms/flash-promotions', version: '1' })
export class FlashPromotionController {
  constructor(private readonly service: FlashPromotionService) {}

  @Post('create')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '添加秒杀活动' })
  @ApiOkResponse({ type: FlashPromotionVo })
  create(@Body() dto: CreateFlashPromotionDto) {
    return this.service.createFlash(dto);
  }

  @Put('update/:id')
  @ApiOperation({ summary: '编辑秒杀活动' })
  @ApiParam({ name: 'id', description: '秒杀活动ID', type: 'integer' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFlashPromotionDto,
  ) {
    return this.service.updateFlash(id, dto);
  }

  @Delete('delete/:id')
  @ApiOperation({ summary: '删除秒杀活动' })
  @ApiParam({ name: 'id', description: '秒杀活动ID', type: 'integer' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.deleteFlash(id);
  }

  @Put('update/status/:id')
  @ApiOperation({ summary: '修改活动上下线状态' })
  @ApiParam({ name: 'id', description: '秒杀活动ID', type: 'integer' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSingleStatusDto,
  ) {
    return this.service.updateFlashStatus(id, dto.status);
  }

  @Get('list')
  @ApiOperation({ summary: '根据活动名称分页查询' })
  @ApiPaginatedResponse(FlashPromotionVo)
  @ApiQuery({ name: 'keyword', required: false })
  list(@Query() q: PageQueryDto, @Query('keyword') keyword?: string) {
    return this.service.listFlash(keyword, q.page, q.limit);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取活动详情' })
  @ApiParam({ name: 'id', description: '秒杀活动ID', type: 'integer' })
  @ApiOkResponse({ type: FlashPromotionVo })
  getItem(@Param('id', ParseIntPipe) id: number) {
    return this.service.getFlashItem(id);
  }
}

// ---- 秒杀场次 ----
@ApiTags('admin-flash-session')
@ApiBearerAuth('admin-jwt')
@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'admin/sms/flash-sessions', version: '1' })
export class FlashSessionController {
  constructor(private readonly service: FlashPromotionService) {}

  @Post('create')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '添加场次' })
  @ApiOkResponse({ type: FlashSessionVo })
  create(@Body() dto: CreateFlashSessionDto) {
    return this.service.createSession(dto);
  }

  @Put('update/:id')
  @ApiOperation({ summary: '修改场次' })
  @ApiParam({ name: 'id', description: '秒杀场次ID', type: 'integer' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFlashSessionDto,
  ) {
    return this.service.updateSession(id, dto);
  }

  @Put('update/status/:id')
  @ApiOperation({ summary: '修改场次启用状态' })
  @ApiParam({ name: 'id', description: '秒杀场次ID', type: 'integer' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSingleStatusDto,
  ) {
    return this.service.updateSessionStatus(id, dto.status);
  }

  @Delete('delete/:id')
  @ApiOperation({ summary: '删除场次' })
  @ApiParam({ name: 'id', description: '秒杀场次ID', type: 'integer' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.deleteSession(id);
  }

  @Get('options')
  @ApiOperation({ summary: '获取全部可选场次及其数量' })
  @ApiOkResponse({ type: [FlashSessionWithCountVo] })
  listSelectable(
    @Query('flashPromotionId', ParseIntPipe) flashPromotionId: number,
  ) {
    return this.service.selectList(flashPromotionId);
  }

  @Get('list')
  @ApiOperation({ summary: '获取全部场次' })
  @ApiOkResponse({ type: [FlashSessionVo] })
  list() {
    return this.service.listSession();
  }

  @Get(':id')
  @ApiOperation({ summary: '获取场次详情' })
  @ApiParam({ name: 'id', description: '秒杀场次ID', type: 'integer' })
  @ApiOkResponse({ type: FlashSessionVo })
  getItem(@Param('id', ParseIntPipe) id: number) {
    return this.service.getSessionItem(id);
  }
}

// ---- 秒杀商品关联 ----
@ApiTags('admin-flash-product-relation')
@ApiBearerAuth('admin-jwt')
@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'admin/sms/flash-product-relations', version: '1' })
export class FlashProductRelationController {
  constructor(private readonly service: FlashPromotionService) {}

  @Post('create')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '批量选择商品添加关联' })
  @ApiBody({ type: [CreateFlashProductRelationDto] })
  @ApiOkResponse({ type: [FlashProductRelationVo] })
  batchCreate(
    @Body(new ParseArrayPipe({ items: CreateFlashProductRelationDto }))
    relationList: CreateFlashProductRelationDto[],
  ) {
    const converted = relationList.map((item) => ({
      ...item,
      flashPromotionPrice:
        item.flashPromotionPrice != null
          ? String(item.flashPromotionPrice)
          : undefined,
    }));
    return this.service.createRelation(converted);
  }

  @Put('update/:id')
  @ApiOperation({ summary: '修改关联信息' })
  @ApiParam({ name: 'id', description: '秒杀商品关联ID', type: 'integer' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
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

  @Delete('delete/:id')
  @ApiOperation({ summary: '删除关联' })
  @ApiParam({ name: 'id', description: '秒杀商品关联ID', type: 'integer' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.deleteRelation(id);
  }

  @Get('list')
  @ApiOperation({ summary: '分页查询不同场次关联及商品信息' })
  @ApiPaginatedResponse(FlashProductRelationVo)
  list(
    @Query('flashPromotionId', ParseIntPipe) flashPromotionId: number,
    @Query('flashPromotionSessionId', ParseIntPipe)
    flashPromotionSessionId: number,
    @Query() q: PageQueryDto,
  ) {
    return this.service.listRelation(
      flashPromotionId,
      flashPromotionSessionId,
      q.page,
      q.limit,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: '获取关联商品促销信息' })
  @ApiParam({ name: 'id', description: '秒杀商品关联ID', type: 'integer' })
  @ApiOkResponse({ type: FlashProductRelationVo })
  getItem(@Param('id', ParseIntPipe) id: number) {
    return this.service.getRelationItem(id);
  }
}
