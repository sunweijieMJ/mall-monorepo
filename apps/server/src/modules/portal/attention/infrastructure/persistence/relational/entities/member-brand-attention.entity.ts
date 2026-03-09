import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('ums_member_brand_attention')
export class MemberBrandAttentionNewEntity {
  @ApiProperty({ description: '主键ID', type: 'integer' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '会员ID', type: 'integer' })
  @Index()
  @Column({ name: 'member_id' })
  memberId: number;

  @ApiPropertyOptional({ description: '会员昵称' })
  @Column({ name: 'member_nickname', length: 255, nullable: true })
  memberNickname: string;

  @ApiPropertyOptional({ description: '会员头像' })
  @Column({ name: 'member_icon', length: 500, nullable: true })
  memberIcon: string;

  @ApiProperty({ description: '品牌ID', type: 'integer' })
  @Column({ name: 'brand_id' })
  brandId: number;

  @ApiPropertyOptional({ description: '品牌名称' })
  @Column({ name: 'brand_name', length: 255, nullable: true })
  brandName: string;

  @ApiPropertyOptional({ description: '品牌Logo' })
  @Column({ name: 'brand_logo', type: 'text', nullable: true })
  brandLogo: string;

  @ApiPropertyOptional({ description: '关注时间', format: 'date-time' })
  @Column({ name: 'create_time', type: 'timestamp', nullable: true })
  createdAt: Date;
}
