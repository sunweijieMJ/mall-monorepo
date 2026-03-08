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
import { CollectionService } from './collection.service';
import { AddCollectionDto } from './dto/add-collection.dto';
import { CurrentUser } from '@/core/auth/decorators/current-user.decorator';
import { JwtPayload } from '@/core/auth/types/jwt-payload.type';
import { PageQueryDto } from '@/common/dto/page-result.dto';
import { MemberProductCollectionVo } from './vo/member-product-collection.vo';
import { ApiPaginatedResponse } from '@/common/decorators/api-paginated-response.decorator';

@ApiTags('portal-collection')
@ApiBearerAuth('portal-jwt')
@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'portal/collections', version: '1' })
export class CollectionController {
  constructor(private readonly collectionService: CollectionService) {}

  @Post('create')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '收藏商品' })
  @ApiOkResponse({ type: MemberProductCollectionVo })
  create(@CurrentUser() user: JwtPayload, @Body() dto: AddCollectionDto) {
    return this.collectionService.add(user.sub, dto);
  }

  @Delete('clear')
  @ApiOperation({ summary: '清空全部收藏记录' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  clear(@CurrentUser() user: JwtPayload) {
    return this.collectionService.clear(user.sub);
  }

  @Delete(':productId')
  @ApiOperation({ summary: '取消收藏商品' })
  @ApiParam({ name: 'productId', description: '商品ID', type: 'integer' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  delete(
    @CurrentUser() user: JwtPayload,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return this.collectionService.delete(user.sub, productId);
  }

  @Get('list')
  @ApiOperation({ summary: '分页查询收藏商品列表' })
  @ApiPaginatedResponse(MemberProductCollectionVo)
  list(@CurrentUser() user: JwtPayload, @Query() query: PageQueryDto) {
    return this.collectionService.list(user.sub, query);
  }

  @Get('detail')
  @ApiOperation({ summary: '查询单条收藏详情' })
  @ApiOkResponse({ type: MemberProductCollectionVo })
  getItem(
    @CurrentUser() user: JwtPayload,
    @Query('productId', ParseIntPipe) productId: number,
  ) {
    return this.collectionService.getDetail(user.sub, productId);
  }
}
