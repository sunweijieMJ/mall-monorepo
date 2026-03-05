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
import { AdminMenuService } from './admin-menu.service';
import { PageQueryDto } from '@/common/dto/page-result.dto';
import { CreateAdminMenuDto } from './dto/create-admin-menu.dto';
import { UpdateAdminMenuDto } from './dto/update-admin-menu.dto';

@ApiTags('后台菜单管理')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('menu')
export class AdminMenuController {
  constructor(private readonly service: AdminMenuService) {}

  @Post('create')
  @ApiOperation({ summary: '添加后台菜单' })
  create(@Body() dto: CreateAdminMenuDto) {
    return this.service.create(dto);
  }

  @Post('update/:id')
  @ApiOperation({ summary: '修改后台菜单' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAdminMenuDto,
  ) {
    return this.service.update(id, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID获取菜单详情' })
  getItem(@Param('id', ParseIntPipe) id: number) {
    return this.service.getItem(id);
  }

  @Post('delete/:id')
  @ApiOperation({ summary: '根据ID删除后台菜单' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }

  @Get('list/:parentId')
  @ApiOperation({ summary: '根据父菜单ID分页查询子菜单' })
  list(
    @Param('parentId', ParseIntPipe) parentId: number,
    @Query() q: PageQueryDto,
  ) {
    return this.service.list(parentId, q);
  }

  @Get('treeList')
  @ApiOperation({ summary: '树形结构返回所有菜单列表' })
  treeList() {
    return this.service.treeList();
  }

  @Post('updateHidden/:id')
  @ApiOperation({ summary: '修改菜单显示状态' })
  updateHidden(
    @Param('id', ParseIntPipe) id: number,
    @Query('hidden') hidden: string,
  ) {
    return this.service.updateHidden(id, Number(hidden));
  }
}
