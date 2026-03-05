import { BaseEntity } from './Common';

/**
 * 商品基础信息接口，包含商品的所有基础信息和扩展属性
 */
export interface Product extends BaseEntity {
  /** 商品名称 */
  name: string;
  /** 商品副标题 */
  subTitle: string;
  /** 品牌名称 */
  brandName?: string;
  /** 商品分类名称 */
  productCategoryName?: string;
  /** 商品图片URL */
  pic: string;
  /** 商品价格 */
  price: number;
  /** 商品原价（用于显示折扣） */
  originalPrice?: number;
  /** 销量 */
  sale?: number;
  /** 库存数量 */
  stock: number;
  /** 商品单位 */
  unit?: string;
  /** 商品重量 */
  weight?: number;
  /** 商品详情标题 */
  detailTitle?: string;
  /** 商品详情描述 */
  detailDesc?: string;
  /** 商品详情HTML */
  detailHtml?: string;
  /** 商品相册图片 */
  albumPics?: string[];
  /** 关键词 */
  keywords?: string;
  /** 备注 */
  note?: string;
  /** 上架状态 0-下架 1-上架 */
  publishStatus?: number;
  /** 新品状态 0-不是新品 1-新品 */
  newStatus?: number;
  /** 推荐状态 0-不推荐 1-推荐 */
  recommandStatus?: number;
  /** 审核状态 0-未审核 1-审核通过 */
  verifyStatus?: number;
  /** 排序 */
  sort?: number;
  /** 商品属性值列表 */
  productAttributeValueList?: ProductAttributeValue[];
  /** 商品SKU列表 */
  productSkuList?: ProductSku[];
  /** 会员价格列表 */
  memberPriceList?: MemberPrice[];
  /** 阶梯价格列表 */
  productLadderList?: ProductLadder[];
  /** 商品满减列表 */
  productFullReductionList?: ProductFullReduction[];
  /** 服务ID列表 */
  serviceIds?: number[];
  /** 移动端详情HTML */
  detailMobileHtml?: string;
  // 扩展属性，用于前端显示
  /** 图片的别名 */
  image?: string;
  /** 标题的别名 */
  title?: string;
  /** 标签 */
  tag?: string;
  /** 标签类型 */
  tagType?: string;
  /** 是否收藏 */
  isFavorite?: boolean;
  /** 销量（sale的别名） */
  sales?: number;
  /** 评分 */
  rating?: number;
}

/**
 * 商品属性值接口
 */
export interface ProductAttributeValue extends BaseEntity {
  /** 商品ID */
  productId?: number;
  /** 商品属性ID */
  productAttributeId?: number;
  /** 属性值 */
  value?: string;
}

/**
 * 商品SKU接口
 * 不同规格商品的价格、库存等信息
 */
export interface ProductSku extends BaseEntity {
  /** 商品ID */
  productId?: number;
  /** SKU编码 */
  skuCode?: string;
  /** 价格 */
  price?: number;
  /** 库存 */
  stock?: number;
  /** 低库存 */
  lowStock?: number;
  /** SKU图片 */
  pic?: string;
  /** 销量 */
  sale?: number;
  /** 促销价格 */
  promotionPrice?: number;
  /** 锁定库存 */
  lockStock?: number;
  /** 商品规格数据 */
  spData?: string;
}

/**
 * 会员价格接口
 */
export interface MemberPrice extends BaseEntity {
  /** 商品ID */
  productId?: number;
  /** 会员等级ID */
  memberLevelId?: number;
  /** 会员价格 */
  memberPrice?: number;
  /** 会员等级名称 */
  memberLevelName?: string;
}

/**
 * 商品阶梯价格接口
 */
export interface ProductLadder extends BaseEntity {
  /** 商品ID */
  productId?: number;
  /** 满足数量 */
  count?: number;
  /** 折扣 */
  discount?: number;
  /** 折后价格 */
  price?: number;
}

/**
 * 商品满减接口
 */
export interface ProductFullReduction extends BaseEntity {
  /** 商品ID */
  productId?: number;
  /** 满多少金额 */
  fullPrice?: number;
  /** 减多少金额 */
  reducePrice?: number;
}

/**
 * 商品分类接口
 * 支持多级分类结构
 */
export interface ProductCategory extends BaseEntity {
  /** 父分类ID */
  parentId: number;
  /** 分类名称 */
  name: string;
  /** 分类级别 */
  level: number;
  /** 商品数量 */
  productCount?: number;
  /** 商品单位 */
  productUnit?: string;
  /** 导航显示状态 */
  navStatus?: number;
  /** 显示状态 */
  showStatus?: number;
  /** 排序 */
  sort?: number;
  /** 分类图标 */
  icon?: string;
  /** 关键词 */
  keywords?: string;
  /** 分类描述 */
  description?: string;
  /** 子分类列表 */
  children?: ProductCategory[];
}

/**
 * 商品搜索参数接口
 */
export interface SearchProductParams {
  /** 搜索关键词 */
  keyword?: string;
  /** 品牌ID */
  brandId?: number;
  /** 商品分类ID */
  productCategoryId?: number | null;
  /** 排序方式 */
  sort?: number;
  /** 页码 */
  pageNum: number;
  /** 每页大小 */
  pageSize: number;
}

/**
 * 商品详情响应接口
 */
export interface ProductDetailResponse extends Product {
  /** 品牌名称 */
  brandName: string;
  /** 商品分类名称 */
  productCategoryName: string;
  /** 商品属性值列表 */
  productAttributeValueList: Array<{
    /** 属性值ID */
    id: number;
    /** 商品属性ID */
    productAttributeId: number;
    /** 属性值 */
    value: string;
    /** 商品属性 */
    productAttribute: {
      /** 属性ID */
      id: number;
      /** 属性名称 */
      name: string;
    };
  }>;
  /** 商品SKU列表 */
  productSkuList: Array<{
    /** SKU ID */
    id: number;
    /** SKU编码 */
    skuCode: string;
    /** 价格 */
    price: number;
    /** 库存 */
    stock: number;
    /** SKU图片 */
    pic: string;
    /** SKU数据 */
    spData: string;
  }>;
  /** 商品阶梯价格列表 */
  productLadderList: Array<{
    /** 阶梯价格ID */
    id: number;
    /** 满足数量 */
    count: number;
    /** 折扣 */
    discount: number;
    /** 折后价格 */
    price: number;
  }>;
  /** 商品满减列表 */
  productFullReductionList: Array<{
    /** 满减ID */
    id: number;
    /** 满多少金额 */
    fullPrice: number;
    /** 减多少金额 */
    reducePrice: number;
  }>;
  /** 会员价格列表 */
  memberPriceList: Array<{
    /** 会员价格ID */
    id: number;
    /** 会员等级ID */
    memberLevelId: number;
    /** 会员价格 */
    memberPrice: number;
    /** 会员等级名称 */
    memberLevelName: string;
  }>;
}
