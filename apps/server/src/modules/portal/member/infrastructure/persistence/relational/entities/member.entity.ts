import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/** C端会员表 */
@Entity('ums_member')
export class MemberEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'member_level_id', nullable: true })
  memberLevelId: number;

  @Column({ length: 64, nullable: true, comment: '用户名' })
  username: string;

  @Column({ length: 64, nullable: true, comment: '密码' })
  password: string;

  @Column({ length: 64, nullable: true, comment: '昵称' })
  nickname: string;

  @Column({ length: 64, nullable: true, comment: '手机号码' })
  phone: string;

  @Column({ default: 1, comment: '帐号启用状态：0->禁用；1->启用' })
  status: number;

  @Column({ name: 'create_time', nullable: true })
  createTime: Date;

  @Column({ length: 500, nullable: true, comment: '头像' })
  icon: string;

  @Column({ nullable: true, comment: '性别：0->未知；1->男；2->女' })
  gender: number;

  @Column({ type: 'date', nullable: true, comment: '生日' })
  birthday: Date;

  @Column({ length: 100, nullable: true, comment: '所做城市' })
  city: string;

  @Column({ length: 200, nullable: true, comment: '职业' })
  job: string;

  @Column({
    name: 'personal_sign',
    length: 200,
    nullable: true,
    comment: '个性签名',
  })
  personalSign: string;

  @Column({ name: 'source_type', nullable: true, comment: '用户来源' })
  sourceType: number;

  @Column({ default: 0, comment: '积分' })
  integration: number;

  @Column({ default: 0, comment: '成长值' })
  growth: number;

  @Column({ name: 'lucky_count', default: 0, comment: '剩余抽奖次数' })
  luckyCount: number;

  @Column({ name: 'history_integration', default: 0, comment: '历史积分数量' })
  historyIntegration: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

/** 会员收货地址表 */
@Entity('ums_member_receive_address')
export class MemberAddressEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'member_id' })
  memberId: number;

  @Column({ length: 100, nullable: true, comment: '收货人名称' })
  name: string;

  @Column({ length: 64, nullable: true, comment: '手机号码' })
  phoneNumber: string;

  @Column({
    name: 'default_status',
    default: 0,
    comment: '是否为默认：0->否；1->是',
  })
  defaultStatus: number;

  @Column({
    name: 'post_code',
    length: 100,
    nullable: true,
    comment: '邮政编码',
  })
  postCode: string;

  @Column({ length: 100, nullable: true, comment: '省份/直辖市' })
  province: string;

  @Column({ length: 100, nullable: true, comment: '城市' })
  city: string;

  @Column({ length: 100, nullable: true, comment: '区' })
  region: string;

  @Column({
    name: 'detail_address',
    length: 500,
    nullable: true,
    comment: '详细地址(街道)',
  })
  detailAddress: string;
}

/** 商品收藏表 */
@Entity('ums_member_product_collection')
export class MemberProductCollectionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'member_id' })
  memberId: number;

  @Column({ name: 'product_id' })
  productId: number;

  @Column({ name: 'product_name', length: 500, nullable: true })
  productName: string;

  @Column({ name: 'product_pic', type: 'text', nullable: true })
  productPic: string;

  @Column({
    name: 'product_sub_title',
    length: 200,
    nullable: true,
    comment: '商品副标题',
  })
  productSubTitle: string;

  @Column({
    name: 'product_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  productPrice: number;

  @Column({ name: 'create_time', nullable: true })
  createTime: Date;
}

/** 品牌关注表 */
@Entity('ums_member_brand_attention')
export class MemberBrandAttentionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'member_id' })
  memberId: number;

  @Column({ name: 'brand_id' })
  brandId: number;

  @Column({ name: 'brand_name', length: 255, nullable: true })
  brandName: string;

  @Column({ name: 'brand_logo', type: 'text', nullable: true })
  brandLogo: string;

  @Column({ length: 255, nullable: true, comment: '简介' })
  brandCity: string;

  @Column({ name: 'create_time', nullable: true })
  createTime: Date;
}

/** 商品浏览记录表 */
@Entity('ums_member_product_history')
export class MemberReadHistoryEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'member_id' })
  memberId: number;

  @Column({ name: 'product_id' })
  productId: number;

  @Column({ name: 'product_name', length: 500, nullable: true })
  productName: string;

  @Column({ name: 'product_pic', type: 'text', nullable: true })
  productPic: string;

  @Column({ name: 'product_sub_title', length: 200, nullable: true })
  productSubTitle: string;

  @Column({
    name: 'product_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  productPrice: number;

  @Column({ name: 'create_time', nullable: true })
  createTime: Date;
}
