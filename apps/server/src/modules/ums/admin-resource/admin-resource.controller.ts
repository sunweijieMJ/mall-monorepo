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
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ApiWrappedResponse } from '@/common/decorators/api-wrapped-response.decorator';
import { AuthGuard } from '@nestjs/passport';
import { AdminResourceService } from './admin-resource.service';
import { QueryAdminResourceDto } from './dto/query-admin-resource.dto';
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

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '添加后台资源' })
  @ApiWrappedResponse(AdminResourceVo)
  create(@Body() dto: CreateAdminResourceDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: '分页模糊查询后台资源' })
  @ApiPaginatedResponse(AdminResourceVo)
  list(@Query() query: QueryAdminResourceDto) {
    return this.service.list(
      query.categoryId,
      query.nameKeyword || undefined,
      query.urlKeyword || undefined,
      query,
    );
  }

  @Get('all')
  @ApiOperation({ summary: '查询所有后台资源' })
  @ApiWrappedResponse(AdminResourceVo, { isArray: true })
  listAll() {
    return this.service.listAll();
  }

  @Put(':id')
  @ApiOperation({ summary: '修改后台资源' })
  @ApiParam({ name: 'id', description: '资源ID', type: 'integer' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAdminResourceDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '根据ID删除后台资源' })
  @ApiParam({ name: 'id', description: '资源ID', type: 'integer' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID获取资源详情' })
  @ApiParam({ name: 'id', description: '资源ID', type: 'integer' })
  @ApiWrappedResponse(AdminResourceVo)
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

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '添加后台资源分类' })
  @ApiWrappedResponse(AdminResourceCategoryVo)
  create(@Body() dto: CreateResourceCategoryDto) {
    return this.service.createCategory(dto);
  }

  @Get()
  @ApiOperation({ summary: '查询所有后台资源分类' })
  @ApiWrappedResponse(AdminResourceCategoryVo, { isArray: true })
  listAll() {
    return this.service.listCategory();
  }

  @Put(':id')
  @ApiOperation({ summary: '修改后台资源分类' })
  @ApiParam({ name: 'id', description: '资源分类ID', type: 'integer' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateResourceCategoryDto,
  ) {
    return this.service.updateCategory(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除后台资源分类' })
  @ApiParam({ name: 'id', description: '资源分类ID', type: 'integer' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.deleteCategory(id);
  }
}
