import { BaseEntity } from './Common';

/**
 * 用户收货地址接口
 */
export interface Address extends BaseEntity {
  /** 用户ID */
  memberId: number;
  /** 收货人姓名 */
  name: string;
  /** 收货人手机号 */
  phoneNumber: string;
  /** 是否为默认地址 0-否 1-是 */
  defaultStatus: number;
  /** 邮政编码 */
  postCode?: string;
  /** 省份 */
  province: string;
  /** 城市 */
  city: string;
  /** 区域 */
  region: string;
  /** 详细地址 */
  detailAddress: string;
}
