import {
  Controller,
  Post,
  Body,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Public } from '@/core/auth/decorators/public.decorator';
import { SkipResponseTransform } from '@/common/decorators/skip-response-transform.decorator';

@ApiTags('移动端-支付')
@Controller({ path: 'portal/payment', version: '1' })
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);

  constructor(private readonly paymentService: PaymentService) {}

  @Post('alipay/pay')
  @ApiBearerAuth('portal-jwt')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '创建支付宝支付' })
  createAlipayPayment(@Body() dto: CreatePaymentDto, @Req() req: any) {
    return this.paymentService.createAlipayPayment(dto.orderId, req.user.sub);
  }

  @Public()
  @Post('alipay/notify')
  @HttpCode(HttpStatus.OK)
  @SkipResponseTransform()
  @ApiOperation({ summary: '支付宝异步通知回调' })
  async alipayNotify(@Req() req: Request, @Res() res: Response) {
    const params = req.body as Record<string, string>;
    try {
      await this.paymentService.handleAlipayNotify(params);
      res.send('success');
    } catch (err) {
      this.logger.error('支付宝回调处理失败', err);
      res.send('failure');
    }
  }
}
