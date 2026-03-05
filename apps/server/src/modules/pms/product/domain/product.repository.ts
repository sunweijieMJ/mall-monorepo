import { IBaseRepository } from '@/common/repositories/base-repository.interface';
import { ProductEntity } from '../infrastructure/persistence/relational/entities/product.entity';

export const PRODUCT_REPOSITORY = Symbol('PRODUCT_REPOSITORY');

export interface IProductRepository extends IBaseRepository<ProductEntity> {
  findByKeyword(
    keyword: string,
    page: number,
    pageSize: number,
  ): Promise<[ProductEntity[], number]>;
  updateDeleteStatus(ids: number[], deleteStatus: number): Promise<void>;
  updatePublishStatus(ids: number[], publishStatus: number): Promise<void>;
}
