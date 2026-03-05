import {
  Repository,
  DeepPartial,
  FindOptionsWhere,
  ObjectLiteral,
} from 'typeorm';
import { IBaseRepository } from './base-repository.interface';

/**
 * TypeORM 通用仓储实现 — 封装 TypeORM Repository 常用操作
 *
 * 继承此类并传入具体 Entity 类型即可获得标准 CRUD 能力
 */
export abstract class BaseTypeOrmRepository<
  T extends ObjectLiteral,
> implements IBaseRepository<T> {
  constructor(protected readonly repo: Repository<T>) {}

  async findById(id: number): Promise<T | null> {
    return this.repo.findOne({
      where: { id } as unknown as FindOptionsWhere<T>,
    });
  }

  async findAll(): Promise<T[]> {
    return this.repo.find();
  }

  async create(data: Partial<T>): Promise<T> {
    const entity = this.repo.create(data as DeepPartial<T>);
    return this.repo.save(entity);
  }

  async update(id: number, data: Partial<T>): Promise<T | null> {
    await this.repo.update(id, data as any);
    return this.findById(id);
  }

  async remove(id: number): Promise<void> {
    await this.repo.delete(id);
  }

  async softRemove(id: number): Promise<void> {
    await this.repo.softDelete(id);
  }
}
