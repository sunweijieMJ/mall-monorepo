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
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AttentionService } from './attention.service';
import { AddAttentionDto } from './dto/add-attention.dto';
import { CurrentUser } from '@/core/auth/decorators/current-user.decorator';
import { JwtPayload } from '@/core/auth/types/jwt-payload.type';
import { PageQueryDto } from '@/common/dto/page-result.dto';
import { MemberBrandAttentionVo } from './vo/member-brand-attention.vo';
import { ApiPaginatedResponse } from '@/common/decorators/api-paginated-response.decorator';

@ApiTags('portal-attention')
@ApiBearerAuth('portal-jwt')
@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'portal/attentions', version: '1' })
export class AttentionController {
  constructor(private readonly attentionService: AttentionService) {}

  @Post('create')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '关注品牌' })
  @ApiOkResponse({ type: MemberBrandAttentionVo })
  create(@CurrentUser() user: JwtPayload, @Body() dto: AddAttentionDto) {
    return this.attentionService.add(user.sub, dto);
  }

  @Delete('clear')
  @ApiOperation({ summary: '清空全部关注记录' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  clear(@CurrentUser() user: JwtPayload) {
    return this.attentionService.clear(user.sub);
  }

  @Delete(':brandId')
  @ApiOperation({ summary: '取消关注品牌' })
  @ApiParam({ name: 'brandId', description: '品牌ID', type: 'integer' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  delete(
    @CurrentUser() user: JwtPayload,
    @Param('brandId', ParseIntPipe) brandId: number,
  ) {
    return this.attentionService.delete(user.sub, brandId);
  }

  @Get('list')
  @ApiOperation({ summary: '分页查询已关注品牌列表' })
  @ApiPaginatedResponse(MemberBrandAttentionVo)
  list(@CurrentUser() user: JwtPayload, @Query() query: PageQueryDto) {
    return this.attentionService.list(user.sub, query);
  }
}
