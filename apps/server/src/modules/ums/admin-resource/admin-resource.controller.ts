import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AdminResourceService } from './admin-resource.service';
import { PageQueryDto } from '@/common/dto/page-result.dto';
import { ApiPaginatedResponse } from '@/common/decorators/api-paginated-response.decorator';
import { CreateAdminResourceDto } from './dto/create-admin-resource.dto';
import { UpdateAdminResourceDto } from './dto/update-admin-resource.dto';
import { CreateResourceCategoryDto } from './dto/create-resource-category.dto';
import { UpdateResourceCategoryDto } from './dto/update-resource-category.dto';
import { AdminResourceVo } from './vo/admin-resource.vo';
import { AdminResourceCategoryVo } from './vo/admin-resource-category.vo';

@ApiTags('admin-resource')
@ApiBearerAuth('admin-jwt')
@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'admin/ums/resources', version: '1' })
export class AdminResourceController {
  constructor(private readonly service: AdminResourceService) {}

  @Post('create')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '添加后台资源' })
  @ApiOkResponse({ type: AdminResourceVo })
  create(@Body() dto: CreateAdminResourceDto) {
    return this.service.create(dto);
  }

  @Put('update/:id')
  @ApiOperation({ summary: '修改后台资源' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAdminResourceDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete('delete/:id')
  @ApiOperation({ summary: '根据ID删除后台资源' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }

  @Get('list')
  @ApiOperation({ summary: '分页模糊查询后台资源' })
  @ApiPaginatedResponse(AdminResourceVo)
  @ApiQuery({ name: 'categoryId', required: false, type: Number })
  @ApiQuery({ name: 'nameKeyword', required: false })
  @ApiQuery({ name: 'urlKeyword', required: false })
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

  @Get('all')
  @ApiOperation({ summary: '查询所有后台资源' })
  @ApiOkResponse({ type: [AdminResourceVo] })
  listAll() {
    return this.service.listAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID获取资源详情' })
  @ApiOkResponse({ type: AdminResourceVo })
  getItem(@Param('id', ParseIntPipe) id: number) {
    return this.service.getItem(id);
  }
}

@ApiTags('admin-resource-category')
@ApiBearerAuth('admin-jwt')
@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'admin/ums/resource-categories', version: '1' })
export class AdminResourceCategoryController {
  constructor(private readonly service: AdminResourceService) {}

  @Post('create')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '添加后台资源分类' })
  @ApiOkResponse({ type: AdminResourceCategoryVo })
  create(@Body() dto: CreateResourceCategoryDto) {
    return this.service.createCategory(dto);
  }

  @Put('update/:id')
  @ApiOperation({ summary: '修改后台资源分类' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateResourceCategoryDto,
  ) {
    return this.service.updateCategory(id, dto);
  }

  @Delete('delete/:id')
  @ApiOperation({ summary: '删除后台资源分类' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.deleteCategory(id);
  }

  @Get('all')
  @ApiOperation({ summary: '查询所有后台资源分类' })
  @ApiOkResponse({ type: [AdminResourceCategoryVo] })
  listAll() {
    return this.service.listCategory();
  }
}
