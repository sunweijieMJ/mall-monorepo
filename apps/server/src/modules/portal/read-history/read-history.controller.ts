import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ReadHistoryService, SaveReadHistoryDto } from './read-history.service';
import { CurrentUser } from '@/core/auth/decorators/current-user.decorator';
import { JwtPayload } from '@/core/auth/types/jwt-payload.type';
import { PageQueryDto } from '@/common/dto/page-result.dto';

@ApiTags('移动端-浏览历史(独立模块)')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'portal/read-history', version: '1' })
export class ReadHistoryController {
  constructor(private readonly readHistoryService: ReadHistoryService) {}

  @Post('add')
  @ApiOperation({ summary: '保存商品浏览历史' })
  save(@CurrentUser() user: JwtPayload, @Body() dto: SaveReadHistoryDto) {
    return this.readHistoryService.save(user.sub, dto);
  }

  @Get('list')
  @ApiOperation({ summary: '分页查询浏览历史（按时间倒序）' })
  list(@CurrentUser() user: JwtPayload, @Query() query: PageQueryDto) {
    return this.readHistoryService.list(user.sub, query);
  }

  @Post('clear')
  @ApiOperation({ summary: '清空全部浏览历史' })
  clear(@CurrentUser() user: JwtPayload) {
    return this.readHistoryService.clear(user.sub);
  }
}
