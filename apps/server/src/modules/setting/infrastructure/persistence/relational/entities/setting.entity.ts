import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';

@Entity('sys_setting')
export class SettingEntity extends BaseEntity {
  @ApiProperty({ description: '配置路径', example: 'theme' })
  @Index({ unique: true })
  @Column({ comment: '配置路径' })
  path: string;

  @ApiProperty({ description: '配置值（JSON）' })
  @Column({ type: 'jsonb', comment: '配置值' })
  value: Record<string, any>;
}
