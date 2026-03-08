import {
  ApiHideProperty,
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('ums_admin')
export class AdminUserEntity {
  @ApiProperty({ description: '主键ID', type: 'integer' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '用户名' })
  @Column({ length: 64, unique: true })
  username: string;

  @ApiHideProperty()
  @Column({ length: 64, select: false })
  password: string;

  @ApiPropertyOptional({ description: '头像' })
  @Column({ name: 'icon', length: 500, nullable: true, comment: '头像' })
  icon: string;

  @ApiPropertyOptional({ description: '邮箱' })
  @Column({ length: 100, nullable: true })
  email: string;

  @ApiPropertyOptional({ description: '昵称' })
  @Column({ name: 'nick_name', length: 200, nullable: true })
  nickName: string;

  @ApiPropertyOptional({ description: '备注' })
  @Column({ type: 'text', nullable: true })
  note: string;

  @ApiPropertyOptional({ description: '最后登录时间' })
  @Column({ name: 'login_time', type: 'timestamp', nullable: true })
  loginTime: Date;

  @ApiProperty({
    description: '帐号启用状态：0->禁用；1->启用',
    type: 'integer',
    enum: [0, 1],
  })
  @Column({ default: 1, comment: '帐号启用状态：0->禁用；1->启用' })
  status: number;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
