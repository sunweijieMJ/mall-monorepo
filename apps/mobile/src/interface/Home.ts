/**
 * 首页广告项接口
 */
export interface HomeAdvertise {
  /** 广告ID */
  id: number;
  /** 广告名称 */
  name: string;
  /** 广告图片 */
  pic: string;
  /** 开始时间 */
  startTime: string;
  /** 结束时间 */
  endTime: string;
  /** 状态 0-未发布 1-已发布 */
  status: number;
  /** 点击次数 */
  clickCount: number;
  /** 订单数量 */
  orderCount: number;
  /** 链接地址 */
  url: string;
  /** 备注 */
  note: string;
  /** 排序 */
  sort: number;
}

/**
 * 首页品牌项接口
 */
export interface HomeBrand {
  /** 品牌ID */
  id: number;
  /** 品牌名称 */
  name: string;
  /** 品牌logo */
  logo: string;
  /** 品牌大图 */
  bigPic: string;
  /** 排序 */
  sort: number;
}
