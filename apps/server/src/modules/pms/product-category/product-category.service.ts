import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductCategoryEntity } from './infrastructure/persistence/relational/entities/product-category.entity';
import { PageResult, PageQueryDto } from '@/common/dto/page-result.dto';

@Injectable()
export class ProductCategoryService {
  constructor(
    @InjectRepository(ProductCategoryEntity)
    private readonly categoryRepo: Repository<ProductCategoryEntity>,
  ) {}

  async getList(
    parentId: number,
    query: PageQueryDto,
  ): Promise<PageResult<ProductCategoryEntity>> {
    const pageNum = query.pageNum ?? 1;
    const pageSize = query.pageSize ?? 10;
    const [list, total] = await this.categoryRepo.findAndCount({
      where: { parentId },
      order: { sort: 'DESC' },
      skip: (pageNum - 1) * pageSize,
      take: pageSize,
    });
    return PageResult.of(list, total, query);
  }

  async listWithChildren(): Promise<any[]> {
    const allCategories = await this.categoryRepo.find({
      order: { sort: 'DESC' },
    });
    const level0 = allCategories.filter((c) => c.level === 0);
    return level0.map((parent) => ({
      ...parent,
      children: allCategories.filter(
        (c) => c.level === 1 && c.parentId === parent.id,
      ),
    }));
  }

  async getItem(id: number): Promise<ProductCategoryEntity> {
    const category = await this.categoryRepo.findOneBy({ id });
    if (!category) throw new NotFoundException(`分类 ${id} 不存在`);
    return category;
  }

  async create(
    dto: Partial<ProductCategoryEntity>,
  ): Promise<ProductCategoryEntity> {
    await this.setCategoryLevel(dto);
    dto.productCount = 0;
    const entity = this.categoryRepo.create(dto);
    return this.categoryRepo.save(entity);
  }

  async update(
    id: number,
    dto: Partial<ProductCategoryEntity>,
  ): Promise<number> {
    await this.setCategoryLevel(dto);
    const result = await this.categoryRepo.update(id, dto);
    return result.affected ?? 0;
  }

  async delete(id: number): Promise<number> {
    const result = await this.categoryRepo.softDelete(id);
    return result.affected ?? 0;
  }

  async updateNavStatus(ids: number[], navStatus: number): Promise<number> {
    const result = await this.categoryRepo
      .createQueryBuilder()
      .update()
      .set({ navStatus })
      .where('id IN (:...ids)', { ids })
      .execute();
    return result.affected ?? 0;
  }

  async updateShowStatus(ids: number[], showStatus: number): Promise<number> {
    const result = await this.categoryRepo
      .createQueryBuilder()
      .update()
      .set({ showStatus })
      .where('id IN (:...ids)', { ids })
      .execute();
    return result.affected ?? 0;
  }

  private async setCategoryLevel(
    dto: Partial<ProductCategoryEntity>,
  ): Promise<void> {
    if (
      dto.parentId === 0 ||
      dto.parentId === undefined ||
      dto.parentId === null
    ) {
      dto.level = 0;
    } else {
      const parent = await this.categoryRepo.findOneBy({ id: dto.parentId });
      dto.level = parent ? parent.level + 1 : 0;
    }
  }
}
