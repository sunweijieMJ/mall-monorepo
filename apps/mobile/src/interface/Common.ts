/**
 * API统一响应接口
 * @template T - 响应数据类型
 */
export interface ApiResponse<T = any> {
  /** 响应状态码，200表示成功，其他表示失败 */
  code: number;
  /** 响应消息，成功时为"操作成功"，失败时为具体错误信息 */
  message: string;
  /** 响应数据 */
  data: T;
}

/**
 * 分页查询参数接口
 */
export interface PaginationParams {
  /** 页码，从1开始 */
  pageNum: number;
  /** 每页大小，通常为10-100 */
  pageSize: number;
}

/**
 * 分页查询结果接口
 * @template T - 列表数据项类型
 */
export interface PaginationResult<T> {
  /** 总记录数 */
  total: number;
  /** 当前页数据列表 */
  list: T[];
  /** 当前页码 */
  pageNum: number;
  /** 每页大小 */
  pageSize: number;
  /** 当前页实际数量 */
  size: number;
  /** 起始行号 */
  startRow: number;
  /** 结束行号 */
  endRow: number;
  /** 总页数 */
  pages: number;
  /** 前一页页码 */
  prePage: number;
  /** 下一页页码 */
  nextPage: number;
  /** 是否为首页 */
  isFirstPage: boolean;
  /** 是否为尾页 */
  isLastPage: boolean;
  /** 是否有前一页 */
  hasPreviousPage: boolean;
  /** 是否有下一页 */
  hasNextPage: boolean;
  /** 导航页数 */
  navigatePages: number;
  /** 导航页码数组 */
  navigatepageNums: number[];
  /** 导航首页页码 */
  navigateFirstPage: number;
  /** 导航尾页页码 */
  navigateLastPage: number;
}

/**
 * 基础实体接口
 * 包含所有实体的通用属性
 */
export interface BaseEntity {
  /** 唯一标识符 */
  id: number;
  /** 创建时间 */
  createTime?: string;
  /** 更新时间 */
  updateTime?: string;
}

/**
 * 下拉选项接口
 * 用于下拉框、单选框等组件的选项数据
 */
export interface SelectOption {
  /** 选项显示文本 */
  label: string;
  /** 选项值 */
  value: string | number;
  /** 是否禁用，默认false */
  disabled?: boolean;
}
