import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  OrderEntity,
  OrderStatus,
} from './infrastructure/persistence/relational/entities/order.entity';
import { PageQueryDto, PageResult } from '@/common/dto/page-result.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepo: Repository<OrderEntity>,
  ) {}

  // ============ 管理端接口 ============

  /**
   * 管理端订单列表
   * TODO: 迁移自 OmsOrderServiceImpl.list()
   *   - 支持多条件过滤：orderSn, receiverKeyword, status, payType, sourceType, createTime
   */
  async adminList(
    query: PageQueryDto & Record<string, any>,
  ): Promise<PageResult<OrderEntity>> {
    // TODO: implement
    const [list, total] = await this.orderRepo.findAndCount({
      where: { deleteStatus: 0 },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      order: { id: 'DESC' },
    });
    return PageResult.of(list, total, query);
  }

  /**
   * 获取订单详情（管理端）
   * TODO: 迁移自 OmsOrderServiceImpl.detail() - 含订单商品列表、收货地址、操作记录
   */
  async detail(id: number): Promise<OrderEntity> {
    // TODO: implement - 关联查询 order_item、history_records
    const order = await this.orderRepo.findOneBy({ id });
    if (!order) throw new Error(`订单 ${id} 不存在`);
    return order;
  }

  /**
   * 删除订单（管理端逻辑删除）
   * TODO: 迁移自 OmsOrderServiceImpl.delete()
   */
  async adminDelete(ids: number[]): Promise<void> {
    // TODO: implement - 只能删除已完成/已取消的订单
    await this.orderRepo
      .createQueryBuilder()
      .update()
      .set({ deleteStatus: 1 })
      .whereInIds(ids)
      .execute();
  }

  /**
   * 发货
   * TODO: 迁移自 OmsOrderServiceImpl.delivery()
   *   - 批量发货，更新物流公司、物流单号、订单状态为已发货
   */
  async delivery(deliveryList: any[]): Promise<void> {
    // TODO: implement
    throw new Error('TODO: OrderService.delivery');
  }

  /**
   * 关闭订单
   * TODO: 迁移自 OmsOrderServiceImpl.close()
   */
  async close(ids: number[], note: string): Promise<void> {
    // TODO: implement
    await this.orderRepo
      .createQueryBuilder()
      .update()
      .set({ status: OrderStatus.CLOSED, note })
      .whereInIds(ids)
      .execute();
  }

  // ============ 移动端接口 ============

  /**
   * 生成确认订单信息（移动端）
   * TODO: 迁移自 OmsPortalOrderServiceImpl.generateConfirmOrder()
   *   - 根据购物车（或直接购买）汇总：商品列表、金额、优惠券、积分
   */
  async generateConfirmOrder(
    memberId: number,
    cartIds: number[],
  ): Promise<any> {
    // TODO: implement - 返回 ConfirmOrderResult（含商品列表、couponList、memberIntegration、calcAmount）
    throw new Error('TODO: OrderService.generateConfirmOrder');
  }

  /**
   * 生成订单（移动端提交）
   * TODO: 迁移自 OmsPortalOrderServiceImpl.generateOrder()
   *   - 验证库存 → 锁定库存 → 使用优惠券 → 计算金额 → 创建订单 → 发送延迟取消消息
   */
  async generateOrder(memberId: number, dto: any): Promise<OrderEntity> {
    // TODO: implement（重要：需要事务 + 库存预扣 + BullMQ 延迟任务）
    throw new Error('TODO: OrderService.generateOrder');
  }

  /**
   * 支付成功回调
   * TODO: 迁移自 OmsPortalOrderServiceImpl.paySuccess()
   */
  async paySuccess(orderId: number, payType: number): Promise<void> {
    // TODO: implement - 更新 status、paymentTime、payType
    throw new Error('TODO: OrderService.paySuccess');
  }

  /**
   * 用户取消订单
   * TODO: 迁移自 OmsPortalOrderServiceImpl.cancelOrder()
   *   - 只能取消待付款状态的订单
   *   - 解锁 SKU 库存
   */
  async cancelOrder(memberId: number, orderId: number): Promise<void> {
    // TODO: implement
    throw new Error('TODO: OrderService.cancelOrder');
  }

  /**
   * 确认收货
   * TODO: 迁移自 OmsPortalOrderServiceImpl.confirmReceiveOrder()
   */
  async confirmReceive(memberId: number, orderId: number): Promise<void> {
    // TODO: implement - 更新 status = COMPLETED, confirmStatus = 1, receiveTime
    throw new Error('TODO: OrderService.confirmReceive');
  }

  /** 用户订单列表（分页） - TODO */
  async memberList(
    memberId: number,
    status: number,
    query: PageQueryDto,
  ): Promise<PageResult<OrderEntity>> {
    // TODO: implement
    const [list, total] = await this.orderRepo.findAndCount({
      where: { memberId, deleteStatus: 0 },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    });
    return PageResult.of(list, total, query);
  }

  /** 自动取消超时订单（BullMQ 任务调用） */
  async autoCancelIfUnpaid(orderId: number): Promise<void> {
    // TODO: implement - 检查 status = PENDING_PAYMENT → 更新为 CANCELLED → 解锁库存
    throw new Error('TODO: OrderService.autoCancelIfUnpaid');
  }
}
