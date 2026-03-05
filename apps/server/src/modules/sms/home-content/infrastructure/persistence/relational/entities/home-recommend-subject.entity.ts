import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('sms_home_recommend_subject')
export class HomeRecommendSubjectEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'subject_id' })
  subjectId: number;

  @Column({ name: 'subject_name', length: 64, default: '' })
  subjectName: string;

  @Column({ name: 'recommend_status', default: 0 })
  recommendStatus: number;

  @Column({ default: 0 })
  sort: number;
}
