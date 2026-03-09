import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiWrappedResponse } from '@/common/decorators/api-wrapped-response.decorator';
import { OssService } from './oss.service';
import { OssPolicyVo } from './vo/oss-policy.vo';

@ApiTags('admin-oss')
@ApiBearerAuth('admin-jwt')
@Controller({ path: 'admin/oss', version: '1' })
export class OssController {
  constructor(private readonly ossService: OssService) {}

  @Get('policy')
  @ApiOperation({
    summary: '获取OSS上传策略',
    description: '对应前端 GET /aliyun/oss/policy',
  })
  @ApiWrappedResponse(OssPolicyVo)
  getPolicy() {
    return this.ossService.getPolicy();
  }
}
