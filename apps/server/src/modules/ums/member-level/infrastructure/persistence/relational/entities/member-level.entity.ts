import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('ums_member_level')
export class MemberLevelEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, nullable: true })
  name: string;

  @Column({ name: 'growth_point', default: 0 })
  growthPoint: number;

  @Column({
    name: 'default_status',
    default: 0,
    comment: '是否为默认等级：0->不是；1->是',
  })
  defaultStatus: number;

  @Column({
    name: 'free_freight_point',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    comment: '免运费标准',
  })
  freeFreightPoint: string;

  @Column({
    name: 'comment_growth_point',
    default: 0,
    comment: '每次评价获取的成长值',
  })
  commentGrowthPoint: number;

  @Column({
    name: 'priviledge_free_freight',
    default: 0,
    comment: '是否有免邮特权',
  })
  priviledgeFreeFreight: number;

  @Column({ name: 'priviledge_sign_in', default: 0, comment: '是否有签到特权' })
  priviledgeSignIn: number;

  @Column({
    name: 'priviledge_comment',
    default: 0,
    comment: '是否有评论获奖励特权',
  })
  priviledgeComment: number;

  @Column({
    name: 'priviledge_promotion',
    default: 0,
    comment: '是否有专享活动特权',
  })
  priviledgePromotion: number;

  @Column({
    name: 'priviledge_member_price',
    default: 0,
    comment: '是否有会员价格特权',
  })
  priviledgeMemberPrice: number;

  @Column({
    name: 'priviledge_birthday',
    default: 0,
    comment: '是否有生日特权',
  })
  priviledgeBirthday: number;

  @Column({ type: 'text', nullable: true })
  note: string;
}
