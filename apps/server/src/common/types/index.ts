/**
 * 通用类型工具
 */

/** 递归 Partial — 深层嵌套对象也变为可选 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/** 可空类型 */
export type Nullable<T> = T | null;

/** 可空或可选类型 */
export type Maybe<T> = T | null | undefined;

/** 带用户信息的 Express Request */
export interface RequestWithUser extends Express.Request {
  user: {
    sub: number;
    username: string;
    type: 'admin' | 'member';
  };
}

/** 分页查询参数 */
export interface PaginationOptions {
  pageNum: number;
  pageSize: number;
}

/** 分页返回结果 */
export interface PaginationResult<T> {
  list: T[];
  total: number;
  pageNum: number;
  pageSize: number;
  totalPages: number;
}
