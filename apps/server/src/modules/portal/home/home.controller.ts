import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { HomeService } from './home.service';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';

@ApiTags('移动端-首页')
@Controller({ path: 'portal/home', version: '1' })
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Get('content')
  @CacheTTL(300) // 首页数据缓存 5 分钟
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({
    summary: '获取首页数据',
    description: '对应前端 GET /home/content',
  })
  getHomeContent() {
    return this.homeService.getHomeContent();
  }
}
