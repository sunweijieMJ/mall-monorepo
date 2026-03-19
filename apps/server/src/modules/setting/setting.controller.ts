import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { SettingService } from './setting.service';
import { UpsertSettingDto } from './dto/upsert-setting.dto';

@ApiTags('config')
@ApiBearerAuth('admin-jwt')
@Controller({ path: 'config', version: '1' })
export class SettingController {
  constructor(private readonly service: SettingService) {}

  @Get(':path')
  @ApiOperation({ summary: '读取配置' })
  @ApiParam({ name: 'path', description: '配置路径', example: 'theme' })
  findByPath(@Param('path') path: string) {
    return this.service.findByPath(path);
  }

  @Put(':path')
  @ApiOperation({ summary: '写入配置（全量覆盖）' })
  @ApiParam({ name: 'path', description: '配置路径', example: 'theme' })
  upsert(@Param('path') path: string, @Body() dto: UpsertSettingDto) {
    return this.service.upsert(path, dto.value);
  }
}
