import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseArrayPipe,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { BrandService } from './brand.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { QueryBrandDto } from './dto/query-brand.dto';
import { PageQueryDto } from '@/common/dto/page-result.dto';
import { Public } from '@/core/auth/decorators/public.decorator';

@ApiTags('管理端-PMS-品牌管理')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('brand')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Post('create')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '创建品牌' })
  create(@Body() dto: CreateBrandDto) {
    return this.brandService.create(dto);
  }

  @Post('update/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '更新品牌' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateBrandDto) {
    return this.brandService.update(id, dto);
  }

  @Post('delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '批量删除品牌' })
  remove(
    @Query('ids', new ParseArrayPipe({ items: Number, separator: ',' }))
    ids: number[],
  ) {
    return this.brandService.remove(ids);
  }

  @Get('list')
  @ApiOperation({ summary: '品牌列表（分页）' })
  findList(@Query() query: QueryBrandDto) {
    return this.brandService.findList(query);
  }

  @Get('listAll')
  @ApiOperation({ summary: '获取所有品牌（不分页）' })
  findAll() {
    return this.brandService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '获取品牌详情' })
  getItem(@Param('id', ParseIntPipe) id: number) {
    return this.brandService.getItem(id);
  }

  @Post('update/showStatus')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '更新显示状态' })
  updateShowStatus(
    @Query('ids', new ParseArrayPipe({ items: Number, separator: ',' }))
    ids: number[],
    @Query('showStatus', ParseIntPipe) showStatus: number,
  ) {
    return this.brandService.updateShowStatus(ids, showStatus);
  }

  @Post('update/factoryStatus')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '更新厂家制造商状态' })
  updateFactoryStatus(
    @Query('ids', new ParseArrayPipe({ items: Number, separator: ',' }))
    ids: number[],
    @Query('factoryStatus', ParseIntPipe) factoryStatus: number,
  ) {
    return this.brandService.updateFactoryStatus(ids, factoryStatus);
  }
}

/** 移动端品牌 Controller（无需登录） */
@ApiTags('移动端-PMS-品牌')
@Controller({ path: 'portal/brands', version: '1' })
export class PortalBrandController {
  constructor(private readonly brandService: BrandService) {}

  @Public()
  @Get('recommendList')
  @ApiOperation({ summary: '推荐品牌列表（分页）' })
  recommendList(@Query() query: PageQueryDto) {
    return this.brandService.recommendList(query.page, query.limit);
  }

  @Public()
  @Get(':brandId/products')
  @ApiOperation({ summary: '品牌下的商品列表（分页）' })
  productList(
    @Param('brandId', ParseIntPipe) brandId: number,
    @Query() query: PageQueryDto,
  ) {
    return this.brandService.getProductList(brandId, query);
  }

  @Public()
  @Get(':brandId')
  @ApiOperation({ summary: '品牌详情' })
  detail(@Param('brandId', ParseIntPipe) brandId: number) {
    return this.brandService.getItem(brandId);
  }
}
