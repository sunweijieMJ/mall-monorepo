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

  @Get('list')
  @ApiOperation({ summary: '查询全部优选专区列表' })
  @ApiOkResponse({ type: [PreferenceAreaVo] })
  list() {
    return this.preferenceAreaService.list();
  }

  @Post('create')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '创建优选专区' })
  @ApiOkResponse({ type: PreferenceAreaVo })
  create(@Body() dto: CreatePreferenceAreaDto) {
    return this.preferenceAreaService.create(dto);
  }

  @Put('update/:id')
  @ApiOperation({ summary: '更新优选专区' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePreferenceAreaDto,
  ) {
    return this.preferenceAreaService.update(id, dto);
  }

  @Delete('delete')
  @ApiOperation({
    summary: '批量删除优选专区',
    description: '传入专区 ID 数组',
  })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  batchDelete(@Body() dto: BatchDeleteDto) {
    return this.preferenceAreaService.delete(dto.ids);
  }

  @Get('product-list')
  @ApiOperation({ summary: '查询优选专区关联商品列表' })
  @ApiPaginatedResponse(ProductVo)
  getProductList(
    @Query('preferenceAreaId', ParseIntPipe) preferenceAreaId: number,
    @Query() query: PageQueryDto,
  ) {
    return this.preferenceAreaService.getProductList(preferenceAreaId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取优选专区详情' })
  @ApiWrappedResponse(PreferenceAreaVo)
  getItem(@Param('id', ParseIntPipe) id: number) {
    return this.preferenceAreaService.getItem(id);
  }
}
