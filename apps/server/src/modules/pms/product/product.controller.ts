import {
  Body,
  Controller,
  Delete,
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

@ApiTags('管理端-PMS-商品管理')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'admin/pms/products', version: '1' })
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get('list')
  @ApiOperation({
    summary: '商品列表（分页）',
    description: '对应前端 GET /product/list',
  })
  findList(@Query() query: PageQueryDto) {
    return this.productService.findList(query);
  }

  @Get('simpleList')
  @ApiOperation({
    summary: '简单商品列表（选择器用）',
    description: '对应前端 GET /product/simpleList',
  })
  findSimpleList(@Query('keyword') keyword?: string) {
    return this.productService.findSimpleList(keyword);
  }

  @Get('updateInfo/:id')
  @ApiOperation({
    summary: '获取商品详情（含SKU）',
    description: '对应前端 GET /product/updateInfo/:id',
  })
  getUpdateInfo(@Param('id', ParseIntPipe) id: number) {
    return this.productService.getUpdateInfo(id);
  }

  @Post('create')
  @ApiOperation({
    summary: '创建商品',
    description: '对应前端 POST /product/create',
  })
  create(@Body() dto: any) {
    return this.productService.create(dto);
  }

  @Post('update/:id')
  @ApiOperation({
    summary: '更新商品',
    description: '对应前端 POST /product/update/:id',
  })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: any) {
    return this.productService.update(id, dto);
  }

  @Post('delete')
  @ApiOperation({
    summary: '批量删除商品',
    description: '对应前端 POST /product/delete?ids=1,2',
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
