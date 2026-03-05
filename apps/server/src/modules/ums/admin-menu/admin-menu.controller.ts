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
import { AdminMenuService } from './admin-menu.service';
import { PageQueryDto } from '@/common/dto/page-result.dto';

@ApiTags('管理端-UMS-菜单管理')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'admin/ums/menus', version: '1' })
export class AdminMenuController {
  constructor(private readonly service: AdminMenuService) {}

  @Get('list/:parentId') list(
    @Param('parentId', ParseIntPipe) parentId: number,
    @Query() q: PageQueryDto,
  ) {
    return this.service.list(parentId, q);
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
  @Delete('delete/:id') delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }
  @Get('adminMenu')
  @ApiOperation({
    summary: '获取当前管理员菜单',
    description: '对应前端 GET /menu/list，用于左侧菜单渲染',
  })
  listMenuByAdmin() {
    return this.service.listMenuByAdmin(0);
  }
}
