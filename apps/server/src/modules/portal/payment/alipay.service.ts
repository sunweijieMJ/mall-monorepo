import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { AllConfigType } from '@/config/config.type';

@Injectable()
export class AlipayService {
  private readonly logger = new Logger(AlipayService.name);
  private readonly appId: string;
  private readonly privateKey: string;
  private readonly alipayPublicKey: string;
  private readonly gateway: string;
  private readonly notifyUrl: string;
  private readonly returnUrl: string;

  constructor(private readonly configService: ConfigService<AllConfigType>) {
    this.appId =
      this.configService.get('payment.alipay.appId', { infer: true }) ?? '';
    this.privateKey =
      this.configService.get('payment.alipay.privateKey', { infer: true }) ??
      '';
    this.alipayPublicKey =
      this.configService.get('payment.alipay.publicKey', { infer: true }) ?? '';
    this.gateway =
      this.configService.get('payment.alipay.gateway', { infer: true }) ?? '';
    this.notifyUrl =
      this.configService.get('payment.alipay.notifyUrl', { infer: true }) ?? '';
    this.returnUrl =
      this.configService.get('payment.alipay.returnUrl', { infer: true }) ?? '';
  }

  /**
   * 创建支付宝电脑网站支付请求（alipay.trade.page.pay）
   * @returns 自动提交的 HTML 表单
   */
  createPagePayment(
    orderSn: string,
    totalAmount: number,
    subject: string,
  ): string {
    const bizContent = JSON.stringify({
      out_trade_no: orderSn,
      total_amount: totalAmount.toFixed(2),
      subject,
      product_code: 'FAST_INSTANT_TRADE_PAY',
    });

    const params: Record<string, string> = {
      app_id: this.appId,
      method: 'alipay.trade.page.pay',
      charset: 'utf-8',
      sign_type: 'RSA2',
      timestamp: this.formatDate(new Date()),
      version: '1.0',
      notify_url: this.notifyUrl,
      return_url: this.returnUrl,
      biz_content: bizContent,
    };

    // Sign
    const signStr = this.buildSignString(params);
    params.sign = this.rsaSign(signStr);

    // Build auto-submit form
    const formInputs = Object.entries(params)
      .map(
        ([k, v]) =>
          `<input type="hidden" name="${k}" value="${this.escapeHtml(v)}" />`,
      )
      .join('\n');

    return `
      <html><body>
        <form id="alipayForm" action="${this.gateway}" method="POST">
          ${formInputs}
        </form>
        <script>document.getElementById('alipayForm').submit();</script>
      </body></html>
    `;
  }

  /**
   * 验证支付宝异步通知签名
   */
  verifyNotification(params: Record<string, string>): boolean {
    const sign = params.sign;

    if (!sign) return false;

    // Remove sign and sign_type from params for verification
    const filtered = { ...params };
    delete filtered.sign;
    delete filtered.sign_type;

    const signStr = this.buildSignString(filtered);
    return this.rsaVerify(signStr, sign);
  }

  private buildSignString(params: Record<string, string>): string {
    return Object.keys(params)
      .filter((k) => params[k] !== '' && params[k] !== undefined)
      .sort()
      .map((k) => `${k}=${params[k]}`)
      .join('&');
  }

  private rsaSign(content: string): string {
    const key = this.formatPrivateKey(this.privateKey);
    const signer = crypto.createSign('RSA-SHA256');
    signer.update(content, 'utf8');
    return signer.sign(key, 'base64');
  }

  private rsaVerify(content: string, sign: string): boolean {
    const key = this.formatPublicKey(this.alipayPublicKey);
    const verifier = crypto.createVerify('RSA-SHA256');
    verifier.update(content, 'utf8');
    return verifier.verify(key, sign, 'base64');
  }

  private formatPrivateKey(key: string): string {
    if (key.includes('BEGIN')) return key;
    const formatted = key.match(/.{1,64}/g)?.join('\n') ?? key;
    return `-----BEGIN PRIVATE KEY-----\n${formatted}\n-----END PRIVATE KEY-----`;
  }

  private formatPublicKey(key: string): string {
    if (key.includes('BEGIN')) return key;
    const formatted = key.match(/.{1,64}/g)?.join('\n') ?? key;
    return `-----BEGIN PUBLIC KEY-----\n${formatted}\n-----END PUBLIC KEY-----`;
  }

  private formatDate(date: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  }

  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}
