import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('cms_subject_product_relation')
export class SubjectProductRelationEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'subject_id', nullable: true })
  subjectId: number;

  @Column({ name: 'product_id', nullable: true })
  productId: number;
}
