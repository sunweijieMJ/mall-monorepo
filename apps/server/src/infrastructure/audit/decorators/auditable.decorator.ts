import { SetMetadata } from '@nestjs/common';

export const AUDIT_METADATA_KEY = 'audit:action';

export interface AuditOptions {
  action: string;
  entityType?: string;
}

/**
 * 标记需要审计的操作
 * @example @Auditable({ action: '创建商品', entityType: 'Product' })
 */
export const Auditable = (options: AuditOptions) =>
  SetMetadata(AUDIT_METADATA_KEY, options);
