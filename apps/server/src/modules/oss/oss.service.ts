import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from '@/config/config.type';

@Injectable()
export class OssService {
  constructor(private readonly configService: ConfigService<AllConfigType>) {}

  /**
   * 获取阿里云 OSS 上传策略
   * TODO: 迁移自 OssController.policy()（原 Java 版本在 Controller 中直接实现）
   *   - 使用 aliyun-oss-sdk 生成 Policy：
   *     1. 读取配置：endpoint、bucketName、accessKeyId、accessKeySecret、dir（上传目录）
   *     2. 生成 policy JSON（包含过期时间、conditions）
   *     3. 用 accessKeySecret 对 policy Base64 编码后进行 HMAC-SHA1 签名
   *     4. 返回 { accessKeyId, policy, signature, dir, host, expire }
   */
  async getPolicy(): Promise<Record<string, string>> {
    // TODO: implement
    return {
      accessKeyId: '',
      policy: '',
      signature: '',
      dir: '',
      host: '',
      expire: '',
    };
  }
}
