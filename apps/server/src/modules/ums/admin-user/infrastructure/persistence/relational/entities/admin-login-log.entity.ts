import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('ums_admin_login_log')
export class AdminLoginLogEntity {
  @ApiProperty({ description: '主键ID', type: 'integer' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiPropertyOptional({ description: '管理员ID', type: 'integer' })
  @Column({ name: 'admin_id', nullable: true })
  adminId: number;

  @ApiPropertyOptional({ description: '创建时间', format: 'date-time' })
  @Column({ name: 'create_time', type: 'timestamp', nullable: true })
  createdAt: Date;

  @ApiPropertyOptional({ description: 'IP地址' })
  @Column({ length: 64, nullable: true })
  ip: string;

  @ApiPropertyOptional({ description: '登录地址' })
  @Column({ length: 100, nullable: true })
  address: string;

  @ApiPropertyOptional({ description: '浏览器登录类型' })
  @Column({
    name: 'user_agent',
    length: 500,
    nullable: true,
    comment: '浏览器登录类型',
  })
  userAgent: string;
}
