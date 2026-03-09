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
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ApiWrappedResponse } from '@/common/decorators/api-wrapped-response.decorator';
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
import { ResetAdminPasswordDto } from './dto/reset-admin-password.dto';
import { CurrentUser } from '@/core/auth/decorators/current-user.decorator';
import { JwtPayload } from '@/core/auth/types/jwt-payload.type';

@ApiTags('admin-user')
@ApiBearerAuth('admin-jwt')
@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'admin/ums/admins', version: '1' })
export class AdminUserController {
  constructor(private readonly service: AdminUserService) {}

  @Get()
  @ApiOperation({ summary: '根据用户名或姓名分页获取用户列表' })
  @ApiPaginatedResponse(AdminUserVo)
  @ApiQuery({ name: 'keyword', required: false })
  list(@Query('keyword') keyword: string, @Query() q: PageQueryDto) {
    return this.service.list(keyword, q);
  }

  @Put('password')
  @ApiOperation({ summary: '修改密码' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  updatePassword(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateAdminPasswordDto,
  ) {
    return this.service.updatePassword({
      username: user.username,
      ...dto,
    });
  }

  @Put(':id')
  @ApiOperation({ summary: '修改指定用户信息' })
  @ApiParam({ name: 'id', description: '管理员ID', type: 'integer' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAdminUserDto,
  ) {
    return this.service.update(id, dto);
  }

  @Put(':id/status')
  @ApiOperation({ summary: '修改帐号状态' })
  @ApiParam({ name: 'id', description: '管理员ID', type: 'integer' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSingleStatusDto,
  ) {
    return this.service.updateStatus(id, dto.status);
  }

  @Put(':id/roles')
  @ApiOperation({ summary: '给用户分配角色' })
  @ApiParam({ name: 'id', description: '管理员ID', type: 'integer' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AssignRolesDto,
  ) {
    return this.service.updateRole(id, dto.roleIds);
  }

  @Put(':id/password')
  @ApiOperation({ summary: '重置管理员密码' })
  @ApiParam({ name: 'id', description: '管理员ID', type: 'integer' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  resetPassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ResetAdminPasswordDto,
  ) {
    return this.service.resetPassword(id, dto.newPassword);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除指定用户信息' })
  @ApiParam({ name: 'id', description: '管理员ID', type: 'integer' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取指定用户信息' })
  @ApiParam({ name: 'id', description: '管理员ID', type: 'integer' })
  @ApiWrappedResponse(AdminUserVo)
  getItem(@Param('id', ParseIntPipe) id: number) {
    return this.service.getItem(id);
  }

  @Get(':id/roles')
  @ApiOperation({ summary: '获取指定用户的角色' })
  @ApiParam({ name: 'id', description: '管理员ID', type: 'integer' })
  @ApiWrappedResponse(AdminRoleVo, { isArray: true })
  getRoleList(@Param('id', ParseIntPipe) id: number) {
    return this.service.getRoleList(id);
  }
}
