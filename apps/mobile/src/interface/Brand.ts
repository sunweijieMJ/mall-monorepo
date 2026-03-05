import { BaseEntity } from './Common';

/**
 * 品牌信息接口
 */
export interface Brand extends BaseEntity {
  /** 品牌名称 */
  name: string;
  /** 品牌名称首字母 */
  firstLetter?: string;
  /** 排序序号 */
  sort?: number;
  /** 制造商状态 0-禁用 1-启用 */
  factoryStatus?: number;
  /** 显示状态 0-不显示 1-显示 */
  showStatus?: number;
  /** 商品数量 */
  productCount?: number;
  /** 商品评价数量 */
  productCommentCount?: number;
  /** 品牌logo */
  logo?: string;
  /** 品牌大图 */
  bigPic?: string;
  /** 品牌故事 */
  brandStory?: string;
}
