import { Injectable } from '@nestjs/common';

@Injectable()
export class OrderSettingService {
  /**
   * 获取订单设置
   * TODO: 迁移自 OmsOrderSettingServiceImpl.getItem()
   *   - 查询 oms_order_setting 表 WHERE id = id
   */
  async getItem(id: number): Promise<Record<string, unknown> | null> {
    // TODO: implement
    return null;
  }

  /**
   * 更新订单设置
   * TODO: 迁移自 OmsOrderSettingServiceImpl.update()
   *   - UPDATE oms_order_setting SET ... WHERE id = id
   */
  async update(id: number, data: Record<string, unknown>): Promise<void> {
    // TODO: implement
  }
}
