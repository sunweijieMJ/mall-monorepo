import { Injectable } from '@nestjs/common';

@Injectable()
export class CompanyAddressService {
  /**
   * 获取公司收发货地址列表
   * TODO: 迁移自 OmsCompanyAddressServiceImpl.list()
   *   - 查询 oms_company_address 全表
   */
  async list(): Promise<unknown[]> {
    // TODO: implement
    return [];
  }
}
