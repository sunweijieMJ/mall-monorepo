import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('pms_brand')
export class BrandEntity {
  @ApiProperty({ description: '品牌ID', type: 'integer' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '品牌名称' })
  @Column({ length: 64 })
  name: string;

  @ApiProperty({ description: '首字母' })
  @Column({ name: 'first_letter', length: 8, default: '' })
  firstLetter: string;

  @ApiProperty({ type: 'integer', description: '排序' })
  @Column({ default: 0 })
  sort: number;

  @ApiProperty({ description: '是否为品牌制造商：0-否 1-是' })
  @Column({
    name: 'factory_status',
    default: 0,
    comment: '是否为品牌制造商：0-否 1-是',
  })
  factoryStatus: number;

  @ApiProperty({ type: 'integer', description: '显示状态' })
  @Column({ name: 'show_status', default: 1 })
  showStatus: number;

  @ApiProperty({ type: 'integer', description: '产品数量' })
  @Column({ name: 'product_count', default: 0 })
  productCount: number;

  @ApiProperty({ type: 'integer', description: '产品评论数量' })
  @Column({ name: 'product_comment_count', default: 0 })
  productCommentCount: number;

  @ApiProperty({ description: '品牌logo' })
  @Column({ default: '' })
  logo: string;

  @ApiProperty({ description: '品牌大图' })
  @Column({ name: 'big_pic', default: '' })
  bigPic: string;

  @ApiPropertyOptional({ description: '品牌故事', type: String })
  @Column({ name: 'brand_story', type: 'text', nullable: true })
  brandStory: string | null;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
