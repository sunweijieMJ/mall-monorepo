import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('oms_company_address')
export class CompanyAddressEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'address_name', length: 200, comment: '地址名称' })
  addressName: string;

  @Column({
    name: 'send_status',
    default: 0,
    comment: '默认发货地址：0->否；1->是',
  })
  sendStatus: number;

  @Column({
    name: 'receive_status',
    default: 0,
    comment: '是否默认收货地址：0->否；1->是',
  })
  receiveStatus: number;

  @Column({ length: 100, comment: '收发货人姓名' })
  name: string;

  @Column({ length: 64, comment: '收货人手机号' })
  phone: string;

  @Column({ length: 100, comment: '省/直辖市' })
  province: string;

  @Column({ length: 100, comment: '市' })
  city: string;

  @Column({ length: 100, comment: '区' })
  region: string;

  @Column({ name: 'detail_address', length: 200, comment: '详细地址' })
  detailAddress: string;
}
