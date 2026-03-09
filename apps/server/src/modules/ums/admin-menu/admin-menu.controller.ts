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
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ApiWrappedResponse } from '@/common/decorators/api-wrapped-response.decorator';
import { AuthGuard } from '@nestjs/passport';
import { AdminMenuService } from './admin-menu.service';
import { UpdateHiddenDto } from '@/common/dto/batch-update-status.dto';
import { PageQueryDto } from '@/common/dto/page-result.dto';
import { ApiPaginatedResponse } from '@/common/decorators/api-paginated-response.decorator';
import { CreateAdminMenuDto } from './dto/create-admin-menu.dto';
import { UpdateAdminMenuDto } from './dto/update-admin-menu.dto';
import { AdminMenuVo } from './vo/admin-menu.vo';
import { AdminMenuTreeNodeVo } from './vo/admin-menu-tree-node.vo';

@ApiTags('admin-menu')
@ApiBearerAuth('admin-jwt')
@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'admin/ums/menus', version: '1' })
export class AdminMenuController {
  constructor(private readonly service: AdminMenuService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '添加后台菜单' })
  @ApiWrappedResponse(AdminMenuVo)
  create(@Body() dto: CreateAdminMenuDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: '根据父菜单ID分页查询子菜单' })
  @ApiQuery({
    name: 'parentId',
    required: false,
    type: Number,
    description: '父菜单ID，默认 0',
  })
  @ApiPaginatedResponse(AdminMenuVo)
  list(
    @Query('parentId', new ParseIntPipe({ optional: true }))
    parentId: number = 0,
    @Query() q: PageQueryDto,
  ) {
    return this.service.list(parentId, q);
  }

  @Get('tree')
  @ApiOperation({ summary: '树形结构返回所有菜单列表' })
  @ApiWrappedResponse(AdminMenuTreeNodeVo, { isArray: true })
  treeList() {
    return this.service.treeList();
  }

  @Put(':id')
  @ApiOperation({ summary: '修改后台菜单' })
  @ApiParam({ name: 'id', description: '菜单ID', type: 'integer' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAdminMenuDto,
  ) {
    return this.service.update(id, dto);
  }

  @Put(':id/hidden')
  @ApiOperation({ summary: '修改菜单显示状态' })
  @ApiParam({ name: 'id', description: '菜单ID', type: 'integer' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  updateHiddenStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateHiddenDto,
  ) {
    return this.service.updateHidden(id, dto.hidden);
  }

  @Delete(':id')
  @ApiOperation({ summary: '根据ID删除后台菜单' })
  @ApiParam({ name: 'id', description: '菜单ID', type: 'integer' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID获取菜单详情' })
  @ApiParam({ name: 'id', description: '菜单ID', type: 'integer' })
  @ApiWrappedResponse(AdminMenuVo)
  getItem(@Param('id', ParseIntPipe) id: number) {
    return this.service.getItem(id);
  }
}
