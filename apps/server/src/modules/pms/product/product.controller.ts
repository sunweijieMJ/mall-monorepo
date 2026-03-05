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

import { ProductService } from './product.service';
import { PageQueryDto } from '@/common/dto/page-result.dto';
import { CreateProductDto, UpdateProductDto } from './dto/product-param.dto';
import { CurrentUser } from '@/core/auth/decorators/current-user.decorator';
import { JwtPayload } from '@/core/auth/types/jwt-payload.type';

@ApiTags('管理端-PMS-商品管理')
@ApiBearerAuth()
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
  findList(
    @Query()
    query: PageQueryDto & {
      keyword?: string;
      productSn?: string;
      publishStatus?: number;
      verifyStatus?: number;
      brandId?: number;
      productCategoryId?: number;
    },
  ) {
    return this.productService.findList(query);
  }

  @Get('simpleList')
  @ApiOperation({
    summary: '简单商品列表（选择器用）',
    description: '只返回 id/name/pic，支持关键词搜索',
  })
  findSimpleList(@Query('keyword') keyword?: string) {
    return this.productService.findSimpleList(keyword);
  }

  @Get('updateInfo/:id')
  @ApiOperation({
    summary: '获取商品详情（含SKU、属性值等聚合信息）',
    description: '对应前端 GET /product/updateInfo/:id',
  })
  getUpdateInfo(@Param('id', ParseIntPipe) id: number) {
    return this.productService.getUpdateInfo(id);
  }

  @Post('create')
  @ApiOperation({
    summary: '创建商品（事务写入多张关联表）',
    description:
      '创建商品主表 + SKU + 属性值 + 阶梯价 + 满减价 + 会员价 + 专题/优选区域关联',
  })
  create(@Body() dto: CreateProductDto) {
    return this.productService.create(dto);
  }

  @Post('update/:id')
  @ApiOperation({
    summary: '更新商品（先删后插 + SKU 增量更新）',
    description: '更新商品主表，子表先删后插，SKU 做增量三路处理',
  })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductDto) {
    return this.productService.update(id, dto);
  }

  @Post('updateVerifyStatus')
  @ApiOperation({
    summary: '批量更新审核状态',
    description: '更新商品审核状态，同时写入审核记录',
  })
  updateVerifyStatus(
    @CurrentUser() user: JwtPayload,
    @Query('ids') ids: string,
    @Query('verifyStatus') verifyStatus: string,
    @Query('detail') detail: string,
  ) {
    return this.productService.updateVerifyStatus(
      ids.split(',').map(Number),
      Number(verifyStatus),
      detail,
      user.username,
    );
  }

  @Post('delete')
  @ApiOperation({
    summary: '批量删除商品（软删除）',
    description: '将 deleteStatus 设置为 1',
  })
  delete(@Query('ids') ids: string) {
    return this.productService.delete(ids.split(',').map(Number));
  }

  @Post('update/publishStatus')
  @ApiOperation({ summary: '批量更新上架状态' })
  updatePublishStatus(
    @Query('ids') ids: string,
    @Query('publishStatus') publishStatus: string,
  ) {
    return this.productService.updatePublishStatus(
      ids.split(',').map(Number),
      Number(publishStatus),
    );
  }

  @Post('update/newStatus')
  @ApiOperation({ summary: '批量更新新品状态' })
  updateNewStatus(
    @Query('ids') ids: string,
    @Query('newStatus') newStatus: string,
  ) {
    return this.productService.updateNewStatus(
      ids.split(',').map(Number),
      Number(newStatus),
    );
  }

  @Post('update/recommendStatus')
  @ApiOperation({ summary: '批量更新推荐状态' })
  updateRecommendStatus(
    @Query('ids') ids: string,
    @Query('recommendStatus') recommendStatus: string,
  ) {
    return this.productService.updateRecommendStatus(
      ids.split(',').map(Number),
      Number(recommendStatus),
    );
  }
}
