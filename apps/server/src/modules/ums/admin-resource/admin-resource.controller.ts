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
import { AdminResourceService } from './admin-resource.service';
import { PageQueryDto } from '@/common/dto/page-result.dto';
import { CreateAdminResourceDto } from './dto/create-admin-resource.dto';
import { UpdateAdminResourceDto } from './dto/update-admin-resource.dto';
import { CreateResourceCategoryDto } from './dto/create-resource-category.dto';
import { UpdateResourceCategoryDto } from './dto/update-resource-category.dto';

@ApiTags('后台资源管理')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('resource')
export class AdminResourceController {
  constructor(private readonly service: AdminResourceService) {}

  @Post('create')
  @ApiOperation({ summary: '添加后台资源' })
  create(@Body() dto: CreateAdminResourceDto) {
    return this.service.create(dto);
  }

  @Post('update/:id')
  @ApiOperation({ summary: '修改后台资源' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAdminResourceDto,
  ) {
    return this.service.update(id, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID获取资源详情' })
  getItem(@Param('id', ParseIntPipe) id: number) {
    return this.service.getItem(id);
  }

  @Post('delete/:id')
  @ApiOperation({ summary: '根据ID删除后台资源' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }

  @Get('list')
  @ApiOperation({ summary: '分页模糊查询后台资源' })
  list(
    @Query('categoryId') categoryId: string,
    @Query('nameKeyword') nameKeyword: string,
    @Query('urlKeyword') urlKeyword: string,
    @Query() q: PageQueryDto,
  ) {
    return this.service.list(
      categoryId ? Number(categoryId) : undefined,
      nameKeyword || undefined,
      urlKeyword || undefined,
      q,
    );
  }

  @Get('listAll')
  @ApiOperation({ summary: '查询所有后台资源' })
  listAll() {
    return this.service.listAll();
  }
}

@ApiTags('后台资源分类管理')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('resourceCategory')
export class AdminResourceCategoryController {
  constructor(private readonly service: AdminResourceService) {}

  @Post('create')
  @ApiOperation({ summary: '添加后台资源分类' })
  create(@Body() dto: CreateResourceCategoryDto) {
    return this.service.createCategory(dto);
  }

  @Post('update/:id')
  @ApiOperation({ summary: '修改后台资源分类' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateResourceCategoryDto,
  ) {
    return this.service.updateCategory(id, dto);
  }

  @Post('delete/:id')
  @ApiOperation({ summary: '删除后台资源分类' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.deleteCategory(id);
  }

  @Get('listAll')
  @ApiOperation({ summary: '查询所有后台资源分类' })
  listAll() {
    return this.service.listCategory();
  }
}
