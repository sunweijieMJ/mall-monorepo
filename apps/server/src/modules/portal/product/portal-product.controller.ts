import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { PortalProductService } from './portal-product.service';
import { Public } from '@/core/auth/decorators/public.decorator';
import { PageQueryDto } from '@/common/dto/page-result.dto';

@ApiTags('移动端-PMS-商品')
@ApiBearerAuth()
@Controller({ path: 'portal/products', version: '1' })
export class PortalProductController {
  constructor(private readonly portalProductService: PortalProductService) {}

  @Get('search')
  @Public()
  @ApiOperation({
    summary: '搜索商品列表',
    description:
      '支持关键词、品牌、分类过滤；sort: 1-新品(默认) 2-销量 3-价格升序 4-价格降序',
  })
  @ApiQuery({ name: 'keyword', required: false, description: '关键词' })
  @ApiQuery({ name: 'brandId', required: false, description: '品牌 ID' })
  @ApiQuery({
    name: 'productCategoryId',
    required: false,
    description: '分类 ID',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description: '排序方式：1-新品 2-销量 3-价格升序 4-价格降序',
  })
  search(
    @Query() query: PageQueryDto,
    @Query('keyword') keyword?: string,
    @Query('brandId') brandId?: string,
    @Query('productCategoryId') productCategoryId?: string,
    @Query('sort') sort?: string,
  ) {
    return this.portalProductService.search(
      query,
      keyword,
      brandId != null ? Number(brandId) : undefined,
      productCategoryId != null ? Number(productCategoryId) : undefined,
      sort != null ? Number(sort) : undefined,
    );
  }

  @Get('categoryTreeList')
  @Public()
  @ApiOperation({
    summary: '获取商品分类树',
    description: '返回两级分类树，无需登录',
  })
  categoryTreeList() {
    return this.portalProductService.categoryTreeList();
  }

  @Get(':id')
  @Public()
  @ApiOperation({
    summary: '获取商品详情',
    description:
      '聚合商品主体、品牌、SKU、属性、促销价格、可用优惠券等信息，无需登录',
  })
  detail(@Param('id', ParseIntPipe) id: number) {
    return this.portalProductService.detail(id);
  }
}
