import {
  Body,
  Controller,
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
  ApiTags,
} from '@nestjs/swagger';
import { ApiWrappedResponse } from '@/common/decorators/api-wrapped-response.decorator';
import { AuthGuard } from '@nestjs/passport';
import { HomeContentService } from './home-content.service';
import {
  BatchUpdateStatusDto,
  UpdateSingleStatusDto,
  UpdateSortDto,
} from '@/common/dto/batch-update-status.dto';
import {
  QueryHomeAdDto,
  QueryHomeBrandDto,
  QueryHomeSubjectDto,
  QueryHomeNewProductDto,
  QueryHomeRecommendProductDto,
} from './dto/query-home-content.dto';
import {
  CreateHomeAdvertiseDto,
  UpdateHomeAdvertiseDto,
  CreateHomeBrandDto,
  CreateHomeSubjectDto,
  CreateHomeNewProductDto,
  CreateHomeRecommendProductDto,
} from './dto/home-content.dto';
import { BatchDeleteDto } from '@/common/dto/batch-delete.dto';
import { ApiPaginatedResponse } from '@/common/decorators/api-paginated-response.decorator';
import { HomeAdvertiseVo } from './vo/home-advertise.vo';
import { HomeBrandVo } from './vo/home-brand.vo';
import { HomeSubjectVo } from './vo/home-subject.vo';
import { HomeNewProductVo } from './vo/home-new-product.vo';
import { HomeRecommendProductVo } from './vo/home-recommend-product.vo';

@ApiTags('admin-home-ad')
@ApiBearerAuth('admin-jwt')
@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'admin/sms/home-ads', version: '1' })
export class HomeAdvertiseController {
  constructor(private readonly s: HomeContentService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '添加广告' })
  @ApiWrappedResponse(HomeAdvertiseVo)
  create(@Body() dto: CreateHomeAdvertiseDto) {
    return this.s.createAdvertise(dto);
  }

  @Post('batch-delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '批量删除广告' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  batchDelete(@Body() dto: BatchDeleteDto) {
    return this.s.deleteAdvertise(dto.ids);
  }

  @Get()
  @ApiOperation({ summary: '分页查询首页广告' })
  @ApiPaginatedResponse(HomeAdvertiseVo)
  list(@Query() query: QueryHomeAdDto) {
    return this.s.listAdvertise(query);
  }

  @Put(':id/status')
  @ApiOperation({ summary: '修改上下线状态' })
  @ApiParam({ name: 'id', description: '首页广告ID', type: 'integer' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSingleStatusDto,
  ) {
    return this.s.updateAdvertiseStatus(id, dto.status);
  }

  @Put(':id')
  @ApiOperation({ summary: '修改广告' })
  @ApiParam({ name: 'id', description: '首页广告ID', type: 'integer' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateHomeAdvertiseDto,
  ) {
    return this.s.updateAdvertise(id, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取广告详情' })
  @ApiParam({ name: 'id', description: '首页广告ID', type: 'integer' })
  @ApiWrappedResponse(HomeAdvertiseVo)
  getItem(@Param('id', ParseIntPipe) id: number) {
    return this.s.getAdvertiseItem(id);
  }
}

@ApiTags('admin-home-brand')
@ApiBearerAuth('admin-jwt')
@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'admin/sms/home-brands', version: '1' })
export class HomeBrandController {
  constructor(private readonly s: HomeContentService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '批量添加推荐品牌' })
  @ApiBody({ type: [CreateHomeBrandDto] })
  @ApiWrappedResponse(HomeBrandVo, { isArray: true })
  batchCreate(
    @Body(new ParseArrayPipe({ items: CreateHomeBrandDto }))
    dto: CreateHomeBrandDto[],
  ) {
    return this.s.createHomeBrand(dto);
  }

  @Post('batch-delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '批量删除推荐品牌' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  batchDelete(@Body() dto: BatchDeleteDto) {
    return this.s.deleteHomeBrand(dto.ids);
  }

  @Get()
  @ApiOperation({ summary: '分页查询推荐品牌' })
  @ApiPaginatedResponse(HomeBrandVo)
  list(@Query() query: QueryHomeBrandDto) {
    return this.s.listHomeBrand(query);
  }

  @Put('batch-status')
  @ApiOperation({ summary: '批量修改推荐状态' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  updateStatus(@Body() dto: BatchUpdateStatusDto) {
    return this.s.updateHomeBrandStatus(dto.ids, dto.status);
  }

  @Put(':id/sort')
  @ApiOperation({ summary: '修改排序' })
  @ApiParam({ name: 'id', description: '首页品牌推荐ID', type: 'integer' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  updateSort(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSortDto,
  ) {
    return this.s.updateHomeBrandSort(id, dto.sort);
  }
}

@ApiTags('admin-home-subject')
@ApiBearerAuth('admin-jwt')
@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'admin/sms/home-subjects', version: '1' })
export class HomeSubjectController {
  constructor(private readonly s: HomeContentService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '批量添加推荐专题' })
  @ApiBody({ type: [CreateHomeSubjectDto] })
  @ApiWrappedResponse(HomeSubjectVo, { isArray: true })
  batchCreate(
    @Body(new ParseArrayPipe({ items: CreateHomeSubjectDto }))
    dto: CreateHomeSubjectDto[],
  ) {
    return this.s.createSubject(dto);
  }

  @Post('batch-delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '批量删除推荐专题' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  batchDelete(@Body() dto: BatchDeleteDto) {
    return this.s.deleteSubject(dto.ids);
  }

  @Get()
  @ApiOperation({ summary: '分页查询推荐专题' })
  @ApiPaginatedResponse(HomeSubjectVo)
  list(@Query() query: QueryHomeSubjectDto) {
    return this.s.listSubject(query);
  }

  @Put('batch-status')
  @ApiOperation({ summary: '批量修改推荐状态' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  updateStatus(@Body() dto: BatchUpdateStatusDto) {
    return this.s.updateSubjectStatus(dto.ids, dto.status);
  }

  @Put(':id/sort')
  @ApiOperation({ summary: '修改排序' })
  @ApiParam({ name: 'id', description: '首页专题推荐ID', type: 'integer' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  updateSort(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSortDto,
  ) {
    return this.s.updateSubjectSort(id, dto.sort);
  }
}

@ApiTags('admin-home-new-product')
@ApiBearerAuth('admin-jwt')
@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'admin/sms/home-new-products', version: '1' })
export class HomeNewProductController {
  constructor(private readonly s: HomeContentService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '批量添加新品推荐' })
  @ApiBody({ type: [CreateHomeNewProductDto] })
  @ApiWrappedResponse(HomeNewProductVo, { isArray: true })
  batchCreate(
    @Body(new ParseArrayPipe({ items: CreateHomeNewProductDto }))
    dto: CreateHomeNewProductDto[],
  ) {
    return this.s.createNewProduct(dto);
  }

  @Post('batch-delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '批量删除新品推荐' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  batchDelete(@Body() dto: BatchDeleteDto) {
    return this.s.deleteNewProduct(dto.ids);
  }

  @Get()
  @ApiOperation({ summary: '分页查询新品推荐' })
  @ApiPaginatedResponse(HomeNewProductVo)
  list(@Query() query: QueryHomeNewProductDto) {
    return this.s.listNewProduct(query);
  }

  @Put('batch-status')
  @ApiOperation({ summary: '批量修改推荐状态' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  updateStatus(@Body() dto: BatchUpdateStatusDto) {
    return this.s.updateNewProductStatus(dto.ids, dto.status);
  }

  @Put(':id/sort')
  @ApiOperation({ summary: '修改排序' })
  @ApiParam({ name: 'id', description: '首页新品推荐ID', type: 'integer' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  updateSort(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSortDto,
  ) {
    return this.s.updateNewProductSort(id, dto.sort);
  }
}

@ApiTags('admin-home-recommend-product')
@ApiBearerAuth('admin-jwt')
@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'admin/sms/home-recommend-products', version: '1' })
export class HomeRecommendProductController {
  constructor(private readonly s: HomeContentService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '批量添加人气推荐' })
  @ApiBody({ type: [CreateHomeRecommendProductDto] })
  @ApiWrappedResponse(HomeRecommendProductVo, { isArray: true })
  batchCreate(
    @Body(new ParseArrayPipe({ items: CreateHomeRecommendProductDto }))
    dto: CreateHomeRecommendProductDto[],
  ) {
    return this.s.createHotProduct(dto);
  }

  @Post('batch-delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '批量删除人气推荐' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  batchDelete(@Body() dto: BatchDeleteDto) {
    return this.s.deleteHotProduct(dto.ids);
  }

  @Get()
  @ApiOperation({ summary: '分页查询人气推荐' })
  @ApiPaginatedResponse(HomeRecommendProductVo)
  list(@Query() query: QueryHomeRecommendProductDto) {
    return this.s.listHotProduct(query);
  }

  @Put('batch-status')
  @ApiOperation({ summary: '批量修改推荐状态' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  updateStatus(@Body() dto: BatchUpdateStatusDto) {
    return this.s.updateHotProductStatus(dto.ids, dto.status);
  }

  @Put(':id/sort')
  @ApiOperation({ summary: '修改排序' })
  @ApiParam({ name: 'id', description: '首页人气推荐ID', type: 'integer' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  updateSort(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSortDto,
  ) {
    return this.s.updateHotProductSort(id, dto.sort);
  }
}
