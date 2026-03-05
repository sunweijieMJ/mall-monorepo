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
import { AdminUserService } from './admin-user.service';
import { PageQueryDto } from '@/common/dto/page-result.dto';
import { UpdateAdminUserDto } from './dto/update-admin-user.dto';
import { UpdateAdminPasswordDto } from './dto/update-admin-password.dto';

@ApiTags('后台用户管理')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('admin')
export class AdminUserController {
  constructor(private readonly service: AdminUserService) {}

  @Get('list')
  @ApiOperation({ summary: '根据用户名或姓名分页获取用户列表' })
  list(@Query('keyword') keyword: string, @Query() q: PageQueryDto) {
    return this.service.list(keyword, q);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取指定用户信息' })
  getItem(@Param('id', ParseIntPipe) id: number) {
    return this.service.getItem(id);
  }

  @Post('update/:id')
  @ApiOperation({ summary: '修改指定用户信息' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAdminUserDto,
  ) {
    return this.service.update(id, dto);
  }

  @Post('delete/:id')
  @ApiOperation({ summary: '删除指定用户信息' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }

  @Post('updateStatus/:id')
  @ApiOperation({ summary: '修改帐号状态' })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Query('status') status: string,
  ) {
    return this.service.updateStatus(id, Number(status));
  }

  @Post('updatePassword')
  @ApiOperation({ summary: '修改密码' })
  updatePassword(@Body() dto: UpdateAdminPasswordDto) {
    return this.service.updatePassword(dto);
  }

  @Post('role/update')
  @ApiOperation({ summary: '给用户分配角色' })
  updateRole(
    @Query('adminId', ParseIntPipe) adminId: number,
    @Query('roleIds') roleIds: string,
  ) {
    const ids = roleIds ? roleIds.split(',').map(Number) : [];
    return this.service.updateRole(adminId, ids);
  }

  @Get('role/:adminId')
  @ApiOperation({ summary: '获取指定用户的角色' })
  getRoleList(@Param('adminId', ParseIntPipe) adminId: number) {
    return this.service.getRoleList(adminId);
  }
}
