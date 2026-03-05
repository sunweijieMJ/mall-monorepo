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
import { AdminUserService } from './admin-user.service';
import { PageQueryDto } from '@/common/dto/page-result.dto';

@ApiTags('管理端-UMS-管理员')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'admin/ums/admins', version: '1' })
export class AdminUserController {
  constructor(private readonly service: AdminUserService) {}

  @Get('list')
  @ApiOperation({
    summary: '管理员列表',
    description: '对应前端 GET /admin/list',
  })
  list(@Query('keyword') keyword: string, @Query() q: PageQueryDto) {
    return this.service.list(keyword, q);
  }

  @Post('register')
  @ApiOperation({
    summary: '创建管理员',
    description: '对应前端 POST /admin/register',
  })
  create(@Body() dto: any) {
    return this.service.create(dto);
  }

  @Post('update/:id')
  @ApiOperation({
    summary: '更新管理员',
    description: '对应前端 POST /admin/update/:id',
  })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: any) {
    return this.service.update(id, dto);
  }

  @Delete('delete/:id')
  @ApiOperation({ summary: '删除管理员' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete([id]);
  }

  @Post('updateStatus/:id')
  @ApiOperation({ summary: '修改启用状态' })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Query('status') status: string,
  ) {
    return this.service.updateStatus(id, Number(status));
  }

  @Get(':id/role')
  @ApiOperation({ summary: '获取管理员角色列表' })
  getRoles(@Param('id', ParseIntPipe) id: number) {
    return this.service.getRoles(id);
  }

  @Post(':id/role/update')
  @ApiOperation({ summary: '给管理员分配角色' })
  assignRoles(
    @Param('id', ParseIntPipe) id: number,
    @Body('roleIds') roleIds: number[],
  ) {
    return this.service.assignRoles(id, roleIds);
  }

  @Post('updatePassword')
  @ApiOperation({ summary: '修改密码' })
  updatePassword(@Body() dto: any) {
    return this.service.updatePassword(
      dto.id,
      dto.oldPassword,
      dto.newPassword,
    );
  }
}
