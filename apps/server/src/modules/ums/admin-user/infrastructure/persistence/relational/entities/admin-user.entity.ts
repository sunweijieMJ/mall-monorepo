import {
  ApiHideProperty,
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import { Column, Entity } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';

@Entity('ums_admin')
export class AdminUserEntity extends BaseEntity {
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

  @ApiPropertyOptional({ description: '最后登录时间', format: 'date-time' })
  @Column({ name: 'login_time', type: 'timestamp', nullable: true })
  loginTime: Date;

  @ApiProperty({
    description: '帐号启用状态：0->禁用；1->启用',
    type: 'integer',
    enum: [0, 1],
  })
  @Column({ default: 1, comment: '帐号启用状态：0->禁用；1->启用' })
  status: number;
}
