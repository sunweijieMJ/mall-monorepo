import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Put,
  Delete,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BatchDeleteDto } from '@/common/dto/batch-delete.dto';
import {
  BatchUpdateStatusDto,
  BatchUpdateVerifyStatusDto,
} from '@/common/dto/batch-update-status.dto';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

import { ProductService } from './product.service';
import { CreateProductDto, UpdateProductDto } from './dto/product-param.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { CurrentUser } from '@/core/auth/decorators/current-user.decorator';
import { JwtPayload } from '@/core/auth/types/jwt-payload.type';
import { ApiPaginatedResponse } from '@/common/decorators/api-paginated-response.decorator';
import { ProductVo } from './vo/product.vo';
import { ProductUpdateInfoVo } from './vo/product-update-info.vo';
import { ProductOptionVo } from './vo/product-option.vo';

@ApiTags('admin-product')
@ApiBearerAuth('admin-jwt')
@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'admin/pms/products', version: '1' })
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get('list')
  @ApiOperation({
    summary: '商品列表（分页）',
    description:
      '支持 keyword / publishStatus / verifyStatus / brandId / productCategoryId / productSn 过滤',
  })
  @ApiPaginatedResponse(ProductVo)
  list(@Query() query: ProductQueryDto) {
    return this.productService.findList(query);
  }

  @Get('options')
  @ApiOperation({
    summary: '简单商品列表（选择器用）',
    description: '只返回 id/name/pic，支持关键词搜索',
  })
  @ApiOkResponse({ type: [ProductOptionVo] })
  @ApiQuery({ name: 'keyword', required: false })
  listSimple(@Query('keyword') keyword?: string) {
    return this.productService.findSimpleList(keyword);
  }

  @Get(':id')
  @ApiOperation({
    summary: '获取商品详情（含SKU、属性值等聚合信息）',
    description: '获取商品完整信息，包括 SKU、属性值、阶梯价、满减等',
  })
  @ApiOkResponse({ type: ProductUpdateInfoVo })
  getUpdateInfo(@Param('id', ParseIntPipe) id: number) {
    return this.productService.getUpdateInfo(id);
  }

  @Post('create')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '创建商品（事务写入多张关联表）',
    description:
      '创建商品主表 + SKU + 属性值 + 阶梯价 + 满减价 + 会员价 + 专题/优选区域关联',
  })
  @ApiOkResponse({ type: ProductVo })
  create(@Body() dto: CreateProductDto) {
    return this.productService.create(dto);
  }

  @Put('update/verify-status')
  @ApiOperation({
    summary: '批量更新审核状态',
    description: '更新商品审核状态，同时写入审核记录',
  })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  updateVerifyStatus(
    @CurrentUser() user: JwtPayload,
    @Body() dto: BatchUpdateVerifyStatusDto,
  ) {
    return this.productService.updateVerifyStatus(
      dto.ids,
      dto.verifyStatus,
      dto.detail ?? '',
      user.username,
    );
  }

  @Put('update/publish-status')
  @ApiOperation({ summary: '批量更新上架状态' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  updatePublishStatus(@Body() dto: BatchUpdateStatusDto) {
    return this.productService.updatePublishStatus(dto.ids, dto.status);
  }

  @Put('update/new-status')
  @ApiOperation({ summary: '批量更新新品状态' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  updateNewStatus(@Body() dto: BatchUpdateStatusDto) {
    return this.productService.updateNewStatus(dto.ids, dto.status);
  }

  @Put('update/recommend-status')
  @ApiOperation({ summary: '批量更新推荐状态' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  updateRecommendStatus(@Body() dto: BatchUpdateStatusDto) {
    return this.productService.updateRecommendStatus(dto.ids, dto.status);
  }

  @Put('update/:id')
  @ApiOperation({
    summary: '更新商品（先删后插 + SKU 增量更新）',
    description: '更新商品主表，子表先删后插，SKU 做增量三路处理',
  })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductDto) {
    return this.productService.update(id, dto);
  }

  @Delete('delete')
  @ApiOperation({
    summary: '批量删除商品（软删除）',
    description: '将 deleteStatus 设置为 1',
  })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  batchDelete(@Body() dto: BatchDeleteDto) {
    return this.productService.delete(dto.ids);
  }
}
