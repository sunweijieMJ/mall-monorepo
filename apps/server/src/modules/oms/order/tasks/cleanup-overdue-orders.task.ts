import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import {
  OrderEntity,
  OrderStatus,
} from '@/modules/oms/order/infrastructure/persistence/relational/entities/order.entity';
import { OrderService } from '@/modules/oms/order/order.service';

/**
 * 定时扫描超时未付款订单（每 15 分钟执行一次）
 *
 * 作为 BullMQ 延迟取消的兜底机制：
 * 当 BullMQ 入队失败时，超时订单不会被自动取消，此任务负责兜底清理
 */
@Injectable()
export class CleanupOverdueOrdersTask {
  private readonly logger = new Logger(CleanupOverdueOrdersTask.name);

  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepo: Repository<OrderEntity>,
    private readonly orderService: OrderService,
  ) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async handleCron(): Promise<void> {
    // 查找超时未付款的订单：状态为待付款，且创建时间超过订单超时时间
    // 默认超时 60 分钟，这里用 120 分钟作为兜底阈值（留出 BullMQ 正常处理的窗口）
    const overdueThreshold = new Date(Date.now() - 120 * 60 * 1000);

    const overdueOrders = await this.orderRepo.find({
      where: {
        status: OrderStatus.PENDING_PAYMENT,
        createdAt: LessThan(overdueThreshold),
      },
      select: ['id', 'memberId', 'orderSn'],
      take: 100, // 每次最多处理 100 条，避免长时间阻塞
    });

    if (!overdueOrders.length) return;

    this.logger.log(
      `发现 ${overdueOrders.length} 条超时未付款订单，开始兜底取消`,
    );

    for (const order of overdueOrders) {
      try {
        // memberId=0 表示系统调用
        await this.orderService.cancelOrder(0, order.id);
        this.logger.log(
          `兜底取消订单成功: orderId=${order.id}, orderSn=${order.orderSn}`,
        );
      } catch (e) {
        // 订单可能已被其他途径处理，仅记录日志
        this.logger.warn(
          `兜底取消订单跳过: orderId=${order.id}, reason=${(e as Error).message}`,
        );
      }
    }
  }
}
