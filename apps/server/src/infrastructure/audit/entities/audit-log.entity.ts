import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('sys_audit_log')
export class AuditLogEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ comment: '操作用户 ID' })
  userId: number;

  @Column({ length: 50, comment: '用户类型: admin | member' })
  userType: string;

  @Column({ length: 100, comment: '用户名' })
  username: string;

  @Column({ length: 200, comment: '操作描述' })
  action: string;

  @Column({ length: 100, nullable: true, comment: '操作的实体类型' })
  entityType: string;

  @Column({ nullable: true, comment: '操作的实体 ID' })
  entityId: number;

  @Column({ length: 10, comment: 'HTTP 方法' })
  method: string;

  @Column({ length: 500, comment: '请求路径' })
  path: string;

  @Column({ type: 'text', nullable: true, comment: '请求体（脱敏后）' })
  requestBody: string;

  @Column({ length: 50, nullable: true, comment: '客户端 IP' })
  ip: string;

  @Column({ length: 500, nullable: true, comment: 'User-Agent' })
  userAgent: string;

  @Column({ default: 200, comment: 'HTTP 响应状态码' })
  statusCode: number;

  @Column({ nullable: true, comment: '执行耗时(ms)' })
  duration: number;

  @Index()
  @CreateDateColumn({ comment: '操作时间' })
  createdAt: Date;
}
