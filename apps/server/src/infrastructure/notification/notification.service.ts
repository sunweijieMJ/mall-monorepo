import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import {
  NotificationPayload,
  NotificationChannel,
  NotificationEvent,
} from './types/notification.types';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectQueue('notification')
    private readonly notificationQueue: Queue,
  ) {}

  /**
   * 发送通知（异步入队）
   */
  async send(payload: NotificationPayload): Promise<void> {
    await this.notificationQueue.add(payload.event, payload, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
    });
    this.logger.debug(
      `通知已入队: event=${payload.event}, recipient=${payload.recipientId}, channel=${payload.channel}`,
    );
  }

  /**
   * 批量发送通知
   */
  async sendBatch(payloads: NotificationPayload[]): Promise<void> {
    const jobs = payloads.map((p) => ({
      name: p.event,
      data: p,
      opts: {
        attempts: 3,
        backoff: { type: 'exponential' as const, delay: 2000 },
      },
    }));
    await this.notificationQueue.addBulk(jobs);
    this.logger.debug(`批量通知已入队: count=${payloads.length}`);
  }

  /**
   * 快捷方法：发送订单状态变更通知
   */
  async notifyOrderStatus(
    memberId: number,
    orderSn: string,
    event: NotificationEvent,
    title: string,
    content: string,
  ): Promise<void> {
    await this.send({
      event,
      recipientId: memberId,
      channel: NotificationChannel.IN_APP,
      title,
      content,
      metadata: { orderSn },
    });
  }
}
