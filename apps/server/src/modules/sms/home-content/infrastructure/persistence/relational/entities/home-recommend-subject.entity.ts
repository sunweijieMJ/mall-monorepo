import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';

@Entity('sms_home_recommend_subject')
export class HomeRecommendSubjectEntity extends BaseEntity {
  @ApiProperty({ description: '专题ID', type: 'integer' })
  @Column({ name: 'subject_id' })
  subjectId: number;

  @ApiProperty({ description: '专题名称' })
  @Column({ name: 'subject_name', length: 64, default: '' })
  subjectName: string;

  @ApiProperty({ type: 'integer', description: '推荐状态' })
  @Column({ name: 'recommend_status', default: 0 })
  recommendStatus: number;

  @ApiProperty({ type: 'integer', description: '排序' })
  @Column({ default: 0 })
  sort: number;
}
