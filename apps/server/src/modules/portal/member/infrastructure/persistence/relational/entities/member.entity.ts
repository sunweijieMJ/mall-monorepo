import {
  ApiHideProperty,
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';

/** C端会员表 */
@Entity('ums_member')
export class MemberEntity extends BaseEntity {
  @ApiPropertyOptional({ description: '会员等级ID', type: 'integer' })
  @Column({ name: 'member_level_id', nullable: true })
  memberLevelId: number;

  @ApiPropertyOptional({ description: '用户名' })
  @Index()
  @Column({ length: 64, nullable: true, comment: '用户名' })
  username: string;

  @ApiHideProperty()
  @Column({ length: 64, nullable: true, comment: '密码', select: false })
  password: string;

  @ApiPropertyOptional({ description: '昵称' })
  @Column({ length: 64, nullable: true, comment: '昵称' })
  nickname: string;

  @ApiPropertyOptional({ description: '手机号码' })
  @Index()
  @Column({ length: 64, nullable: true, comment: '手机号码' })
  phone: string;

  @ApiProperty({
    description: '帐号启用状态：0->禁用；1->启用',
    type: 'integer',
    enum: [0, 1],
  })
  @Column({ default: 1, comment: '帐号启用状态：0->禁用；1->启用' })
  status: number;

  @ApiPropertyOptional({ description: '头像' })
  @Column({ length: 500, nullable: true, comment: '头像' })
  icon: string;

  @ApiPropertyOptional({
    description: '性别：0->未知；1->男；2->女',
    type: 'integer',
    enum: [0, 1, 2],
  })
  @Column({ nullable: true, comment: '性别：0->未知；1->男；2->女' })
  gender: number;

  @ApiPropertyOptional({ description: '生日', format: 'date' })
  @Column({ type: 'date', nullable: true, comment: '生日' })
  birthday: Date;

  @ApiPropertyOptional({ description: '所在城市' })
  @Column({ length: 100, nullable: true, comment: '所在城市' })
  city: string;

  @ApiPropertyOptional({ description: '职业' })
  @Column({ length: 200, nullable: true, comment: '职业' })
  job: string;

  @ApiPropertyOptional({ description: '个性签名' })
  @Column({
    name: 'personal_sign',
    length: 200,
    nullable: true,
    comment: '个性签名',
  })
  personalSign: string;

  @ApiPropertyOptional({ type: 'integer', description: '用户来源' })
  @Column({ name: 'source_type', nullable: true, comment: '用户来源' })
  sourceType: number;

  @ApiProperty({ type: 'integer', description: '积分' })
  @Column({ default: 0, comment: '积分' })
  integration: number;

  @ApiProperty({ type: 'integer', description: '成长值' })
  @Column({ default: 0, comment: '成长值' })
  growth: number;

  @ApiProperty({ type: 'integer', description: '剩余抽奖次数' })
  @Column({ name: 'lucky_count', default: 0, comment: '剩余抽奖次数' })
  luckyCount: number;

  @ApiProperty({ type: 'integer', description: '历史积分数量' })
  @Column({ name: 'history_integration', default: 0, comment: '历史积分数量' })
  historyIntegration: number;

  @ApiPropertyOptional({ description: '最后登录时间', format: 'date-time' })
  @Column({
    name: 'login_time',
    type: 'timestamp',
    nullable: true,
    comment: '最后登录时间',
  })
  loginTime: Date;
}

/** 会员收货地址表 */
@Entity('ums_member_receive_address')
export class MemberAddressEntity extends BaseEntity {
  @ApiProperty({ description: '会员ID', type: 'integer' })
  @Index()
  @Column({ name: 'member_id' })
  memberId: number;

  @ApiPropertyOptional({ description: '收货人名称' })
  @Column({ length: 100, nullable: true, comment: '收货人名称' })
  name: string;

  @ApiPropertyOptional({ description: '手机号码' })
  @Column({ length: 64, nullable: true, comment: '手机号码' })
  phoneNumber: string;

  @ApiProperty({
    description: '是否为默认：0->否；1->是',
    type: 'integer',
    enum: [0, 1],
  })
  @Column({
    name: 'default_status',
    default: 0,
    comment: '是否为默认：0->否；1->是',
  })
  defaultStatus: number;

  @ApiPropertyOptional({ description: '邮政编码' })
  @Column({
    name: 'post_code',
    length: 100,
    nullable: true,
    comment: '邮政编码',
  })
  postCode: string;

  @ApiPropertyOptional({ description: '省份/直辖市' })
  @Column({ length: 100, nullable: true, comment: '省份/直辖市' })
  province: string;

  @ApiPropertyOptional({ description: '城市' })
  @Column({ length: 100, nullable: true, comment: '城市' })
  city: string;

  @ApiPropertyOptional({ description: '区' })
  @Column({ length: 100, nullable: true, comment: '区' })
  region: string;

  @ApiPropertyOptional({ description: '详细地址(街道)' })
  @Column({
    name: 'detail_address',
    length: 500,
    nullable: true,
    comment: '详细地址(街道)',
  })
  detailAddress: string;
}
