import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('ums_member_level')
export class MemberLevelEntity {
  @ApiProperty({ description: '主键ID', type: 'integer' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiPropertyOptional({ description: '等级名称' })
  @Column({ length: 100, nullable: true })
  name: string;

  @ApiProperty({ type: 'integer', description: '成长值' })
  @Column({ name: 'growth_point', default: 0 })
  growthPoint: number;

  @ApiProperty({
    description: '是否为默认等级：0->不是；1->是',
    type: 'integer',
    enum: [0, 1],
  })
  @Column({
    name: 'default_status',
    default: 0,
    comment: '是否为默认等级：0->不是；1->是',
  })
  defaultStatus: number;

  @ApiPropertyOptional({ description: '免运费标准', type: 'number' })
  @Column({
    name: 'free_freight_point',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    comment: '免运费标准',
  })
  freeFreightPoint: string;

  @ApiProperty({ description: '每次评价获取的成长值' })
  @Column({
    name: 'comment_growth_point',
    default: 0,
    comment: '每次评价获取的成长值',
  })
  commentGrowthPoint: number;

  @ApiProperty({ description: '是否有免邮特权' })
  @Column({
    name: 'privilege_free_freight',
    default: 0,
    comment: '是否有免邮特权',
  })
  privilegeFreeFreight: number;

  @ApiProperty({ type: 'integer', description: '是否有签到特权' })
  @Column({ name: 'privilege_sign_in', default: 0, comment: '是否有签到特权' })
  privilegeSignIn: number;

  @ApiProperty({ description: '是否有评论获奖励特权' })
  @Column({
    name: 'privilege_comment',
    default: 0,
    comment: '是否有评论获奖励特权',
  })
  privilegeComment: number;

  @ApiProperty({ description: '是否有专享活动特权' })
  @Column({
    name: 'privilege_promotion',
    default: 0,
    comment: '是否有专享活动特权',
  })
  privilegePromotion: number;

  @ApiProperty({ description: '是否有会员价格特权' })
  @Column({
    name: 'privilege_member_price',
    default: 0,
    comment: '是否有会员价格特权',
  })
  privilegeMemberPrice: number;

  @ApiProperty({ description: '是否有生日特权' })
  @Column({
    name: 'privilege_birthday',
    default: 0,
    comment: '是否有生日特权',
  })
  privilegeBirthday: number;

  @ApiPropertyOptional({ description: '备注' })
  @Column({ type: 'text', nullable: true })
  note: string;
}
