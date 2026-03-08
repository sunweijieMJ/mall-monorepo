import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('cms_subject')
export class SubjectEntity {
  @ApiProperty({ description: '主键ID', type: 'integer' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiPropertyOptional({ description: '分类ID', type: 'integer' })
  @Column({ name: 'category_id', nullable: true })
  categoryId: number;

  @ApiPropertyOptional({ description: '标题' })
  @Column({ length: 200, nullable: true })
  title: string;

  @ApiPropertyOptional({ description: '专题主图' })
  @Column({ length: 500, nullable: true, comment: '专题主图' })
  pic: string;

  @ApiProperty({ type: 'integer', description: '关联产品数量' })
  @Column({ name: 'product_count', default: 0, comment: '关联产品数量' })
  productCount: number;

  @ApiProperty({ type: 'integer', description: '推荐状态' })
  @Column({ name: 'recommend_status', default: 0 })
  recommendStatus: number;

  @ApiPropertyOptional({ description: '创建时间' })
  @Column({ name: 'create_time', type: 'timestamp', nullable: true })
  createdAt: Date;

  @ApiProperty({ type: 'integer', description: '收藏数' })
  @Column({ name: 'collect_count', default: 0 })
  collectCount: number;

  @ApiProperty({ type: 'integer', description: '阅读数' })
  @Column({ name: 'read_count', default: 0 })
  readCount: number;

  @ApiProperty({ type: 'integer', description: '评论数' })
  @Column({ name: 'comment_count', default: 0 })
  commentCount: number;

  @ApiPropertyOptional({ description: '画册图片用逗号分割' })
  @Column({
    name: 'album_pics',
    type: 'text',
    nullable: true,
    comment: '画册图片用逗号分割',
  })
  albumPics: string;

  @ApiPropertyOptional({ description: '描述' })
  @Column({ length: 1000, nullable: true })
  description: string;

  @ApiProperty({
    description: '显示状态：0->不显示；1->显示',
    type: 'integer',
    enum: [0, 1],
  })
  @Column({
    name: 'show_status',
    default: 0,
    comment: '显示状态：0->不显示；1->显示',
  })
  showStatus: number;

  @ApiProperty({ type: 'integer', description: '转发数' })
  @Column({ name: 'forward_count', default: 0, comment: '转发数' })
  forwardCount: number;

  @ApiPropertyOptional({ description: '专题分类名称' })
  @Column({
    name: 'category_name',
    length: 200,
    nullable: true,
    comment: '专题分类名称',
  })
  categoryName: string;

  @ApiPropertyOptional({ description: '内容' })
  @Column({ type: 'text', nullable: true })
  content: string;
}
