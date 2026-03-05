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
import { HomeContentService } from './home-content.service';
import { PageQueryDto } from '@/common/dto/page-result.dto';

@ApiTags('管理端-SMS-首页广告')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'admin/sms/home-advertises', version: '1' })
export class HomeAdvertiseController {
  constructor(private readonly s: HomeContentService) {}

  @Get('list')
  @ApiOperation({ summary: '分页查询首页广告' })
  list(
    @Query() q: PageQueryDto,
    @Query('name') name?: string,
    @Query('type') type?: string,
    @Query('endTime') endTime?: string,
  ) {
    return this.s.listAdvertise(
      Object.assign(q, {
        name,
        type: type != null ? Number(type) : undefined,
        endTime,
      }),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: '获取广告详情' })
  getItem(@Param('id', ParseIntPipe) id: number) {
    return this.s.getAdvertiseItem(id);
  }

  @Post('create')
  @ApiOperation({ summary: '添加广告' })
  create(@Body() dto: any) {
    return this.s.createAdvertise(dto);
  }

  @Post('update/:id')
  @ApiOperation({ summary: '修改广告' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: any) {
    return this.s.updateAdvertise(id, dto);
  }

  @Post('delete')
  @ApiOperation({ summary: '批量删除广告' })
  delete(@Body('ids') ids: number[]) {
    return this.s.deleteAdvertise(ids);
  }

  @Post('update/status/:id')
  @ApiOperation({ summary: '修改上下线状态' })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Query('status') status: string,
  ) {
    return this.s.updateAdvertiseStatus(id, Number(status));
  }
}

@ApiTags('管理端-SMS-首页品牌推荐')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'admin/sms/home-brands', version: '1' })
export class HomeBrandController {
  constructor(private readonly s: HomeContentService) {}

  @Get('list')
  @ApiOperation({ summary: '分页查询推荐品牌' })
  list(
    @Query() q: PageQueryDto,
    @Query('brandName') brandName?: string,
    @Query('recommendStatus') recommendStatus?: string,
  ) {
    return this.s.listHomeBrand(
      Object.assign(q, {
        brandName,
        recommendStatus:
          recommendStatus != null ? Number(recommendStatus) : undefined,
      }),
    );
  }

  @Post('create')
  @ApiOperation({ summary: '批量添加推荐品牌' })
  create(@Body() dto: any[]) {
    return this.s.createHomeBrand(dto);
  }

  @Post('delete')
  @ApiOperation({ summary: '批量删除推荐品牌' })
  delete(@Body('ids') ids: number[]) {
    return this.s.deleteHomeBrand(ids);
  }

  @Post('update/recommendStatus')
  @ApiOperation({ summary: '批量修改推荐状态' })
  updateStatus(
    @Query('ids') ids: string,
    @Query('recommendStatus') status: string,
  ) {
    return this.s.updateHomeBrandStatus(
      ids.split(',').map(Number),
      Number(status),
    );
  }

  @Post('update/sort/:id')
  @ApiOperation({ summary: '修改排序' })
  updateSort(
    @Param('id', ParseIntPipe) id: number,
    @Query('sort') sort: string,
  ) {
    return this.s.updateHomeBrandSort(id, Number(sort));
  }
}

@ApiTags('管理端-SMS-推荐专题')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'admin/sms/home-subjects', version: '1' })
export class HomeSubjectController {
  constructor(private readonly s: HomeContentService) {}

  @Get('list')
  @ApiOperation({ summary: '分页查询推荐专题' })
  list(
    @Query() q: PageQueryDto,
    @Query('subjectName') subjectName?: string,
    @Query('recommendStatus') recommendStatus?: string,
  ) {
    return this.s.listSubject(
      Object.assign(q, {
        subjectName,
        recommendStatus:
          recommendStatus != null ? Number(recommendStatus) : undefined,
      }),
    );
  }

  @Post('create')
  @ApiOperation({ summary: '批量添加推荐专题' })
  create(@Body() dto: any[]) {
    return this.s.createSubject(dto);
  }

  @Post('delete')
  @ApiOperation({ summary: '批量删除推荐专题' })
  delete(@Body('ids') ids: number[]) {
    return this.s.deleteSubject(ids);
  }

  @Post('update/recommendStatus')
  @ApiOperation({ summary: '批量修改推荐状态' })
  updateStatus(
    @Query('ids') ids: string,
    @Query('recommendStatus') status: string,
  ) {
    return this.s.updateSubjectStatus(
      ids.split(',').map(Number),
      Number(status),
    );
  }

  @Post('update/sort/:id')
  @ApiOperation({ summary: '修改排序' })
  updateSort(
    @Param('id', ParseIntPipe) id: number,
    @Query('sort') sort: string,
  ) {
    return this.s.updateSubjectSort(id, Number(sort));
  }
}

@ApiTags('管理端-SMS-新品推荐')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'admin/sms/home-new-products', version: '1' })
export class HomeNewProductController {
  constructor(private readonly s: HomeContentService) {}

  @Get('list')
  @ApiOperation({ summary: '分页查询新品推荐' })
  list(
    @Query() q: PageQueryDto,
    @Query('productName') productName?: string,
    @Query('recommendStatus') recommendStatus?: string,
  ) {
    return this.s.listNewProduct(
      Object.assign(q, {
        productName,
        recommendStatus:
          recommendStatus != null ? Number(recommendStatus) : undefined,
      }),
    );
  }

  @Post('create')
  @ApiOperation({ summary: '批量添加新品推荐' })
  create(@Body() dto: any[]) {
    return this.s.createNewProduct(dto);
  }

  @Post('delete')
  @ApiOperation({ summary: '批量删除新品推荐' })
  delete(@Body('ids') ids: number[]) {
    return this.s.deleteNewProduct(ids);
  }

  @Post('update/recommendStatus')
  @ApiOperation({ summary: '批量修改推荐状态' })
  updateStatus(
    @Query('ids') ids: string,
    @Query('recommendStatus') status: string,
  ) {
    return this.s.updateNewProductStatus(
      ids.split(',').map(Number),
      Number(status),
    );
  }

  @Post('update/sort/:id')
  @ApiOperation({ summary: '修改排序' })
  updateSort(
    @Param('id', ParseIntPipe) id: number,
    @Query('sort') sort: string,
  ) {
    return this.s.updateNewProductSort(id, Number(sort));
  }
}

@ApiTags('管理端-SMS-人气推荐')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'admin/sms/home-recommend-products', version: '1' })
export class HomeRecommendProductController {
  constructor(private readonly s: HomeContentService) {}

  @Get('list')
  @ApiOperation({ summary: '分页查询人气推荐' })
  list(
    @Query() q: PageQueryDto,
    @Query('productName') productName?: string,
    @Query('recommendStatus') recommendStatus?: string,
  ) {
    return this.s.listHotProduct(
      Object.assign(q, {
        productName,
        recommendStatus:
          recommendStatus != null ? Number(recommendStatus) : undefined,
      }),
    );
  }

  @Post('create')
  @ApiOperation({ summary: '批量添加人气推荐' })
  create(@Body() dto: any[]) {
    return this.s.createHotProduct(dto);
  }

  @Post('delete')
  @ApiOperation({ summary: '批量删除人气推荐' })
  delete(@Body('ids') ids: number[]) {
    return this.s.deleteHotProduct(ids);
  }

  @Post('update/recommendStatus')
  @ApiOperation({ summary: '批量修改推荐状态' })
  updateStatus(
    @Query('ids') ids: string,
    @Query('recommendStatus') status: string,
  ) {
    return this.s.updateHotProductStatus(
      ids.split(',').map(Number),
      Number(status),
    );
  }

  @Post('update/sort/:id')
  @ApiOperation({ summary: '修改排序' })
  updateSort(
    @Param('id', ParseIntPipe) id: number,
    @Query('sort') sort: string,
  ) {
    return this.s.updateHotProductSort(id, Number(sort));
  }
}
