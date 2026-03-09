import {
  Body,
  Controller,
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
import { BatchDeleteDto } from '@/common/dto/batch-delete.dto';
import {
  AllocMenuDto,
  AllocResourceDto,
  UpdateSingleStatusDto,
} from '@/common/dto/batch-update-status.dto';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ApiWrappedResponse } from '@/common/decorators/api-wrapped-response.decorator';
import { AuthGuard } from '@nestjs/passport';
import { AdminRoleService } from './admin-role.service';
import { PageQueryDto } from '@/common/dto/page-result.dto';
import { ApiPaginatedResponse } from '@/common/decorators/api-paginated-response.decorator';
import { CreateAdminRoleDto } from './dto/create-admin-role.dto';
import { UpdateAdminRoleDto } from './dto/update-admin-role.dto';
import { AdminRoleVo } from './vo/admin-role.vo';
import { AdminMenuVo } from '@/modules/ums/admin-menu/vo/admin-menu.vo';
import { AdminResourceVo } from '@/modules/ums/admin-resource/vo/admin-resource.vo';

@ApiTags('admin-role')
@ApiBearerAuth('admin-jwt')
@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'admin/ums/roles', version: '1' })
export class AdminRoleController {
  constructor(private readonly service: AdminRoleService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '添加角色' })
  @ApiWrappedResponse(AdminRoleVo)
  create(@Body() dto: CreateAdminRoleDto) {
    return this.service.create(dto);
  }

  @Post('batch-delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '批量删除角色' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  batchDelete(@Body() dto: BatchDeleteDto) {
    return this.service.delete(dto.ids);
  }

  @Get()
  @ApiOperation({ summary: '根据角色名称分页获取角色列表' })
  @ApiPaginatedResponse(AdminRoleVo)
  @ApiQuery({ name: 'keyword', required: false })
  list(@Query('keyword') keyword: string, @Query() q: PageQueryDto) {
    return this.service.list(keyword, q);
  }

  @Get('all')
  @ApiOperation({ summary: '获取所有角色' })
  @ApiWrappedResponse(AdminRoleVo, { isArray: true })
  listAll() {
    return this.service.listAll();
  }

  @Put(':id')
  @ApiOperation({ summary: '修改角色' })
  @ApiParam({ name: 'id', description: '角色ID', type: 'integer' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAdminRoleDto,
  ) {
    return this.service.update(id, dto);
  }

  @Put(':id/status')
  @ApiOperation({ summary: '修改角色状态' })
  @ApiParam({ name: 'id', description: '角色ID', type: 'integer' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSingleStatusDto,
  ) {
    return this.service.updateStatus(id, dto.status);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取角色详情' })
  @ApiParam({ name: 'id', description: '角色ID', type: 'integer' })
  @ApiWrappedResponse(AdminRoleVo)
  getItem(@Param('id', ParseIntPipe) id: number) {
    return this.service.getItem(id);
  }

  @Get(':id/menus')
  @ApiOperation({ summary: '获取角色相关菜单' })
  @ApiParam({ name: 'id', description: '角色ID', type: 'integer' })
  @ApiWrappedResponse(AdminMenuVo, { isArray: true })
  listMenu(@Param('id', ParseIntPipe) id: number) {
    return this.service.listMenu(id);
  }

  @Get(':id/resources')
  @ApiOperation({ summary: '获取角色相关资源' })
  @ApiParam({ name: 'id', description: '角色ID', type: 'integer' })
  @ApiWrappedResponse(AdminResourceVo, { isArray: true })
  listResource(@Param('id', ParseIntPipe) id: number) {
    return this.service.listResource(id);
  }

  @Put(':id/menus')
  @ApiOperation({ summary: '给角色分配菜单' })
  @ApiParam({ name: 'id', description: '角色ID', type: 'integer' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  allocMenu(@Param('id', ParseIntPipe) id: number, @Body() dto: AllocMenuDto) {
    return this.service.allocMenu(id, dto.menuIds);
  }

  @Put(':id/resources')
  @ApiOperation({ summary: '给角色分配资源' })
  @ApiParam({ name: 'id', description: '角色ID', type: 'integer' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  allocResource(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AllocResourceDto,
  ) {
    return this.service.allocResource(id, dto.resourceIds);
  }
}
