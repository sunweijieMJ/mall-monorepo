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
import { BatchUpdateStatusDto } from '@/common/dto/batch-update-status.dto';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ApiWrappedResponse } from '@/common/decorators/api-wrapped-response.decorator';
import { AuthGuard } from '@nestjs/passport';
import { BrandService } from './brand.service';
import { CreateBrandDto, UpdateBrandDto } from './dto/create-brand.dto';
import { QueryBrandDto } from './dto/query-brand.dto';
import { PageQueryDto } from '@/common/dto/page-result.dto';
import { Public } from '@/core/auth/decorators/public.decorator';
import { ApiPaginatedResponse } from '@/common/decorators/api-paginated-response.decorator';
import { BrandVo } from './vo/brand.vo';
import { ProductVo } from '@/modules/pms/product/vo/product.vo';

@ApiTags('admin-brand')
@ApiBearerAuth('admin-jwt')
@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'admin/pms/brands', version: '1' })
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Post('create')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '创建品牌' })
  @ApiWrappedResponse(BrandVo)
  create(@Body() dto: CreateBrandDto) {
    return this.brandService.create(dto);
  }

  @Put('update/show-status')
  @ApiOperation({ summary: '更新显示状态' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  updateShowStatus(@Body() dto: BatchUpdateStatusDto) {
    return this.brandService.updateShowStatus(dto.ids, dto.status);
  }

  @Put('update/factory-status')
  @ApiOperation({ summary: '更新厂家制造商状态' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  updateFactoryStatus(@Body() dto: BatchUpdateStatusDto) {
    return this.brandService.updateFactoryStatus(dto.ids, dto.status);
  }

  @Put('update/:id')
  @ApiOperation({ summary: '更新品牌' })
  @ApiParam({ name: 'id', description: '品牌ID', type: 'integer' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBrandDto) {
    return this.brandService.update(id, dto);
  }

  @Delete('delete')
  @ApiOperation({ summary: '批量删除品牌' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  batchDelete(@Body() dto: BatchDeleteDto) {
    return this.brandService.remove(dto.ids);
  }

  @Get('list')
  @ApiOperation({ summary: '品牌列表（分页）' })
  @ApiPaginatedResponse(BrandVo)
  list(@Query() query: QueryBrandDto) {
    return this.brandService.findList(query);
  }

  @Get('all')
  @ApiOperation({ summary: '获取所有品牌（不分页）' })
  @ApiWrappedResponse(BrandVo, { isArray: true })
  listAll() {
    return this.brandService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '获取品牌详情' })
  @ApiParam({ name: 'id', description: '品牌ID', type: 'integer' })
  @ApiWrappedResponse(BrandVo)
  getItem(@Param('id', ParseIntPipe) id: number) {
    return this.brandService.getItem(id);
  }
}

/** 移动端品牌 Controller（无需登录） */
@ApiTags('portal-brand')
@Controller({ path: 'portal/brands', version: '1' })
export class PortalBrandController {
  constructor(private readonly brandService: BrandService) {}

  @Public()
  @Get('recommend-list')
  @ApiOperation({ summary: '推荐品牌列表（分页）' })
  @ApiPaginatedResponse(BrandVo)
  recommendList(@Query() query: PageQueryDto) {
    return this.brandService.recommendList(query.page, query.limit);
  }

  @Public()
  @Get(':brandId/products')
  @ApiOperation({ summary: '品牌下的商品列表（分页）' })
  @ApiParam({ name: 'brandId', description: '品牌ID', type: 'integer' })
  @ApiPaginatedResponse(ProductVo)
  productList(
    @Param('brandId', ParseIntPipe) brandId: number,
    @Query() query: PageQueryDto,
  ) {
    return this.brandService.getProductList(brandId, query);
  }

  @Public()
  @Get(':brandId')
  @ApiOperation({ summary: '品牌详情' })
  @ApiParam({ name: 'brandId', description: '品牌ID', type: 'integer' })
  @ApiWrappedResponse(BrandVo)
  getItem(@Param('brandId', ParseIntPipe) brandId: number) {
    return this.brandService.getItem(brandId);
  }
}
