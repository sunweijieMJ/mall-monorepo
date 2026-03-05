/**
 * 通用仓储接口 — 定义标准 CRUD 操作
 *
 * 使用方法：
 * 1. 为每个聚合根定义具体 Repository 接口（继承此接口）
 * 2. 提供 TypeORM 实现类
 * 3. 在 Module 中通过 provide/useClass 注入
 */
export interface IBaseRepository<T> {
  findById(id: number): Promise<T | null>;
  findAll(): Promise<T[]>;
  create(data: Partial<T>): Promise<T>;
  update(id: number, data: Partial<T>): Promise<T | null>;
  remove(id: number): Promise<void>;
  softRemove(id: number): Promise<void>;
}
