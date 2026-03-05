import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CompanyAddressService } from './company-address.service';

@ApiTags('管理端-公司收发货地址')
@Controller({ path: 'admin/oms/companyAddress', version: '1' })
export class CompanyAddressController {
  constructor(private readonly companyAddressService: CompanyAddressService) {}

  @Get('list')
  @ApiOperation({
    summary: '获取公司收发货地址列表',
    description: '对应前端 GET /companyAddress/list',
  })
  list() {
    return this.companyAddressService.list();
  }
}
