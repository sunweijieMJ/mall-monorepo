import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('ums_member_brand_attention')
export class MemberBrandAttentionNewEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ name: 'member_id' })
  memberId: number;

  @Column({ name: 'member_nickname', length: 255, nullable: true })
  memberNickname: string;

  @Column({ name: 'member_icon', length: 500, nullable: true })
  memberIcon: string;

  @Column({ name: 'brand_id' })
  brandId: number;

  @Column({ name: 'brand_name', length: 255, nullable: true })
  brandName: string;

  @Column({ name: 'brand_logo', type: 'text', nullable: true })
  brandLogo: string;

  @Column({ name: 'create_time', type: 'timestamp', nullable: true })
  createTime: Date;
}
