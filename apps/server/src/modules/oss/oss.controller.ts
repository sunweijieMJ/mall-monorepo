import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { OssService } from './oss.service';

@ApiTags('管理端-OSS对象存储')
@Controller({ path: 'admin/aliyun/oss', version: '1' })
export class OssController {
  constructor(private readonly ossService: OssService) {}

  @Get('policy')
  @ApiOperation({
    summary: '获取OSS上传策略',
    description: '对应前端 GET /aliyun/oss/policy',
  })
  getPolicy() {
    return this.ossService.getPolicy();
  }
}
