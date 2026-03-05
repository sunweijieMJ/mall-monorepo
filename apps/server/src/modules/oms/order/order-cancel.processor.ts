import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { OrderService } from './order.service';

/**
 * 订单自动取消任务处理器
 * 消费 BullMQ 延迟任务，对超时未支付订单执行取消操作
 */
@Processor('order-cancel')
export class OrderCancelProcessor extends WorkerHost {
  constructor(private readonly orderService: OrderService) {
    super();
  }

  async process(job: Job): Promise<void> {
    const { orderId } = job.data;
    await this.orderService.autoCancelIfUnpaid(orderId);
  }
}
