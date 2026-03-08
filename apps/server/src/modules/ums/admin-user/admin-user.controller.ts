import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
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
import { AdminUserService } from './admin-user.service';
import {
  AssignRolesDto,
  UpdateSingleStatusDto,
} from '@/common/dto/batch-update-status.dto';
import { PageQueryDto } from '@/common/dto/page-result.dto';
import { ApiPaginatedResponse } from '@/common/decorators/api-paginated-response.decorator';
import { AdminUserVo } from './vo/admin-user.vo';
import { AdminRoleVo } from '@/modules/ums/admin-role/vo/admin-role.vo';
import { UpdateAdminUserDto } from './dto/update-admin-user.dto';
import { UpdateAdminPasswordDto } from './dto/update-admin-password.dto';

@ApiTags('admin-user')
@ApiBearerAuth('admin-jwt')
@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'admin/ums/admins', version: '1' })
export class AdminUserController {
  constructor(private readonly service: AdminUserService) {}

  @Get('list')
  @ApiOperation({ summary: '根据用户名或姓名分页获取用户列表' })
  @ApiPaginatedResponse(AdminUserVo)
  @ApiQuery({ name: 'keyword', required: false })
  list(@Query('keyword') keyword: string, @Query() q: PageQueryDto) {
    return this.service.list(keyword, q);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取指定用户信息' })
  @ApiOkResponse({ type: AdminUserVo })
  getItem(@Param('id', ParseIntPipe) id: number) {
    return this.service.getItem(id);
  }

  @Put('update/:id')
  @ApiOperation({ summary: '修改指定用户信息' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAdminUserDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete('delete/:id')
  @ApiOperation({ summary: '删除指定用户信息' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }

  @Put('update/status/:id')
  @ApiOperation({ summary: '修改帐号状态' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSingleStatusDto,
  ) {
    return this.service.updateStatus(id, dto.status);
  }

  @Put('password')
  @ApiOperation({ summary: '修改密码' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  updatePassword(@Body() dto: UpdateAdminPasswordDto) {
    return this.service.updatePassword(dto);
  }

  @Put(':id/roles')
  @ApiOperation({ summary: '给用户分配角色' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AssignRolesDto,
  ) {
    return this.service.updateRole(id, dto.roleIds);
  }

  @Get(':id/roles')
  @ApiOperation({ summary: '获取指定用户的角色' })
  @ApiOkResponse({ type: [AdminRoleVo] })
  getRoleList(@Param('id', ParseIntPipe) id: number) {
    return this.service.getRoleList(id);
  }
}
