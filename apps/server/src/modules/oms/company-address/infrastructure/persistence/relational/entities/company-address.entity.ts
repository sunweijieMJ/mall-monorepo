import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('oms_company_address')
export class CompanyAddressEntity {
  @ApiProperty({ description: '主键 ID', type: 'integer' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '地址名称' })
  @Column({ name: 'address_name', length: 200, comment: '地址名称' })
  addressName: string;

  @ApiProperty({
    description: '默认发货地址：0->否；1->是',
    type: 'integer',
    enum: [0, 1],
  })
  @Column({
    name: 'send_status',
    default: 0,
    comment: '默认发货地址：0->否；1->是',
  })
  sendStatus: number;

  @ApiProperty({
    description: '是否默认收货地址：0->否；1->是',
    type: 'integer',
    enum: [0, 1],
  })
  @Column({
    name: 'receive_status',
    default: 0,
    comment: '是否默认收货地址：0->否；1->是',
  })
  receiveStatus: number;

  @ApiProperty({ description: '收发货人姓名' })
  @Column({ length: 100, comment: '收发货人姓名' })
  name: string;

  @ApiProperty({ description: '收货人手机号' })
  @Column({ length: 64, comment: '收货人手机号' })
  phone: string;

  @ApiProperty({ description: '省/直辖市' })
  @Column({ length: 100, comment: '省/直辖市' })
  province: string;

  @ApiProperty({ description: '市' })
  @Column({ length: 100, comment: '市' })
  city: string;

  @ApiProperty({ description: '区' })
  @Column({ length: 100, comment: '区' })
  region: string;

  @ApiProperty({ description: '详细地址' })
  @Column({ name: 'detail_address', length: 200, comment: '详细地址' })
  detailAddress: string;
}
