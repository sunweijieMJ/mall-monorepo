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

/**
 * 首页专题项接口
 */
export interface HomeSubject {
  /** 专题ID */
  id: number;
  /** 分类ID */
  categoryId: number;
  /** 专题标题 */
  title: string;
  /** 专题图片 */
  pic: string;
  /** 关联商品数量 */
  productCount: number;
  /** 推荐状态 */
  recommendStatus: number;
  /** 创建时间 */
  createTime: string;
  /** 收藏数量 */
  collectCount: number;
  /** 阅读数量 */
  readCount: number;
  /** 评论数量 */
  commentCount: number;
  /** 画册图片 */
  albumPics: string;
  /** 专题描述 */
  description: string;
  /** 显示状态 */
  showStatus: number;
  /** 专题内容 */
  content: string;
  /** 转发数量 */
  forwardCount: number;
  /** 分类名称 */
  categoryName: string;
}

/**
 * 首页内容接口
 */
export interface HomeContent {
  /** 广告列表 */
  advertiseList: HomeAdvertise[];
  /** 品牌列表 */
  brandList: HomeBrand[];
  /** 秒杀活动信息 */
  homeFlashPromotion: any;
  /** 专题列表 */
  subjectList: HomeSubject[];
}
