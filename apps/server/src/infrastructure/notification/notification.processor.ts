import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import {
  NotificationPayload,
  NotificationChannel,
} from './types/notification.types';

@Processor('notification')
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);

  async process(job: Job<NotificationPayload>): Promise<void> {
    const { event, recipientId, channel } = job.data;

    this.logger.log(
      `处理通知: event=${event}, recipient=${recipientId}, channel=${channel}`,
    );

    switch (channel) {
      case NotificationChannel.IN_APP:
        await this.sendInApp(job.data);
        break;
      case NotificationChannel.SMS:
        await this.sendSms(job.data);
        break;
      case NotificationChannel.EMAIL:
        await this.sendEmail(job.data);
        break;
      default:
        this.logger.warn(`未知通知渠道: ${channel}`);
    }
  }

  /** 站内信 — TODO: 存入通知表 */
  private async sendInApp(payload: NotificationPayload): Promise<void> {
    this.logger.log(
      `[站内信] → userId=${payload.recipientId}: ${payload.title}`,
    );
    // TODO: Save to notification table for in-app notification center
  }

  /** 短信 — TODO: 对接阿里云 DySms */
  private async sendSms(payload: NotificationPayload): Promise<void> {
    this.logger.log(
      `[SMS] → userId=${payload.recipientId}: ${payload.content}`,
    );
    // TODO: Integrate with Aliyun DySms service
  }

  /** 邮件 — TODO: 对接 nodemailer */
  private async sendEmail(payload: NotificationPayload): Promise<void> {
    this.logger.log(
      `[Email] → userId=${payload.recipientId}: ${payload.title}`,
    );
    // TODO: Integrate with nodemailer service
  }
}
