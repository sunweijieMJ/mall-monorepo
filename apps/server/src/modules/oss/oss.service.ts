import * as crypto from 'crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from '@/config/config.type';

/** OSS 直传策略响应结构 */
export interface OssPolicyResponse {
  accessKeyId: string;
  policy: string;
  signature: string;
  dir: string;
  host: string;
  expire: string;
}

@Injectable()
export class OssService {
  constructor(private readonly configService: ConfigService<AllConfigType>) {}

  /**
   * 生成阿里云 OSS 直传签名 Policy
   * 前端拿到 policy/signature 后，可直接上传文件至 OSS，不经过服务端
   * 超时时间为 300 秒
   */
  async getPolicy(): Promise<OssPolicyResponse> {
    const ossConfig = this.configService.get('app.aliyun.oss', { infer: true });

    const { endpoint, bucketName, accessKeyId, accessKeySecret, dir } =
      ossConfig as {
        endpoint: string;
        bucketName: string;
        accessKeyId: string;
        accessKeySecret: string;
        dir: string;
      };

    // 计算过期时间（当前时间 + 300 秒）
    const expireTime = Math.floor(Date.now() / 1000) + 300;
    const expiration = new Date(expireTime * 1000)
      .toISOString()
      .replace(/\.\d{3}Z$/, 'Z');

    // 构造 policy 对象
    const policyObj = {
      expiration,
      conditions: [
        // 限制文件大小：0 ~ 50MB
        ['content-length-range', 0, 52428800],
        // 限制上传目录前缀，防止覆盖系统文件
        ['starts-with', '$key', dir],
        // 限制 Content-Type 为常见安全类型
        ['starts-with', '$Content-Type', 'image/'],
      ],
    };

    // Base64 编码 policy
    const policyStr = Buffer.from(JSON.stringify(policyObj)).toString('base64');

    // HMAC-SHA1 签名
    const signature = crypto
      .createHmac('sha1', accessKeySecret)
      .update(policyStr)
      .digest('base64');

    return {
      accessKeyId,
      policy: policyStr,
      signature,
      dir,
      host: `https://${bucketName}.${endpoint}`,
      expire: String(expireTime),
    };
  }
}
