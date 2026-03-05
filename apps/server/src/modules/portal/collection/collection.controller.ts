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
import { CollectionService, AddCollectionDto } from './collection.service';
import { CurrentUser } from '@/core/auth/decorators/current-user.decorator';
import { JwtPayload } from '@/core/auth/types/jwt-payload.type';
import { PageQueryDto } from '@/common/dto/page-result.dto';

@ApiTags('移动端-商品收藏(独立模块)')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'portal/collection', version: '1' })
export class CollectionController {
  constructor(private readonly collectionService: CollectionService) {}

  @Post('add')
  @ApiOperation({ summary: '收藏商品' })
  add(@CurrentUser() user: JwtPayload, @Body() dto: AddCollectionDto) {
    return this.collectionService.add(user.sub, dto);
  }

  @Delete('delete')
  @ApiOperation({ summary: '取消收藏商品' })
  delete(
    @CurrentUser() user: JwtPayload,
    @Query('productId') productId: string,
  ) {
    return this.collectionService.delete(user.sub, Number(productId));
  }

  @Get('list')
  @ApiOperation({ summary: '分页查询收藏商品列表' })
  list(@CurrentUser() user: JwtPayload, @Query() query: PageQueryDto) {
    return this.collectionService.list(user.sub, query);
  }

  @Post('clear')
  @ApiOperation({ summary: '清空全部收藏记录' })
  clear(@CurrentUser() user: JwtPayload) {
    return this.collectionService.clear(user.sub);
  }

  @Get('detail')
  @ApiOperation({ summary: '查询单条收藏详情' })
  getDetail(
    @CurrentUser() user: JwtPayload,
    @Query('productId') productId: string,
  ) {
    return this.collectionService.getDetail(user.sub, Number(productId));
  }
}
