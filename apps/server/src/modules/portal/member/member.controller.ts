import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { MemberService } from './member.service';

// 临时类型，迁移时替换为实际 Request + JwtPayload
interface AuthRequest extends Request {
  user: { id: number };
}

@ApiTags('移动端-会员信息')
@Controller({ path: 'portal/sso', version: '1' })
export class MemberInfoController {
  constructor(private readonly memberService: MemberService) {}

  @Get('info')
  @ApiOperation({
    summary: '获取当前会员信息',
    description: '对应前端 GET /sso/info',
  })
  getInfo(@Req() req: AuthRequest) {
    return this.memberService.getCurrentMember(req.user.id);
  }
}

@ApiTags('移动端-收货地址')
@Controller({ path: 'portal/member/address', version: '1' })
export class MemberAddressController {
  constructor(private readonly memberService: MemberService) {}

  @Get('list')
  @ApiOperation({
    summary: '获取收货地址列表',
    description: '对应前端 GET /member/address/list',
  })
  list(@Req() req: AuthRequest) {
    return this.memberService.listAddress(req.user.id);
  }

  @Get(':id')
  @ApiOperation({
    summary: '获取收货地址详情',
    description: '对应前端 GET /member/address/:id',
  })
  detail(@Param('id', ParseIntPipe) id: number, @Req() req: AuthRequest) {
    return this.memberService.getAddress(id, req.user.id);
  }

  @Post('add')
  @ApiOperation({
    summary: '添加收货地址',
    description: '对应前端 POST /member/address/add',
  })
  add(@Body() body: Record<string, unknown>, @Req() req: AuthRequest) {
    return this.memberService.addAddress(req.user.id, body);
  }

  @Post('update/:id')
  @ApiOperation({
    summary: '更新收货地址',
    description: '对应前端 POST /member/address/update/:id',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: Record<string, unknown>,
    @Req() req: AuthRequest,
  ) {
    return this.memberService.updateAddress(id, req.user.id, body);
  }

  @Post('delete/:id')
  @ApiOperation({
    summary: '删除收货地址',
    description: '对应前端 POST /member/address/delete/:id',
  })
  delete(@Param('id', ParseIntPipe) id: number, @Req() req: AuthRequest) {
    return this.memberService.deleteAddress(id, req.user.id);
  }
}

@ApiTags('移动端-商品收藏')
@Controller({ path: 'portal/member/productCollection', version: '1' })
export class MemberProductCollectionController {
  constructor(private readonly memberService: MemberService) {}

  @Post('add')
  @ApiOperation({
    summary: '添加商品收藏',
    description: '对应前端 POST /member/productCollection/add',
  })
  add(@Body() body: Record<string, unknown>, @Req() req: AuthRequest) {
    return this.memberService.addProductCollection(req.user.id, body);
  }

  @Post('delete')
  @ApiOperation({
    summary: '删除商品收藏',
    description: '对应前端 POST /member/productCollection/delete?productId=xx',
  })
  delete(
    @Query('productId', ParseIntPipe) productId: number,
    @Req() req: AuthRequest,
  ) {
    return this.memberService.deleteProductCollection(req.user.id, productId);
  }

  @Get('list')
  @ApiOperation({
    summary: '获取商品收藏列表',
    description: '对应前端 GET /member/productCollection/list',
  })
  list(
    @Query('pageNum') pageNum: number = 1,
    @Query('pageSize') pageSize: number = 10,
    @Req() req: AuthRequest,
  ) {
    return this.memberService.listProductCollection(
      req.user.id,
      pageNum,
      pageSize,
    );
  }

  @Get('detail')
  @ApiOperation({
    summary: '获取商品收藏详情',
    description: '对应前端 GET /member/productCollection/detail',
  })
  detail(
    @Query('productId', ParseIntPipe) productId: number,
    @Req() req: AuthRequest,
  ) {
    return this.memberService.getProductCollectionDetail(
      req.user.id,
      productId,
    );
  }

  @Post('clear')
  @ApiOperation({
    summary: '清空商品收藏',
    description: '对应前端 POST /member/productCollection/clear',
  })
  clear(@Req() req: AuthRequest) {
    return this.memberService.clearProductCollection(req.user.id);
  }
}

@ApiTags('移动端-品牌关注')
@Controller({ path: 'portal/member/attention', version: '1' })
export class MemberBrandAttentionController {
  constructor(private readonly memberService: MemberService) {}

  @Post('add')
  @ApiOperation({
    summary: '添加品牌关注',
    description: '对应前端 POST /member/attention/add',
  })
  add(@Body() body: Record<string, unknown>, @Req() req: AuthRequest) {
    return this.memberService.addBrandAttention(req.user.id, body);
  }

  @Post('delete')
  @ApiOperation({
    summary: '删除品牌关注',
    description: '对应前端 POST /member/attention/delete?brandId=xx',
  })
  delete(
    @Query('brandId', ParseIntPipe) brandId: number,
    @Req() req: AuthRequest,
  ) {
    return this.memberService.deleteBrandAttention(req.user.id, brandId);
  }

  @Get('list')
  @ApiOperation({
    summary: '获取品牌关注列表',
    description: '对应前端 GET /member/attention/list',
  })
  list(
    @Query('pageNum') pageNum: number = 1,
    @Query('pageSize') pageSize: number = 10,
    @Req() req: AuthRequest,
  ) {
    return this.memberService.listBrandAttention(
      req.user.id,
      pageNum,
      pageSize,
    );
  }

  @Get('detail')
  @ApiOperation({
    summary: '获取品牌关注详情',
    description: '对应前端 GET /member/attention/detail',
  })
  detail(
    @Query('brandId', ParseIntPipe) brandId: number,
    @Req() req: AuthRequest,
  ) {
    return this.memberService.getBrandAttentionDetail(req.user.id, brandId);
  }

  @Post('clear')
  @ApiOperation({
    summary: '清空品牌关注',
    description: '对应前端 POST /member/attention/clear',
  })
  clear(@Req() req: AuthRequest) {
    return this.memberService.clearBrandAttention(req.user.id);
  }
}

@ApiTags('移动端-浏览历史')
@Controller({ path: 'portal/member/readHistory', version: '1' })
export class MemberReadHistoryController {
  constructor(private readonly memberService: MemberService) {}

  @Post('create')
  @ApiOperation({
    summary: '创建浏览记录',
    description: '对应前端 POST /member/readHistory/create',
  })
  create(@Body() body: Record<string, unknown>, @Req() req: AuthRequest) {
    return this.memberService.createReadHistory(req.user.id, body);
  }

  @Get('list')
  @ApiOperation({
    summary: '获取浏览历史列表',
    description: '对应前端 GET /member/readHistory/list',
  })
  list(
    @Query('pageNum') pageNum: number = 1,
    @Query('pageSize') pageSize: number = 10,
    @Req() req: AuthRequest,
  ) {
    return this.memberService.listReadHistory(req.user.id, pageNum, pageSize);
  }

  @Post('clear')
  @ApiOperation({
    summary: '清空浏览历史',
    description: '对应前端 POST /member/readHistory/clear',
  })
  clear(@Req() req: AuthRequest) {
    return this.memberService.clearReadHistory(req.user.id);
  }
}
