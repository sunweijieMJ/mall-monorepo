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
import { BatchUpdateStatusDto } from '@/common/dto/batch-update-status.dto';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ApiWrappedResponse } from '@/common/decorators/api-wrapped-response.decorator';
import { AuthGuard } from '@nestjs/passport';
import { ProductCategoryService } from './product-category.service';
import { PageQueryDto } from '@/common/dto/page-result.dto';
import {
  CreateProductCategoryDto,
  UpdateProductCategoryDto,
} from './dto/create-product-category.dto';
import { ApiPaginatedResponse } from '@/common/decorators/api-paginated-response.decorator';
import { ProductCategoryVo } from './vo/product-category.vo';
import { ProductCategoryWithChildrenVo } from './vo/product-category-with-children.vo';

@ApiTags('admin-product-category')
@ApiBearerAuth('admin-jwt')
@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'admin/pms/product-categories', version: '1' })
export class ProductCategoryController {
  constructor(private readonly service: ProductCategoryService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '创建分类' })
  @ApiWrappedResponse(ProductCategoryVo)
  create(@Body() dto: CreateProductCategoryDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: '按父级获取分类列表（分页）' })
  @ApiQuery({
    name: 'parentId',
    required: false,
    type: Number,
    description: '父分类ID，默认0',
  })
  @ApiPaginatedResponse(ProductCategoryVo)
  list(
    @Query('parentId', new ParseIntPipe({ optional: true })) parentId?: number,
    @Query() query?: PageQueryDto,
  ) {
    return this.service.getList(parentId ?? 0, query!);
  }

  @Get('tree')
  @ApiOperation({ summary: '获取所有分类（树形结构）' })
  @ApiWrappedResponse(ProductCategoryWithChildrenVo, { isArray: true })
  listWithChildren() {
    return this.service.listWithChildren();
  }

  @Put('batch-status/nav')
  @ApiOperation({ summary: '更新导航栏显示状态' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  updateNavStatus(@Body() dto: BatchUpdateStatusDto) {
    return this.service.updateNavStatus(dto.ids, dto.status);
  }

  @Put('batch-status/show')
  @ApiOperation({ summary: '更新显示状态' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  updateShowStatus(@Body() dto: BatchUpdateStatusDto) {
    return this.service.updateShowStatus(dto.ids, dto.status);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新分类' })
  @ApiParam({ name: 'id', description: '商品分类ID', type: 'integer' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductCategoryDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除分类' })
  @ApiParam({ name: 'id', description: '商品分类ID', type: 'integer' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取分类详情' })
  @ApiParam({ name: 'id', description: '商品分类ID', type: 'integer' })
  @ApiWrappedResponse(ProductCategoryVo)
  getItem(@Param('id', ParseIntPipe) id: number) {
    return this.service.getItem(id);
  }
}
