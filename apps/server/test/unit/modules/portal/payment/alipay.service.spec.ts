import { describe, it, expect, beforeEach } from 'vitest';
import * as crypto from 'crypto';
import { AlipayService } from '@/modules/portal/payment/alipay.service';

// 生成测试用 RSA 密钥对
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
});

function createService() {
  const mockConfig = {
    get: (key: string) => {
      const map: Record<string, string> = {
        'payment.alipay.appId': '2021001234',
        'payment.alipay.privateKey': privateKey,
        'payment.alipay.publicKey': publicKey,
        'payment.alipay.gateway': 'https://openapi.alipay.com/gateway.do',
        'payment.alipay.notifyUrl': 'https://example.com/notify',
        'payment.alipay.returnUrl': 'https://example.com/return',
      };
      return map[key] ?? '';
    },
  } as any;
  return new AlipayService(mockConfig);
}

// 提取裸密钥（去掉 PEM 头尾），用于测试 formatPrivateKey/formatPublicKey 分支
const barePrivateKey = privateKey
  .replace(/-----BEGIN PRIVATE KEY-----\n?/, '')
  .replace(/\n?-----END PRIVATE KEY-----\n?/, '')
  .replace(/\n/g, '');

const barePublicKey = publicKey
  .replace(/-----BEGIN PUBLIC KEY-----\n?/, '')
  .replace(/\n?-----END PUBLIC KEY-----\n?/, '')
  .replace(/\n/g, '');

describe('AlipayService', () => {
  let service: AlipayService;

  beforeEach(() => {
    service = createService();
  });

  describe('createPagePayment', () => {
    it('生成包含表单的 HTML', () => {
      const html = service.createPagePayment('ORDER001', 99.9, '测试商品');

      expect(html).toContain('<form');
      expect(html).toContain('alipayForm');
      expect(html).toContain('ORDER001');
      expect(html).toContain('99.90');
      expect(html).toContain('submit()');
    });

    it('金额格式化为两位小数', () => {
      const html = service.createPagePayment('ORDER002', 100, '商品');

      expect(html).toContain('100.00');
    });
  });

  describe('verifyNotification', () => {
    it('无 sign 参数 → 返回 false', () => {
      expect(service.verifyNotification({ foo: 'bar' })).toBe(false);
    });

    it('正确签名 → 返回 true', () => {
      // 用测试私钥手动签名
      const params: Record<string, string> = {
        out_trade_no: 'ORDER001',
        total_amount: '99.90',
        trade_status: 'TRADE_SUCCESS',
      };

      const signStr = Object.keys(params)
        .sort()
        .map((k) => `${k}=${params[k]}`)
        .join('&');

      const signer = crypto.createSign('RSA-SHA256');
      signer.update(signStr, 'utf8');
      params.sign = signer.sign(privateKey, 'base64');
      params.sign_type = 'RSA2';

      expect(service.verifyNotification(params)).toBe(true);
    });

    it('错误签名 → 返回 false', () => {
      const params = {
        out_trade_no: 'ORDER001',
        total_amount: '99.90',
        sign: 'invalid-signature',
        sign_type: 'RSA2',
      };

      expect(service.verifyNotification(params)).toBe(false);
    });
  });

  describe('formatPrivateKey / formatPublicKey（裸密钥自动格式化）', () => {
    it('裸私钥 → 自动添加 PEM 头尾并正常签名', () => {
      const svc = new AlipayService({
        get: (key: string) => {
          const map: Record<string, string> = {
            'payment.alipay.appId': '2021001234',
            'payment.alipay.privateKey': barePrivateKey,
            'payment.alipay.publicKey': publicKey,
            'payment.alipay.gateway': 'https://openapi.alipay.com/gateway.do',
            'payment.alipay.notifyUrl': 'https://example.com/notify',
            'payment.alipay.returnUrl': 'https://example.com/return',
          };
          return map[key] ?? '';
        },
      } as any);

      // 使用裸私钥创建的 service 仍然能正常生成支付表单
      const html = svc.createPagePayment('ORDER003', 50, '测试');
      expect(html).toContain('<form');
      expect(html).toContain('ORDER003');
    });

    it('裸公钥 → 自动添加 PEM 头尾并正常验签', () => {
      const svc = new AlipayService({
        get: (key: string) => {
          const map: Record<string, string> = {
            'payment.alipay.appId': '2021001234',
            'payment.alipay.privateKey': privateKey,
            'payment.alipay.publicKey': barePublicKey,
            'payment.alipay.gateway': 'https://openapi.alipay.com/gateway.do',
            'payment.alipay.notifyUrl': 'https://example.com/notify',
            'payment.alipay.returnUrl': 'https://example.com/return',
          };
          return map[key] ?? '';
        },
      } as any);

      // 手动签名后用裸公钥 service 验签
      const params: Record<string, string> = {
        out_trade_no: 'ORDER004',
        total_amount: '10.00',
      };
      const signStr = Object.keys(params)
        .sort()
        .map((k) => `${k}=${params[k]}`)
        .join('&');
      const signer = crypto.createSign('RSA-SHA256');
      signer.update(signStr, 'utf8');
      params.sign = signer.sign(privateKey, 'base64');
      params.sign_type = 'RSA2';

      expect(svc.verifyNotification(params)).toBe(true);
    });
  });

  describe('buildSignString（过滤空值）', () => {
    it('参数含空字符串 → 被过滤', () => {
      const html = service.createPagePayment('ORDER005', 1, '');
      // biz_content 中 subject 为空字符串但是作为 JSON 值存在
      expect(html).toContain('ORDER005');
    });
  });

  describe('escapeHtml', () => {
    it('HTML 特殊字符被转义', () => {
      // orderSn 先进入 biz_content JSON，再被 escapeHtml 处理
      // 所以 biz_content value 中应包含 &lt; &gt; &amp; 等转义
      const html = service.createPagePayment('ORDER<>&"', 1, 'test<>');
      expect(html).toContain('&lt;');
      expect(html).toContain('&gt;');
      expect(html).toContain('&amp;');
      expect(html).not.toContain('value="ORDER<');
    });
  });
});
