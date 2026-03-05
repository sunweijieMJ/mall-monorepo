export type PaymentConfig = {
  alipay: {
    appId: string;
    privateKey: string;
    publicKey: string;
    gateway: string;
    notifyUrl: string;
    returnUrl: string;
  };
};
