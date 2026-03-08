import { Controller, Get } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { OssService } from './oss.service';
import { OssPolicyVo } from './vo/oss-policy.vo';

@ApiTags('admin-oss')
@ApiBearerAuth('admin-jwt')
@Controller({ path: 'admin/aliyun/oss', version: '1' })
export class OssController {
  constructor(private readonly ossService: OssService) {}

  @Get('policy')
  @ApiOperation({
    summary: '获取OSS上传策略',
    description: '对应前端 GET /aliyun/oss/policy',
  })
  @ApiOkResponse({ type: OssPolicyVo })
  getPolicy() {
    return this.ossService.getPolicy();
  }
}
