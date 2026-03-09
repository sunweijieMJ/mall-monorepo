import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { BatchDeleteDto } from '@/common/dto/batch-delete.dto';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ApiWrappedResponse } from '@/common/decorators/api-wrapped-response.decorator';
import { MemberLevelService } from './member-level.service';
import {
  CreateMemberLevelDto,
  UpdateMemberLevelDto,
} from './dto/member-level.dto';
import { MemberLevelVo } from './vo/member-level.vo';

@ApiTags('admin-member-level')
@ApiBearerAuth('admin-jwt')
@Controller({ path: 'admin/ums/member-levels', version: '1' })
export class MemberLevelController {
  constructor(private readonly memberLevelService: MemberLevelService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '创建会员等级' })
  @ApiWrappedResponse(MemberLevelVo)
  create(@Body() dto: CreateMemberLevelDto) {
    return this.memberLevelService.create(dto);
  }

  @Post('batch-delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '批量删除会员等级' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  batchDelete(@Body() dto: BatchDeleteDto) {
    return this.memberLevelService.delete(dto.ids);
  }

  @Get()
  @ApiOperation({ summary: '获取会员等级列表' })
  @ApiWrappedResponse(MemberLevelVo, { isArray: true })
  @ApiQuery({
    name: 'defaultStatus',
    required: false,
    type: Number,
    description: '默认等级过滤：0-非默认；1-默认；不传则查全部',
  })
  list(
    @Query('defaultStatus', new ParseIntPipe({ optional: true }))
    defaultStatus?: number,
  ) {
    return this.memberLevelService.list(defaultStatus);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新会员等级' })
  @ApiParam({ name: 'id', description: '会员等级ID', type: 'integer' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMemberLevelDto,
  ) {
    return this.memberLevelService.update(id, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取单个会员等级' })
  @ApiParam({ name: 'id', description: '会员等级ID', type: 'integer' })
  @ApiWrappedResponse(MemberLevelVo)
  getItem(@Param('id', ParseIntPipe) id: number) {
    return this.memberLevelService.getItem(id);
  }
}
