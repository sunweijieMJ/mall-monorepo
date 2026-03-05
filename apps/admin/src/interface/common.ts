/**
 * Mall 通用类型定义
 */

// 分页请求参数
export interface PageParams {
  pageNum?: number;
  pageSize?: number;
}

// 分页响应数据
export interface PageResult<T> {
  pageNum: number;
  pageSize: number;
  total: number;
  totalPage: number;
  list: T[];
}

// 通用列表查询参数
export interface ListQuery extends PageParams {
  keyword?: string;
}

// ID参数
export interface IdParam {
  id: string | number;
}

// 状态参数
export interface StatusParam {
  status: number;
}

// 通用表单响应
export interface FormResult {
  id: string | number;
}
