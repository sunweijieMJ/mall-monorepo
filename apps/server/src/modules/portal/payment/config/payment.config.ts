import { registerAs } from '@nestjs/config';
import { PaymentConfig } from './payment-config.type';

export default registerAs<PaymentConfig>('payment', () => ({
  alipay: {
    appId: process.env.ALIPAY_APP_ID ?? '',
    privateKey: process.env.ALIPAY_PRIVATE_KEY ?? '',
    publicKey: process.env.ALIPAY_PUBLIC_KEY ?? '',
    gateway:
      process.env.ALIPAY_GATEWAY ?? 'https://openapi.alipaydev.com/gateway.do',
    notifyUrl:
      process.env.ALIPAY_NOTIFY_URL ??
      'http://localhost:3001/api/v1/portal/payment/alipay/notify',
    returnUrl:
      process.env.ALIPAY_RETURN_URL ?? 'http://localhost:5173/pay/success',
  },
}));
