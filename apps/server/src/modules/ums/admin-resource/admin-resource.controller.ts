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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AdminResourceService } from './admin-resource.service';
import { PageQueryDto } from '@/common/dto/page-result.dto';

@ApiTags('管理端-UMS-资源管理')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'admin/ums/resources', version: '1' })
export class AdminResourceController {
  constructor(private readonly s: AdminResourceService) {}

  @Get('list') list(@Query() q: PageQueryDto) {
    return this.s.list(q);
  }
  @Post('create') create(@Body() dto: any) {
    return this.s.create(dto);
  }
  @Post('update/:id') update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: any,
  ) {
    return this.s.update(id, dto);
  }
  @Delete('delete/:id') delete(@Param('id', ParseIntPipe) id: number) {
    return this.s.delete(id);
  }
}

@ApiTags('管理端-UMS-资源分类')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'admin/ums/resource-categories', version: '1' })
export class AdminResourceCategoryController {
  constructor(private readonly s: AdminResourceService) {}

  @Get('listAll') listAll() {
    return this.s.listCategory();
  }
  @Post('create') create(@Body() dto: any) {
    return this.s.createCategory(dto);
  }
  @Post('update/:id') update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: any,
  ) {
    return this.s.updateCategory(id, dto);
  }
  @Delete('delete/:id') delete(@Param('id', ParseIntPipe) id: number) {
    return this.s.deleteCategory(id);
  }
}
