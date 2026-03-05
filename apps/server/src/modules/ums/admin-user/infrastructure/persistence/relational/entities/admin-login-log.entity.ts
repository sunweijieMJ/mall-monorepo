import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('ums_admin_login_log')
export class AdminLoginLogEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'admin_id', nullable: true })
  adminId: number;

  @Column({ name: 'create_time', type: 'timestamp', nullable: true })
  createTime: Date;

  @Column({ length: 64, nullable: true })
  ip: string;

  @Column({ length: 100, nullable: true })
  address: string;

  @Column({
    name: 'user_agent',
    length: 500,
    nullable: true,
    comment: '浏览器登录类型',
  })
  userAgent: string;
}
