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
import { ProductCategoryService } from './product-category.service';

@ApiTags('管理端-PMS-商品分类')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'admin/pms/product-categories', version: '1' })
export class ProductCategoryController {
  constructor(private readonly service: ProductCategoryService) {}

  @Get('list/:parentId')
  @ApiOperation({
    summary: '按父级获取分类列表',
    description: '对应前端 GET /productCate/list/:parentId',
  })
  getList(
    @Param('parentId', ParseIntPipe) parentId: number,
    @Query() query: any,
  ) {
    return this.service.getList(parentId, query);
  }

  @Get('listWithChildren')
  @ApiOperation({
    summary: '获取所有分类（树形结构）',
    description: '对应前端 GET /productCate/listWithChildren',
  })
  listWithChildren() {
    return this.service.listWithChildren();
  }

  @Post('create')
  @ApiOperation({ summary: '创建分类' })
  create(@Body() dto: any) {
    return this.service.create(dto);
  }

  @Post('update/:id')
  @ApiOperation({ summary: '更新分类' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: any) {
    return this.service.update(id, dto);
  }

  @Delete('delete/:id')
  @ApiOperation({ summary: '删除分类' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }

  @Post('update/navStatus')
  @ApiOperation({ summary: '更新导航栏显示状态' })
  updateNavStatus(
    @Query('ids') ids: string,
    @Query('navStatus') navStatus: string,
  ) {
    return this.service.updateNavStatus(
      ids.split(',').map(Number),
      Number(navStatus),
    );
  }

  @Post('update/showStatus')
  @ApiOperation({ summary: '更新显示状态' })
  updateShowStatus(
    @Query('ids') ids: string,
    @Query('showStatus') showStatus: string,
  ) {
    return this.service.updateShowStatus(
      ids.split(',').map(Number),
      Number(showStatus),
    );
  }
}
