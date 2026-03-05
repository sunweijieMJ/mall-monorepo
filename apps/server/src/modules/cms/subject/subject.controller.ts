import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { SubjectService } from './subject.service';
import { PageQueryDto } from '@/common/dto/page-result.dto';
import { CreateSubjectDto, SubjectQueryDto } from './dto/create-subject.dto';

@ApiTags('管理端-CMS-专题')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'admin/cms/subjects', version: '1' })
export class SubjectController {
  constructor(private readonly subjectService: SubjectService) {}

  @Get('list')
  @ApiOperation({ summary: '分页查询专题列表' })
  list(@Query() query: SubjectQueryDto) {
    return this.subjectService.list(query);
  }

  @Post('create')
  @ApiOperation({ summary: '创建专题' })
  create(@Body() dto: CreateSubjectDto) {
    return this.subjectService.create(dto);
  }

  @Put('update/:id')
  @ApiOperation({ summary: '更新专题' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateSubjectDto) {
    return this.subjectService.update(id, dto);
  }

  @Delete('delete')
  @ApiOperation({ summary: '批量删除专题', description: '传入专题 ID 数组' })
  delete(@Query('ids') ids: string) {
    return this.subjectService.delete(ids.split(',').map(Number));
  }

  @Get('productList')
  @ApiOperation({ summary: '查询专题关联商品列表' })
  getProductList(
    @Query('subjectId', ParseIntPipe) subjectId: number,
    @Query() query: PageQueryDto,
  ) {
    return this.subjectService.getProductList(subjectId, query);
  }
}
