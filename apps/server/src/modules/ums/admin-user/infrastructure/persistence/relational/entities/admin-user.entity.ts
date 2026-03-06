import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('ums_admin')
export class AdminUserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 64, unique: true })
  username: string;

  @Column({ length: 64, select: false })
  password: string;

  @Column({ name: 'icon', length: 500, nullable: true, comment: '头像' })
  icon: string;

  @Column({ length: 100, nullable: true })
  email: string;

  @Column({ name: 'nick_name', length: 200, nullable: true })
  nickName: string;

  @Column({ type: 'text', nullable: true })
  note: string;

  @Column({ name: 'login_time', type: 'timestamp', nullable: true })
  loginTime: Date;

  @Column({ default: 1, comment: '帐号启用状态：0->禁用；1->启用' })
  status: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
