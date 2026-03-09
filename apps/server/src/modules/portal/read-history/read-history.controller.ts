import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
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
import { ApiWrappedResponse } from '@/common/decorators/api-wrapped-response.decorator';
import { AuthGuard } from '@nestjs/passport';
import { ReadHistoryService } from './read-history.service';
import { SaveReadHistoryDto } from './dto/save-read-history.dto';
import { CurrentUser } from '@/core/auth/decorators/current-user.decorator';
import { JwtPayload } from '@/core/auth/types/jwt-payload.type';
import { PageQueryDto } from '@/common/dto/page-result.dto';
import { MemberReadHistoryVo } from './vo/member-read-history.vo';
import { ApiPaginatedResponse } from '@/common/decorators/api-paginated-response.decorator';

@ApiTags('portal-read-history')
@ApiBearerAuth('portal-jwt')
@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'portal/read-histories', version: '1' })
export class ReadHistoryController {
  constructor(private readonly readHistoryService: ReadHistoryService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '保存商品浏览历史' })
  @ApiWrappedResponse(MemberReadHistoryVo)
  create(@CurrentUser() user: JwtPayload, @Body() dto: SaveReadHistoryDto) {
    return this.readHistoryService.save(user.sub, dto);
  }

  @Get()
  @ApiOperation({ summary: '分页查询浏览历史（按时间倒序）' })
  @ApiPaginatedResponse(MemberReadHistoryVo)
  list(@CurrentUser() user: JwtPayload, @Query() query: PageQueryDto) {
    return this.readHistoryService.list(user.sub, query);
  }

  @Post('batch-delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '批量删除浏览历史' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  batchDelete(@CurrentUser() user: JwtPayload, @Body() dto: BatchDeleteDto) {
    return this.readHistoryService.batchDelete(user.sub, dto.ids);
  }

  @Delete('clear')
  @ApiOperation({ summary: '清空全部浏览历史' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  clear(@CurrentUser() user: JwtPayload) {
    return this.readHistoryService.clear(user.sub);
  }
}
