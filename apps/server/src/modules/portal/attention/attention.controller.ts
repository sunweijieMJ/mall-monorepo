import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AttentionService, AddAttentionDto } from './attention.service';
import { CurrentUser } from '@/core/auth/decorators/current-user.decorator';
import { JwtPayload } from '@/core/auth/types/jwt-payload.type';
import { PageQueryDto } from '@/common/dto/page-result.dto';

@ApiTags('移动端-品牌关注(独立模块)')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'portal/attention', version: '1' })
export class AttentionController {
  constructor(private readonly attentionService: AttentionService) {}

  @Post('add')
  @ApiOperation({ summary: '关注品牌' })
  add(@CurrentUser() user: JwtPayload, @Body() dto: AddAttentionDto) {
    return this.attentionService.add(user.sub, dto);
  }

  @Delete('delete')
  @ApiOperation({ summary: '取消关注品牌' })
  delete(@CurrentUser() user: JwtPayload, @Query('brandId') brandId: string) {
    return this.attentionService.delete(user.sub, Number(brandId));
  }

  @Get('list')
  @ApiOperation({ summary: '分页查询已关注品牌列表' })
  list(@CurrentUser() user: JwtPayload, @Query() query: PageQueryDto) {
    return this.attentionService.list(user.sub, query);
  }

  @Post('clear')
  @ApiOperation({ summary: '清空全部关注记录' })
  clear(@CurrentUser() user: JwtPayload) {
    return this.attentionService.clear(user.sub);
  }
}
