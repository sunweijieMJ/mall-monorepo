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
import {
  PrefrenceAreaService,
  CreatePrefrenceAreaDto,
} from './prefrence-area.service';
import { PageQueryDto } from '@/common/dto/page-result.dto';

@ApiTags('管理端-CMS-优选专区')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'admin/cms/prefrence-areas', version: '1' })
export class PrefrenceAreaController {
  constructor(private readonly prefrenceAreaService: PrefrenceAreaService) {}

  @Get('list')
  @ApiOperation({ summary: '查询全部优选专区列表' })
  list() {
    return this.prefrenceAreaService.list();
  }

  @Post('create')
  @ApiOperation({ summary: '创建优选专区' })
  create(@Body() dto: CreatePrefrenceAreaDto) {
    return this.prefrenceAreaService.create(dto);
  }

  @Put('update/:id')
  @ApiOperation({ summary: '更新优选专区' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreatePrefrenceAreaDto,
  ) {
    return this.prefrenceAreaService.update(id, dto);
  }

  @Delete('delete')
  @ApiOperation({
    summary: '批量删除优选专区',
    description: '传入专区 ID 数组',
  })
  delete(@Query('ids') ids: string) {
    return this.prefrenceAreaService.delete(ids.split(',').map(Number));
  }

  @Get('productList')
  @ApiOperation({ summary: '查询优选专区关联商品列表' })
  getProductList(
    @Query('prefrenceAreaId', ParseIntPipe) prefrenceAreaId: number,
    @Query() query: PageQueryDto,
  ) {
    return this.prefrenceAreaService.getProductList(prefrenceAreaId, query);
  }
}
