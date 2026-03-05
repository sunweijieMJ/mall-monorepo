import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductCategoryEntity } from './infrastructure/persistence/relational/entities/product-category.entity';

@Injectable()
export class ProductCategoryService {
  constructor(
    @InjectRepository(ProductCategoryEntity)
    private readonly categoryRepo: Repository<ProductCategoryEntity>,
  ) {}

  /** 获取全部分类（树形结构）- TODO: 迁移自 PmsProductCategoryServiceImpl.listWithChildren() */
  async listWithChildren(): Promise<ProductCategoryEntity[]> {
    // TODO: implement - 返回一/二级分类树，含子分类
    return this.categoryRepo.find({ where: { level: 0 } });
  }

  /** 分页列表（按 parentId 过滤）- TODO: 迁移自 PmsProductCategoryServiceImpl.getList() */
  async getList(parentId: number, query: any): Promise<any> {
    // TODO: implement
    return this.categoryRepo.find({
      where: { parentId },
      order: { sort: 'ASC' },
    });
  }

  /** 创建分类 - TODO */
  async create(dto: any): Promise<ProductCategoryEntity> {
    // TODO: implement - 设置 level 根据 parentId 判断
    throw new Error('TODO: ProductCategoryService.create');
  }

  /** 更新分类 - TODO */
  async update(id: number, dto: any): Promise<void> {
    // TODO: implement
    throw new Error('TODO: ProductCategoryService.update');
  }

  /** 删除分类 - TODO: 检查是否有子分类/关联商品 */
  async delete(id: number): Promise<void> {
    // TODO: implement
    await this.categoryRepo.delete(id);
  }

  /** 更新显示状态 - TODO */
  async updateNavStatus(ids: number[], navStatus: number): Promise<void> {
    // TODO: implement
    await this.categoryRepo
      .createQueryBuilder()
      .update()
      .set({ navStatus })
      .whereInIds(ids)
      .execute();
  }

  async updateShowStatus(ids: number[], showStatus: number): Promise<void> {
    await this.categoryRepo
      .createQueryBuilder()
      .update()
      .set({ showStatus })
      .whereInIds(ids)
      .execute();
  }
}
