import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ApiWrappedResponse } from '@/common/decorators/api-wrapped-response.decorator';
import { PortalProductService } from './portal-product.service';
import { Public } from '@/core/auth/decorators/public.decorator';
import { ProductVo } from '@/modules/pms/product/vo/product.vo';
import { ProductCategoryWithChildrenVo } from '@/modules/pms/product-category/vo/product-category-with-children.vo';
import { ApiPaginatedResponse } from '@/common/decorators/api-paginated-response.decorator';
import { PortalProductDetailVo } from './vo/portal-product-detail.vo';
import { PortalProductSearchDto } from './dto/portal-product-search.dto';

@ApiTags('portal-product')
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
  @ApiPaginatedResponse(ProductVo)
  search(@Query() query: PortalProductSearchDto) {
    return this.portalProductService.search(
      query,
      query.keyword,
      query.brandId,
      query.productCategoryId,
      query.sort,
    );
  }

  @Get('categories/tree')
  @Public()
  @ApiOperation({
    summary: '获取商品分类树',
    description: '返回两级分类树，无需登录',
  })
  @ApiWrappedResponse(ProductCategoryWithChildrenVo, { isArray: true })
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
  @ApiParam({ name: 'id', description: '商品ID', type: 'integer' })
  @ApiWrappedResponse(PortalProductDetailVo)
  getItem(@Param('id', ParseIntPipe) id: number) {
    return this.portalProductService.detail(id);
  }
}
