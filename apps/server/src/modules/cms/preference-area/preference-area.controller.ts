import {
  Body,
  Controller,
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
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PreferenceAreaService } from './preference-area.service';
import { PageQueryDto } from '@/common/dto/page-result.dto';
import {
  CreatePreferenceAreaDto,
  UpdatePreferenceAreaDto,
} from './dto/create-preference-area.dto';
import { PreferenceAreaVo } from './vo/preference-area.vo';
import { ApiPaginatedResponse } from '@/common/decorators/api-paginated-response.decorator';
import { ApiWrappedResponse } from '@/common/decorators/api-wrapped-response.decorator';
import { ProductVo } from '@/modules/pms/product/vo/product.vo';

@ApiTags('admin-preference-area')
@ApiBearerAuth('admin-jwt')
@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'admin/cms/preference-areas', version: '1' })
export class PreferenceAreaController {
  constructor(private readonly preferenceAreaService: PreferenceAreaService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '创建优选专区' })
  @ApiWrappedResponse(PreferenceAreaVo)
  create(@Body() dto: CreatePreferenceAreaDto) {
    return this.preferenceAreaService.create(dto);
  }

  @Post('batch-delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '批量删除优选专区',
    description: '传入专区 ID 数组',
  })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  batchDelete(@Body() dto: BatchDeleteDto) {
    return this.preferenceAreaService.delete(dto.ids);
  }

  @Get()
  @ApiOperation({ summary: '查询全部优选专区列表' })
  @ApiWrappedResponse(PreferenceAreaVo, { isArray: true })
  list() {
    return this.preferenceAreaService.list();
  }

  @Get(':id/products')
  @ApiOperation({ summary: '查询优选专区关联商品列表' })
  @ApiParam({ name: 'id', description: '优选专区ID', type: 'integer' })
  @ApiPaginatedResponse(ProductVo)
  getProductList(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: PageQueryDto,
  ) {
    return this.preferenceAreaService.getProductList(id, query);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新优选专区' })
  @ApiParam({ name: 'id', description: '优选专区ID', type: 'integer' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePreferenceAreaDto,
  ) {
    return this.preferenceAreaService.update(id, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取优选专区详情' })
  @ApiParam({ name: 'id', description: '优选专区ID', type: 'integer' })
  @ApiWrappedResponse(PreferenceAreaVo)
  getItem(@Param('id', ParseIntPipe) id: number) {
    return this.preferenceAreaService.getItem(id);
  }
}
