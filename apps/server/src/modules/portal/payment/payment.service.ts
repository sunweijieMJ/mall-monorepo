import {
  Injectable,
  BadRequestException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AlipayService } from './alipay.service';
import {
  OrderEntity,
  OrderStatus,
} from '@/modules/oms/order/infrastructure/persistence/relational/entities/order.entity';
import { OrderService } from '@/modules/oms/order/order.service';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private readonly alipayService: AlipayService,
    @InjectRepository(OrderEntity)
    private readonly orderRepo: Repository<OrderEntity>,
    private readonly orderService: OrderService,
  ) {}

  /**
   * 创建支付宝支付
   */
  async createAlipayPayment(
    orderId: number,
    memberId: number,
  ): Promise<{ payForm: string }> {
    const order = await this.orderRepo.findOne({ where: { id: orderId } });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (order.memberId !== memberId) {
      throw new BadRequestException('无权操作此订单');
    }

    if (order.status !== OrderStatus.PENDING_PAYMENT) {
      throw new BadRequestException('订单状态不允许支付');
    }

    const payForm = this.alipayService.createPagePayment(
      order.orderSn,
      Number(order.payAmount || order.totalAmount),
      `Mall商城订单-${order.orderSn}`,
    );

    return { payForm };
  }

  /**
   * 处理支付宝异步通知
   */
  async handleAlipayNotify(params: Record<string, string>): Promise<void> {
    // 1. 验签
    const isValid = this.alipayService.verifyNotification(params);
    if (!isValid) {
      throw new BadRequestException('签名验证失败');
    }

    const tradeStatus = params.trade_status;
    const outTradeNo = params.out_trade_no;
    const tradeNo = params.trade_no;

    this.logger.log(
      `支付宝通知: orderSn=${outTradeNo}, status=${tradeStatus}, tradeNo=${tradeNo}`,
    );

    // 2. 原子更新：只有状态为 PENDING_PAYMENT 的订单才会被更新，防止并发重复回调
    if (tradeStatus === 'TRADE_SUCCESS' || tradeStatus === 'TRADE_FINISHED') {
      // 校验支付金额（先查订单获取预期金额）
      const order = await this.orderRepo.findOne({
        where: { orderSn: outTradeNo },
      });
      if (!order) {
        this.logger.warn(`支付回调: 订单不存在 orderSn=${outTradeNo}`);
        return;
      }

      const paidAmount = parseFloat(params.total_amount);
      const expectedAmount = Number(order.payAmount || order.totalAmount);
      if (Math.abs(paidAmount - expectedAmount) > 0.01) {
        this.logger.error(
          `[安全告警] 支付金额不一致: orderSn=${outTradeNo}, paid=${paidAmount}, expected=${expectedAmount}，需人工核查`,
        );
        // 金额不一致是确定性错误，重试不会修复。返回而非抛异常，让 controller 回复 success 停止支付宝重试
        return;
      }

      // 调用 OrderService.paySuccess 完成：状态更新 + 库存扣减 + 操作历史记录
      // paySuccess 内部通过 WHERE status = PENDING_PAYMENT 保证幂等
      try {
        await this.orderService.paySuccess(order.id, 1, order.memberId);
        this.logger.log(`订单支付成功: orderSn=${outTradeNo}`);
      } catch (e) {
        // paySuccess 在订单已处理时会抛异常，此处视为重复回调，仅记录日志
        this.logger.warn(
          `支付回调处理跳过: orderSn=${outTradeNo}, reason=${(e as Error).message}`,
        );
      }
    }
  }
}
