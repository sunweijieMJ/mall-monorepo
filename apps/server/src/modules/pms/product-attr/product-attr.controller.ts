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
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ProductAttrService } from './product-attr.service';
import { PageQueryDto } from '@/common/dto/page-result.dto';
import { QueryProductAttrDto } from './dto/query-product-attr.dto';
import {
  CreateProductAttrCategoryDto,
  UpdateProductAttrCategoryDto,
  CreateProductAttrDto,
  UpdateProductAttrDto,
} from './dto/create-product-attr.dto';
import { ApiPaginatedResponse } from '@/common/decorators/api-paginated-response.decorator';
import { ApiWrappedResponse } from '@/common/decorators/api-wrapped-response.decorator';
import { AttrCategoryWithAttrVo } from './vo/attr-category-with-attr.vo';
import { ProductAttrVo } from './vo/product-attr.vo';
import { ProductAttrCategoryVo } from './vo/product-attr-category.vo';

@ApiTags('admin-product-attr-category')
@ApiBearerAuth('admin-jwt')
@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'admin/pms/product-attribute-categories', version: '1' })
export class ProductAttrCategoryController {
  constructor(private readonly service: ProductAttrService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '创建属性分类' })
  @ApiWrappedResponse(ProductAttrCategoryVo)
  create(@Body() dto: CreateProductAttrCategoryDto) {
    return this.service.createAttrCategory(dto);
  }

  @Get()
  @ApiOperation({ summary: '分页获取属性分类' })
  @ApiPaginatedResponse(ProductAttrCategoryVo)
  list(@Query() query: PageQueryDto) {
    return this.service.listAttrCategory(query);
  }

  @Get('with-attrs')
  @ApiOperation({ summary: '获取所有属性分类（含属性）' })
  @ApiWrappedResponse(AttrCategoryWithAttrVo, { isArray: true })
  listWithAttr() {
    return this.service.listAttrCategoryWithAttr();
  }

  @Put(':id')
  @ApiOperation({ summary: '更新属性分类' })
  @ApiParam({ name: 'id', description: '属性分类ID', type: 'integer' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductAttrCategoryDto,
  ) {
    return this.service.updateAttrCategory(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除属性分类' })
  @ApiParam({ name: 'id', description: '属性分类ID', type: 'integer' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.deleteAttrCategory(id);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取属性分类详情' })
  @ApiParam({ name: 'id', description: '属性分类ID', type: 'integer' })
  @ApiWrappedResponse(ProductAttrCategoryVo)
  getItem(@Param('id', ParseIntPipe) id: number) {
    return this.service.getAttrCategoryItem(id);
  }
}

@ApiTags('admin-product-attr')
@ApiBearerAuth('admin-jwt')
@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'admin/pms/product-attributes', version: '1' })
export class ProductAttrController {
  constructor(private readonly service: ProductAttrService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '创建商品属性' })
  @ApiWrappedResponse(ProductAttrVo)
  create(@Body() dto: CreateProductAttrDto) {
    return this.service.createAttr(dto);
  }

  @Post('batch-delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '批量删除商品属性' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  batchDelete(@Body() dto: BatchDeleteDto) {
    return this.service.deleteAttr(dto.ids);
  }

  @Get()
  @ApiOperation({ summary: '获取商品属性列表' })
  @ApiPaginatedResponse(ProductAttrVo)
  list(@Query() query: QueryProductAttrDto) {
    return this.service.listAttr(query.categoryId, query.type ?? 0, query);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新商品属性' })
  @ApiParam({ name: 'id', description: '商品属性ID', type: 'integer' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductAttrDto,
  ) {
    return this.service.updateAttr(id, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取属性详情' })
  @ApiParam({ name: 'id', description: '商品属性ID', type: 'integer' })
  @ApiWrappedResponse(ProductAttrVo)
  getItem(@Param('id', ParseIntPipe) id: number) {
    return this.service.getAttrItem(id);
  }
}
