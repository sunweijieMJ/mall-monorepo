import { ApiProperty } from '@nestjs/swagger';

/** OSS 直传策略 VO */
export class OssPolicyVo {
  @ApiProperty({ description: 'AccessKey ID' })
  accessKeyId: string;

  @ApiProperty({ description: 'Base64 编码的 Policy' })
  policy: string;

  @ApiProperty({ description: 'HMAC-SHA1 签名' })
  signature: string;

  @ApiProperty({ description: '上传目录前缀' })
  dir: string;

  @ApiProperty({ description: 'OSS 上传地址' })
  host: string;

  @ApiProperty({ description: '策略过期时间戳' })
  expire: string;
}
