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
import { AdminRoleService } from './admin-role.service';
import { PageQueryDto } from '@/common/dto/page-result.dto';
import { CreateAdminRoleDto } from './dto/create-admin-role.dto';
import { UpdateAdminRoleDto } from './dto/update-admin-role.dto';

@ApiTags('后台角色管理')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('role')
export class AdminRoleController {
  constructor(private readonly service: AdminRoleService) {}

  @Post('create')
  @ApiOperation({ summary: '添加角色' })
  create(@Body() dto: CreateAdminRoleDto) {
    return this.service.create(dto);
  }

  @Post('update/:id')
  @ApiOperation({ summary: '修改角色' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAdminRoleDto,
  ) {
    return this.service.update(id, dto);
  }

  @Post('delete')
  @ApiOperation({ summary: '批量删除角色' })
  delete(@Query('ids') ids: string) {
    return this.service.delete(ids.split(',').map(Number));
  }

  @Get('listAll')
  @ApiOperation({ summary: '获取所有角色' })
  listAll() {
    return this.service.listAll();
  }

  @Get('list')
  @ApiOperation({ summary: '根据角色名称分页获取角色列表' })
  list(@Query('keyword') keyword: string, @Query() q: PageQueryDto) {
    return this.service.list(keyword, q);
  }

  @Post('updateStatus/:id')
  @ApiOperation({ summary: '修改角色状态' })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Query('status') status: string,
  ) {
    return this.service.updateStatus(id, Number(status));
  }

  @Get('listMenu/:roleId')
  @ApiOperation({ summary: '获取角色相关菜单' })
  listMenu(@Param('roleId', ParseIntPipe) roleId: number) {
    return this.service.listMenu(roleId);
  }

  @Get('listResource/:roleId')
  @ApiOperation({ summary: '获取角色相关资源' })
  listResource(@Param('roleId', ParseIntPipe) roleId: number) {
    return this.service.listResource(roleId);
  }

  @Post('allocMenu')
  @ApiOperation({ summary: '给角色分配菜单' })
  allocMenu(
    @Query('roleId', ParseIntPipe) roleId: number,
    @Query('menuIds') menuIds: string,
  ) {
    const ids = menuIds ? menuIds.split(',').map(Number) : [];
    return this.service.allocMenu(roleId, ids);
  }

  @Post('allocResource')
  @ApiOperation({ summary: '给角色分配资源' })
  allocResource(
    @Query('roleId', ParseIntPipe) roleId: number,
    @Query('resourceIds') resourceIds: string,
  ) {
    const ids = resourceIds ? resourceIds.split(',').map(Number) : [];
    return this.service.allocResource(roleId, ids);
  }
}
