import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('cms_prefrence_area')
export class PreferenceAreaEntity {
  @ApiProperty({ description: '主键ID', type: 'integer' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiPropertyOptional({ description: '名称' })
  @Column({ length: 255, nullable: true })
  name: string;

  @ApiPropertyOptional({ description: '副标题' })
  @Column({ name: 'sub_title', length: 255, nullable: true })
  subTitle: string;

  @ApiProperty({ type: 'integer', description: '排序' })
  @Column({ default: 0 })
  sort: number;

  @ApiProperty({ type: 'integer', description: '显示状态' })
  @Column({ name: 'show_status', default: 0 })
  showStatus: number;

  @ApiPropertyOptional({ description: '展示图片' })
  @Column({ length: 500, nullable: true, comment: '展示图片' })
  pic: string;
}
