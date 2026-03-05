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
import { HomeContentService } from './home-content.service';
import { PageQueryDto } from '@/common/dto/page-result.dto';

@ApiTags('管理端-SMS-首页广告')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'admin/sms/home-advertises', version: '1' })
export class HomeAdvertiseController {
  constructor(private readonly s: HomeContentService) {}

  @Get('list') list(@Query() q: PageQueryDto) {
    return this.s.listAdvertise(q);
  }
  @Post('create') create(@Body() dto: any) {
    return this.s.createAdvertise(dto);
  }
  @Post('update/:id') update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: any,
  ) {
    return this.s.updateAdvertise(id, dto);
  }
  @Delete('delete') delete(@Query('ids') ids: string) {
    return this.s.deleteAdvertise(ids.split(',').map(Number));
  }
  @Post('update/status') updateStatus(
    @Query('ids') ids: string,
    @Query('status') status: string,
  ) {
    return this.s.updateAdvertiseStatus(
      ids.split(',').map(Number),
      Number(status),
    );
  }
}

@ApiTags('管理端-SMS-首页品牌推荐')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'admin/sms/home-brands', version: '1' })
export class HomeBrandController {
  constructor(private readonly s: HomeContentService) {}

  @Get('list') list(@Query() q: PageQueryDto) {
    return this.s.listHomeBrand(q);
  }
  @Post('create') create(@Body() dto: any[]) {
    return this.s.createHomeBrand(dto);
  }
  @Delete('delete') delete(@Query('ids') ids: string) {
    return this.s.deleteHomeBrand(ids.split(',').map(Number));
  }
  @Post('update/recommendStatus') updateStatus(
    @Query('ids') ids: string,
    @Query('recommendStatus') status: string,
  ) {
    return this.s.updateHomeBrandStatus(
      ids.split(',').map(Number),
      Number(status),
    );
  }

  @Post('update/sort/:id') updateSort(
    @Param('id', ParseIntPipe) id: number,
    @Query('sort') sort: string,
  ) {
    return this.s.updateHomeBrandSort(id, Number(sort));
  }
}

@ApiTags('管理端-SMS-首页专题/新品/热品')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'admin/sms/home-subjects', version: '1' })
export class HomeSubjectController {
  constructor(private readonly s: HomeContentService) {}

  @Get('list') list(@Query() q: PageQueryDto) {
    return this.s.listSubject(q);
  }
  @Post('create') create(@Body() dto: any[]) {
    return this.s.createSubject(dto);
  }
  @Delete('delete') delete(@Query('ids') ids: string) {
    return this.s.deleteSubject(ids.split(',').map(Number));
  }
  @Post('update/recommendStatus') updateStatus(
    @Query('ids') ids: string,
    @Query('recommendStatus') status: string,
  ) {
    return this.s.updateSubjectStatus(
      ids.split(',').map(Number),
      Number(status),
    );
  }
}

@ApiTags('管理端-SMS-新品/热品推荐')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'admin/sms/home-products', version: '1' })
export class HomeProductController {
  constructor(private readonly s: HomeContentService) {}

  @Get('new/list') listNew(@Query() q: PageQueryDto) {
    return this.s.listNewProduct(q);
  }
  @Post('new/create') createNew(@Body() dto: any[]) {
    return this.s.createNewProduct(dto);
  }
  @Delete('new/delete') deleteNew(@Query('ids') ids: string) {
    return this.s.deleteNewProduct(ids.split(',').map(Number));
  }

  @Get('hot/list') listHot(@Query() q: PageQueryDto) {
    return this.s.listHotProduct(q);
  }
  @Post('hot/create') createHot(@Body() dto: any[]) {
    return this.s.createHotProduct(dto);
  }
  @Delete('hot/delete') deleteHot(@Query('ids') ids: string) {
    return this.s.deleteHotProduct(ids.split(',').map(Number));
  }
}
