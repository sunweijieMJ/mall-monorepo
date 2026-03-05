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

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private readonly alipayService: AlipayService,
    @InjectRepository(OrderEntity)
    private readonly orderRepo: Repository<OrderEntity>,
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
          `支付回调金额不一致: orderSn=${outTradeNo}, paid=${paidAmount}, expected=${expectedAmount}`,
        );
        throw new BadRequestException('支付金额与订单金额不一致');
      }

      // 原子更新：WHERE 条件包含 status = PENDING_PAYMENT，保证幂等
      const result = await this.orderRepo
        .createQueryBuilder()
        .update()
        .set({
          status: OrderStatus.PAID,
          paymentTime: new Date(),
          payType: 1, // 支付宝
        })
        .where('order_sn = :orderSn AND status = :status', {
          orderSn: outTradeNo,
          status: OrderStatus.PENDING_PAYMENT,
        })
        .execute();

      if (result.affected === 0) {
        this.logger.warn(`支付回调: 订单已处理或不存在 orderSn=${outTradeNo}`);
        return;
      }

      this.logger.log(`订单支付成功: orderSn=${outTradeNo}`);
    }
  }
}
