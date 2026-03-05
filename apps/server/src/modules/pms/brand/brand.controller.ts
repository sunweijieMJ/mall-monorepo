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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { BrandService } from './brand.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { QueryBrandDto } from './dto/query-brand.dto';

@ApiTags('管理端-PMS-品牌管理')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'admin/pms/brands', version: '1' })
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Get('list')
  @ApiOperation({
    summary: '品牌列表（分页）',
    description: '对应前端 GET /brand/list',
  })
  findList(@Query() query: QueryBrandDto) {
    return this.brandService.findList(query);
  }

  @Get('listAll')
  @ApiOperation({
    summary: '获取所有品牌（不分页）',
    description: '对应前端 GET /brand/listAll',
  })
  findAll() {
    return this.brandService.findAll();
  }

  @Post('create')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '创建品牌',
    description: '对应前端 POST /brand/create',
  })
  create(@Body() dto: CreateBrandDto) {
    return this.brandService.create(dto);
  }

  @Put('update/:id')
  @ApiOperation({
    summary: '更新品牌',
    description: '对应前端 PUT /brand/update/:id',
  })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateBrandDto) {
    return this.brandService.update(id, dto);
  }

  @Delete('delete')
  @ApiOperation({
    summary: '批量删除品牌',
    description: '对应前端 DELETE /brand/delete?ids=1,2',
  })
  remove(@Query('ids') ids: string) {
    return this.brandService.remove(ids.split(',').map(Number));
  }

  @Post('update/showStatus')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '更新显示状态' })
  updateShowStatus(
    @Query('ids') ids: string,
    @Query('showStatus') showStatus: string,
  ) {
    return this.brandService.updateShowStatus(
      ids.split(',').map(Number),
      Number(showStatus),
    );
  }

  @Post('update/factoryStatus')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '更新厂家制造商状态' })
  updateFactoryStatus(
    @Query('ids') ids: string,
    @Query('factoryStatus') factoryStatus: string,
  ) {
    return this.brandService.updateFactoryStatus(
      ids.split(',').map(Number),
      Number(factoryStatus),
    );
  }
}
