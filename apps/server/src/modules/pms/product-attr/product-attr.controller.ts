import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ProductAttrService } from './product-attr.service';
import { PageQueryDto } from '@/common/dto/page-result.dto';

@ApiTags('管理端-PMS-属性分类')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('productAttributeCategory')
export class ProductAttrCategoryController {
  constructor(private readonly service: ProductAttrService) {}

  @Post('create')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '创建属性分类' })
  create(@Body() dto: any) {
    return this.service.createAttrCategory(dto);
  }

  @Post('update/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '更新属性分类' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: any) {
    return this.service.updateAttrCategory(id, dto);
  }

  @Post('delete/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '删除属性分类' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.deleteAttrCategory(id);
  }

  @Get('list')
  @ApiOperation({ summary: '分页获取属性分类' })
  list(@Query() query: PageQueryDto) {
    return this.service.listAttrCategory(query);
  }

  @Get('listWithAttr')
  @ApiOperation({ summary: '获取所有属性分类（含属性）' })
  listWithAttr() {
    return this.service.listAttrCategoryWithAttr();
  }
}

@ApiTags('管理端-PMS-商品属性')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('productAttribute')
export class ProductAttrController {
  constructor(private readonly service: ProductAttrService) {}

  @Post('create')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '创建商品属性' })
  create(@Body() dto: any) {
    return this.service.createAttr(dto);
  }

  @Post('update/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '更新商品属性' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: any) {
    return this.service.updateAttr(id, dto);
  }

  @Post('delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '批量删除商品属性' })
  delete(@Query('ids') ids: string) {
    return this.service.deleteAttr(ids.split(',').map(Number));
  }

  @Get('list/:cid')
  @ApiOperation({ summary: '获取商品属性列表' })
  list(
    @Param('cid', ParseIntPipe) cid: number,
    @Query('type') type: string,
    @Query() query: PageQueryDto,
  ) {
    return this.service.listAttr(cid, Number(type ?? 0), query);
  }

  @Get('category/list')
  @ApiOperation({ summary: '获取属性分类含属性列表' })
  categoryList() {
    return this.service.listAttrCategoryWithAttr();
  }

  @Get(':id')
  @ApiOperation({ summary: '获取属性详情' })
  getItem(@Param('id', ParseIntPipe) id: number) {
    return this.service.getAttrItem(id);
  }
}
