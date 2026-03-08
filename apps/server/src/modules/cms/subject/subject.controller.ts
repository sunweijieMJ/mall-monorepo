import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BatchDeleteDto } from '@/common/dto/batch-delete.dto';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { SubjectService } from './subject.service';
import { PageQueryDto } from '@/common/dto/page-result.dto';
import {
  CreateSubjectDto,
  UpdateSubjectDto,
  SubjectQueryDto,
} from './dto/create-subject.dto';
import { SubjectVo } from './vo/subject.vo';
import { ApiPaginatedResponse } from '@/common/decorators/api-paginated-response.decorator';
import { ApiWrappedResponse } from '@/common/decorators/api-wrapped-response.decorator';
import { ProductVo } from '@/modules/pms/product/vo/product.vo';

@ApiTags('admin-subject')
@ApiBearerAuth('admin-jwt')
@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'admin/cms/subjects', version: '1' })
export class SubjectController {
  constructor(private readonly subjectService: SubjectService) {}

  @Get('list')
  @ApiOperation({ summary: '分页查询专题列表' })
  @ApiPaginatedResponse(SubjectVo)
  list(@Query() query: SubjectQueryDto) {
    return this.subjectService.list(query);
  }

  @Post('create')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '创建专题' })
  @ApiOkResponse({ type: SubjectVo })
  create(@Body() dto: CreateSubjectDto) {
    return this.subjectService.create(dto);
  }

  @Put('update/:id')
  @ApiOperation({ summary: '更新专题' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSubjectDto) {
    return this.subjectService.update(id, dto);
  }

  @Delete('delete')
  @ApiOperation({ summary: '批量删除专题', description: '传入专题 ID 数组' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  batchDelete(@Body() dto: BatchDeleteDto) {
    return this.subjectService.delete(dto.ids);
  }

  @Get('product-list')
  @ApiOperation({ summary: '查询专题关联商品列表' })
  @ApiPaginatedResponse(ProductVo)
  getProductList(
    @Query('subjectId', ParseIntPipe) subjectId: number,
    @Query() query: PageQueryDto,
  ) {
    return this.subjectService.getProductList(subjectId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取专题详情' })
  @ApiWrappedResponse(SubjectVo)
  getItem(@Param('id', ParseIntPipe) id: number) {
    return this.subjectService.getItem(id);
  }
}
