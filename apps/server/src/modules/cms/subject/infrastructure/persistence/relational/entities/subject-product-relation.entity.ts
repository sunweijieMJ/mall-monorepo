import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('cms_subject_product_relation')
export class SubjectProductRelationEntity {
  @ApiProperty({ description: '主键ID', type: 'integer' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiPropertyOptional({ description: '专题ID', type: 'integer' })
  @Column({ name: 'subject_id', nullable: true })
  subjectId: number;

  @ApiPropertyOptional({ description: '商品ID', type: 'integer' })
  @Column({ name: 'product_id', nullable: true })
  productId: number;
}
