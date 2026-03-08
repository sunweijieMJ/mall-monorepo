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
  ApiTags,
} from '@nestjs/swagger';
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

  @Post('create')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '创建分类' })
  @ApiOkResponse({ type: ProductCategoryVo })
  create(@Body() dto: CreateProductCategoryDto) {
    return this.service.create(dto);
  }

  @Put('update/nav-status')
  @ApiOperation({ summary: '更新导航栏显示状态' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  updateNavStatus(@Body() dto: BatchUpdateStatusDto) {
    return this.service.updateNavStatus(dto.ids, dto.status);
  }

  @Put('update/show-status')
  @ApiOperation({ summary: '更新显示状态' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  updateShowStatus(@Body() dto: BatchUpdateStatusDto) {
    return this.service.updateShowStatus(dto.ids, dto.status);
  }

  @Put('update/:id')
  @ApiOperation({ summary: '更新分类' })
  @ApiParam({ name: 'id', description: '商品分类ID', type: 'integer' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductCategoryDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete('delete/:id')
  @ApiOperation({ summary: '删除分类' })
  @ApiParam({ name: 'id', description: '商品分类ID', type: 'integer' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }

  @Get('list/:parentId')
  @ApiOperation({ summary: '按父级获取分类列表（分页）' })
  @ApiParam({ name: 'parentId', description: '父分类ID', type: 'integer' })
  @ApiPaginatedResponse(ProductCategoryVo)
  list(
    @Param('parentId', ParseIntPipe) parentId: number,
    @Query() query: PageQueryDto,
  ) {
    return this.service.getList(parentId, query);
  }

  @Get('with-children')
  @ApiOperation({ summary: '获取所有分类（树形结构）' })
  @ApiOkResponse({ type: [ProductCategoryWithChildrenVo] })
  listWithChildren() {
    return this.service.listWithChildren();
  }

  @Get(':id')
  @ApiOperation({ summary: '获取分类详情' })
  @ApiParam({ name: 'id', description: '商品分类ID', type: 'integer' })
  @ApiOkResponse({ type: ProductCategoryVo })
  getItem(@Param('id', ParseIntPipe) id: number) {
    return this.service.getItem(id);
  }
}
