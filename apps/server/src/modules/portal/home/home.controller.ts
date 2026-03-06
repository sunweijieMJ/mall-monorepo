import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { HomeService } from './home.service';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { Public } from '@/core/auth/decorators/public.decorator';

@ApiTags('移动端-首页')
@Controller({ path: 'portal/home', version: '1' })
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Public()
  @Get('content')
  @CacheTTL(300_000) // 首页数据缓存 5 分钟（cache-manager v7 TTL 单位为毫秒）
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({
    summary: '获取首页数据',
    description: '对应前端 GET /home/content',
  })
  getHomeContent() {
    return this.homeService.getHomeContent();
  }
}
