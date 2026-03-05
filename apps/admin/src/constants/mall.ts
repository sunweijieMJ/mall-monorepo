/**
 * Mall 电商管理系统业务常量
 * 从 mall-admin-web 迁移
 */

// API 基础路径
export const MALL_API_BASE = '/admin';

// 发布状态
export const PUBLISH_STATUS = {
  UNPUBLISHED: 0, // 未上架
  PUBLISHED: 1, // 已上架
} as const;

// 审核状态
export const VERIFY_STATUS = {
  UNVERIFIED: 0, // 未审核
  VERIFIED: 1, // 审核通过
  FAILED: 2, // 审核失败
} as const;

// 推荐状态
export const RECOMMEND_STATUS = {
  NOT_RECOMMEND: 0, // 不推荐
  RECOMMEND: 1, // 推荐
} as const;

// 显示状态
export const SHOW_STATUS = {
  HIDE: 0, // 隐藏
  SHOW: 1, // 显示
} as const;

// 订单状态
export const ORDER_STATUS = {
  UNPAID: 0, // 待付款
  UNDELIVERED: 1, // 待发货
  DELIVERED: 2, // 已发货
  COMPLETED: 3, // 已完成
  CLOSED: 4, // 已关闭
  INVALID: 5, // 无效订单
} as const;

// 订单类型
export const ORDER_TYPE = {
  NORMAL: 0, // 正常订单
  FLASH: 1, // 秒杀订单
} as const;

// 订单来源
export const ORDER_SOURCE = {
  PC: 0, // PC端
  APP: 1, // APP端
} as const;

// 支付方式
export const PAY_TYPE = {
  UNPAID: 0, // 未支付
  ALIPAY: 1, // 支付宝
  WECHAT: 2, // 微信
} as const;

// 退货申请状态
export const RETURN_STATUS = {
  PENDING: 0, // 待处理
  RETURNING: 1, // 退货中
  COMPLETED: 2, // 已完成
  REJECTED: 3, // 已拒绝
} as const;

// 优惠券类型
export const COUPON_TYPE = {
  FULL_REDUCTION: 0, // 满减券
  DISCOUNT: 1, // 打折券
  CASH: 2, // 代金券
} as const;

// 优惠券使用类型
export const COUPON_USE_TYPE = {
  ALL: 0, // 全场通用
  CATEGORY: 1, // 指定分类
  PRODUCT: 2, // 指定商品
} as const;

// 商品属性类型
export const PRODUCT_ATTR_TYPE = {
  SPECIFICATION: 0, // 规格
  PARAMETER: 1, // 参数
} as const;

// 商品属性输入类型
export const PRODUCT_ATTR_INPUT_TYPE = {
  MANUAL: 0, // 手工录入
  SELECT: 1, // 从列表中选择
} as const;

// 是否支持手动新增
export const PRODUCT_ATTR_HAND_ADD_STATUS = {
  NOT_SUPPORT: 0, // 不支持
  SUPPORT: 1, // 支持
} as const;

// 商品分类级别
export const PRODUCT_CATE_LEVEL = {
  FIRST: 0, // 一级分类
  SECOND: 1, // 二级分类
} as const;

// 导航栏状态
export const NAV_STATUS = {
  HIDE: 0, // 不显示
  SHOW: 1, // 显示
} as const;

// 用户状态
export const USER_STATUS = {
  DISABLED: 0, // 禁用
  ENABLED: 1, // 启用
} as const;

// 删除状态
export const DELETE_STATUS = {
  NOT_DELETED: 0, // 未删除
  DELETED: 1, // 已删除
} as const;

// 日期格式常量
export const DATE_FORMAT = {
  DATE: 'YYYY-MM-DD',
  DATETIME: 'YYYY-MM-DD HH:mm:ss',
  TIME: 'HH:mm:ss',
} as const;

// 分页默认值
export const PAGINATION = {
  PAGE_NUM: 1,
  PAGE_SIZE: 10,
  PAGE_SIZES: [10, 20, 50, 100],
} as const;

// 图片上传
export const UPLOAD = {
  MAX_SIZE: 2 * 1024 * 1024, // 2MB
  ACCEPT: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
  ACCEPT_STR: '.jpg,.jpeg,.png,.gif',
} as const;

// 菜单类型
export const MENU_TYPE = {
  DIRECTORY: 0, // 目录
  MENU: 1, // 菜单
  BUTTON: 2, // 按钮
} as const;

// 菜单隐藏状态
export const MENU_HIDDEN = {
  SHOW: 0, // 显示
  HIDE: 1, // 隐藏
} as const;

// 类型导出
export type PublishStatus =
  (typeof PUBLISH_STATUS)[keyof typeof PUBLISH_STATUS];
export type VerifyStatus = (typeof VERIFY_STATUS)[keyof typeof VERIFY_STATUS];
export type RecommendStatus =
  (typeof RECOMMEND_STATUS)[keyof typeof RECOMMEND_STATUS];
export type ShowStatus = (typeof SHOW_STATUS)[keyof typeof SHOW_STATUS];
export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];
export type OrderType = (typeof ORDER_TYPE)[keyof typeof ORDER_TYPE];
export type OrderSource = (typeof ORDER_SOURCE)[keyof typeof ORDER_SOURCE];
export type PayType = (typeof PAY_TYPE)[keyof typeof PAY_TYPE];
export type ReturnStatus = (typeof RETURN_STATUS)[keyof typeof RETURN_STATUS];
export type CouponType = (typeof COUPON_TYPE)[keyof typeof COUPON_TYPE];
export type CouponUseType =
  (typeof COUPON_USE_TYPE)[keyof typeof COUPON_USE_TYPE];
export type ProductAttrType =
  (typeof PRODUCT_ATTR_TYPE)[keyof typeof PRODUCT_ATTR_TYPE];
export type ProductAttrInputType =
  (typeof PRODUCT_ATTR_INPUT_TYPE)[keyof typeof PRODUCT_ATTR_INPUT_TYPE];
export type ProductAttrHandAddStatus =
  (typeof PRODUCT_ATTR_HAND_ADD_STATUS)[keyof typeof PRODUCT_ATTR_HAND_ADD_STATUS];
export type ProductCateLevel =
  (typeof PRODUCT_CATE_LEVEL)[keyof typeof PRODUCT_CATE_LEVEL];
export type NavStatus = (typeof NAV_STATUS)[keyof typeof NAV_STATUS];
export type UserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS];
export type DeleteStatus = (typeof DELETE_STATUS)[keyof typeof DELETE_STATUS];
export type MenuType = (typeof MENU_TYPE)[keyof typeof MENU_TYPE];
export type MenuHidden = (typeof MENU_HIDDEN)[keyof typeof MENU_HIDDEN];
