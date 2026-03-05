import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { MemberLevelService } from './member-level.service';
import { MemberLevelEntity } from './infrastructure/persistence/relational/entities/member-level.entity';

@ApiTags('管理端-UMS-会员等级')
@ApiBearerAuth()
@Controller({ path: 'admin/ums/member-levels', version: '1' })
export class MemberLevelController {
  constructor(private readonly memberLevelService: MemberLevelService) {}

  @Get('list')
  @ApiOperation({ summary: '获取会员等级列表' })
  @ApiQuery({
    name: 'defaultStatus',
    required: false,
    description: '默认等级过滤：0-非默认；1-默认；不传则查全部',
  })
  list(@Query('defaultStatus') defaultStatus?: string) {
    const status = defaultStatus != null ? Number(defaultStatus) : undefined;
    return this.memberLevelService.list(status);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取单个会员等级' })
  getItem(@Param('id', ParseIntPipe) id: number) {
    return this.memberLevelService.getItem(id);
  }

  @Post('create')
  @ApiOperation({ summary: '创建会员等级' })
  create(@Body() dto: Partial<MemberLevelEntity>) {
    return this.memberLevelService.create(dto);
  }

  @Put('update/:id')
  @ApiOperation({ summary: '更新会员等级' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<MemberLevelEntity>,
  ) {
    return this.memberLevelService.update(id, dto);
  }

  @Delete('delete')
  @ApiOperation({ summary: '批量删除会员等级' })
  @ApiQuery({ name: 'ids', description: '逗号分隔的 ID 列表，例如：1,2,3' })
  delete(@Query('ids') ids: string) {
    return this.memberLevelService.delete(ids.split(',').map(Number));
  }
}
