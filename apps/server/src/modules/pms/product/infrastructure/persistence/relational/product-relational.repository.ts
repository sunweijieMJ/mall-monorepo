import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { BaseTypeOrmRepository } from '@/common/repositories/base-typeorm.repository';
import { ProductEntity } from './entities/product.entity';
import { IProductRepository } from '../../../domain/product.repository';

@Injectable()
export class ProductRelationalRepository
  extends BaseTypeOrmRepository<ProductEntity>
  implements IProductRepository
{
  constructor(
    @InjectRepository(ProductEntity)
    repo: Repository<ProductEntity>,
  ) {
    super(repo);
  }

  async findByKeyword(
    keyword: string,
    page: number,
    pageSize: number,
  ): Promise<[ProductEntity[], number]> {
    const qb = this.repo.createQueryBuilder('p');
    if (keyword) {
      qb.andWhere('p.name LIKE :keyword', { keyword: `%${keyword}%` });
    }
    qb.andWhere('p.deleteStatus = :ds', { ds: 0 });
    qb.skip((page - 1) * pageSize).take(pageSize);
    return qb.getManyAndCount();
  }

  async updateDeleteStatus(ids: number[], deleteStatus: number): Promise<void> {
    await this.repo.update(
      { id: In(ids) } as any,
      {
        deleteStatus,
      } as any,
    );
  }

  async updatePublishStatus(
    ids: number[],
    publishStatus: number,
  ): Promise<void> {
    await this.repo.update(
      { id: In(ids) } as any,
      {
        publishStatus,
      } as any,
    );
  }
}
