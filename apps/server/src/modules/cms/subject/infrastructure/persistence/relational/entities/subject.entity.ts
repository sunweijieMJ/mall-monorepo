import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('cms_subject')
export class SubjectEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'category_id', nullable: true })
  categoryId: number;

  @Column({ length: 200, nullable: true })
  title: string;

  @Column({ length: 500, nullable: true, comment: '专题主图' })
  pic: string;

  @Column({ name: 'product_count', default: 0, comment: '关联产品数量' })
  productCount: number;

  @Column({ name: 'recommend_status', default: 0 })
  recommendStatus: number;

  @Column({ name: 'create_time', type: 'timestamp', nullable: true })
  createTime: Date;

  @Column({ name: 'collect_count', default: 0 })
  collectCount: number;

  @Column({ name: 'read_count', default: 0 })
  readCount: number;

  @Column({ name: 'comment_count', default: 0 })
  commentCount: number;

  @Column({
    name: 'album_pics',
    type: 'text',
    nullable: true,
    comment: '画册图片用逗号分割',
  })
  albumPics: string;

  @Column({ length: 1000, nullable: true })
  description: string;

  @Column({
    name: 'show_status',
    default: 0,
    comment: '显示状态：0->不显示；1->显示',
  })
  showStatus: number;

  @Column({ name: 'forward_count', default: 0, comment: '转发数' })
  forwardCount: number;

  @Column({
    name: 'category_name',
    length: 200,
    nullable: true,
    comment: '专题分类名称',
  })
  categoryName: string;

  @Column({ type: 'text', nullable: true })
  content: string;
}
