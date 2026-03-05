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
import { AdminRoleService } from './admin-role.service';
import { PageQueryDto } from '@/common/dto/page-result.dto';

@ApiTags('管理端-UMS-角色管理')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'admin/ums/roles', version: '1' })
export class AdminRoleController {
  constructor(private readonly service: AdminRoleService) {}

  @Get('list') list(@Query() q: PageQueryDto) {
    return this.service.list(q);
  }
  @Get('listAll') listAll() {
    return this.service.listAll();
  }
  @Post('create') create(@Body() dto: any) {
    return this.service.create(dto);
  }
  @Post('update/:id') update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: any,
  ) {
    return this.service.update(id, dto);
  }
  @Delete('delete') delete(@Query('ids') ids: string) {
    return this.service.delete(ids.split(',').map(Number));
  }

  @Get(':roleId/menu') listMenus(
    @Param('roleId', ParseIntPipe) roleId: number,
  ) {
    return this.service.listMenus(roleId);
  }
  @Post(':roleId/menu/allocMenu')
  @ApiOperation({
    summary: '分配菜单',
    description: '对应前端 POST /role/allocMenu?roleId=&menuIds=',
  })
  allocMenus(
    @Param('roleId', ParseIntPipe) roleId: number,
    @Body('menuIds') menuIds: number[],
  ) {
    return this.service.allocMenus(roleId, menuIds);
  }

  @Get(':roleId/resource') listResources(
    @Param('roleId', ParseIntPipe) roleId: number,
  ) {
    return this.service.listResources(roleId);
  }
  @Post(':roleId/resource/allocResource') allocResources(
    @Param('roleId', ParseIntPipe) roleId: number,
    @Body('resourceIds') resourceIds: number[],
  ) {
    return this.service.allocResources(roleId, resourceIds);
  }
}
