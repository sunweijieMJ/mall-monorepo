import { BaseEntity } from './common';

/**
 * 用户信息接口，包含用户的基本信息和账户数据
 */
export interface UserInfo extends BaseEntity {
  /** 用户名 */
  username: string;
  /** 用户昵称 */
  nickname?: string;
  /** 用户头像URL */
  avatar?: string;
  /** 用户图标（头像的别名） */
  icon?: string;
  /** 手机号码 */
  phone?: string;
  /** 邮箱地址 */
  email?: string;
  /** 积分值 */
  integration?: number;
  /** 成长值 */
  growth?: number;
}
