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
  ApiTags,
} from '@nestjs/swagger';
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

  @Post('create')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '添加后台菜单' })
  @ApiOkResponse({ type: AdminMenuVo })
  create(@Body() dto: CreateAdminMenuDto) {
    return this.service.create(dto);
  }

  @Put('update/:id')
  @ApiOperation({ summary: '修改后台菜单' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAdminMenuDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete('delete/:id')
  @ApiOperation({ summary: '根据ID删除后台菜单' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }

  @Get('list/:parentId')
  @ApiOperation({ summary: '根据父菜单ID分页查询子菜单' })
  @ApiPaginatedResponse(AdminMenuVo)
  list(
    @Param('parentId', ParseIntPipe) parentId: number,
    @Query() q: PageQueryDto,
  ) {
    return this.service.list(parentId, q);
  }

  @Get('tree-list')
  @ApiOperation({ summary: '树形结构返回所有菜单列表' })
  @ApiOkResponse({ type: [AdminMenuTreeNodeVo] })
  treeList() {
    return this.service.treeList();
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID获取菜单详情' })
  @ApiOkResponse({ type: AdminMenuVo })
  getItem(@Param('id', ParseIntPipe) id: number) {
    return this.service.getItem(id);
  }

  @Put('update/hidden/:id')
  @ApiOperation({ summary: '修改菜单显示状态' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  updateHiddenStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateHiddenDto,
  ) {
    return this.service.updateHidden(id, dto.hidden);
  }
}
