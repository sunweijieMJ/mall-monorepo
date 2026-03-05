/**
 * Mall 对象存储(OSS) API
 * 从 mall-admin-web 迁移并转换为 TypeScript
 */

import http from '@/api';

const BASE_URL = '/aliyun/oss';

/**
 * OSS上传策略
 */
export interface OSSPolicy {
  accessKeyId: string;
  policy: string;
  signature: string;
  dir: string;
  host: string;
  expire: string;
}

/**
 * 获取OSS上传策略
 */
export function policy() {
  return http.get<OSSPolicy>(`${BASE_URL}/policy`);
}

export default {
  policy,
};
