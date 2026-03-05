import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('cms_prefrence_area')
export class PrefrenceAreaEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255, nullable: true })
  name: string;

  @Column({ name: 'sub_title', length: 255, nullable: true })
  subTitle: string;

  @Column({ default: 0 })
  sort: number;

  @Column({ name: 'show_status', default: 0 })
  showStatus: number;

  @Column({ type: 'bytea', nullable: true, comment: '展示图片' })
  pic: Buffer;
}
