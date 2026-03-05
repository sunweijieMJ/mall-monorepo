import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('pms_brand')
export class BrandEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 64 })
  name: string;

  @Column({ name: 'first_letter', length: 8, default: '' })
  firstLetter: string;

  @Column({ default: 0 })
  sort: number;

  @Column({
    name: 'factory_status',
    default: 0,
    comment: '是否为品牌制造商：0-否 1-是',
  })
  factoryStatus: number;

  @Column({ name: 'show_status', default: 1 })
  showStatus: number;

  @Column({ name: 'product_count', default: 0 })
  productCount: number;

  @Column({ name: 'product_comment_count', default: 0 })
  productCommentCount: number;

  @Column({ default: '' })
  logo: string;

  @Column({ name: 'big_pic', default: '' })
  bigPic: string;

  @Column({ name: 'brand_story', type: 'text', nullable: true })
  brandStory: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
