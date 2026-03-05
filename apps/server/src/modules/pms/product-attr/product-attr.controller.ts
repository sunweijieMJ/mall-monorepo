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
import { ProductAttrService } from './product-attr.service';

@ApiTags('管理端-PMS-属性分类')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'admin/pms/product-attr-categories', version: '1' })
export class ProductAttrCategoryController {
  constructor(private readonly service: ProductAttrService) {}

  @Get('list')
  @ApiOperation({
    summary: '分页获取属性分类',
    description: '对应前端 GET /productAttrCate/list',
  })
  list(@Query() query: any) {
    return this.service.listAttrCategory(query);
  }

  @Get('listWithAttr')
  @ApiOperation({
    summary: '获取所有属性分类（含属性）',
    description: '对应前端 GET /productAttrCate/listWithAttr',
  })
  listWithAttr(@Query() query: any) {
    return this.service.listAttrCategoryWithAttr(query);
  }

  @Post('create')
  create(@Body() dto: any) {
    return this.service.createAttrCategory(dto);
  }

  @Post('update/:id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: any) {
    return this.service.updateAttrCategory(id, dto);
  }

  @Delete('delete/:id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.deleteAttrCategory(id);
  }
}

@ApiTags('管理端-PMS-商品属性')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'admin/pms/product-attrs', version: '1' })
export class ProductAttrController {
  constructor(private readonly service: ProductAttrService) {}

  @Get('list/:categoryId')
  @ApiOperation({
    summary: '获取商品属性列表',
    description: '对应前端 GET /productAttr/list/:categoryId',
  })
  list(
    @Param('categoryId', ParseIntPipe) categoryId: number,
    @Query('type') type: string,
    @Query() query: any,
  ) {
    return this.service.listAttr(categoryId, Number(type ?? 0), query);
  }

  @Post('create')
  create(@Body() dto: any) {
    return this.service.createAttr(dto);
  }

  @Post('update/:id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: any) {
    return this.service.updateAttr(id, dto);
  }

  @Delete('delete')
  delete(@Query('ids') ids: string) {
    return this.service.deleteAttr(ids.split(',').map(Number));
  }
}
