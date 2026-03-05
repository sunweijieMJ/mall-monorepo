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
import { ProductCategoryService } from './product-category.service';
import { PageQueryDto } from '@/common/dto/page-result.dto';

@ApiTags('管理端-PMS-商品分类')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('productCategory')
export class ProductCategoryController {
  constructor(private readonly service: ProductCategoryService) {}

  @Post('create')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '创建分类' })
  create(@Body() dto: any) {
    return this.service.create(dto);
  }

  @Post('update/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '更新分类' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: any) {
    return this.service.update(id, dto);
  }

  @Post('delete/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '删除分类' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }

  @Get('list/:parentId')
  @ApiOperation({ summary: '按父级获取分类列表（分页）' })
  getList(
    @Param('parentId', ParseIntPipe) parentId: number,
    @Query() query: PageQueryDto,
  ) {
    return this.service.getList(parentId, query);
  }

  @Get('withChildren')
  @ApiOperation({ summary: '获取所有分类（树形结构）' })
  listWithChildren() {
    return this.service.listWithChildren();
  }

  @Get(':id')
  @ApiOperation({ summary: '获取分类详情' })
  getItem(@Param('id', ParseIntPipe) id: number) {
    return this.service.getItem(id);
  }

  @Post('update/navStatus')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '更新导航栏显示状态' })
  updateNavStatus(
    @Query('ids') ids: string,
    @Query('navStatus', ParseIntPipe) navStatus: number,
  ) {
    return this.service.updateNavStatus(ids.split(',').map(Number), navStatus);
  }

  @Post('update/showStatus')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '更新显示状态' })
  updateShowStatus(
    @Query('ids') ids: string,
    @Query('showStatus', ParseIntPipe) showStatus: number,
  ) {
    return this.service.updateShowStatus(
      ids.split(',').map(Number),
      showStatus,
    );
  }
}
