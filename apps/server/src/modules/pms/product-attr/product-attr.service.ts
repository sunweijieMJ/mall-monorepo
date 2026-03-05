import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { TransactionService } from '@/infrastructure/database/transaction/transaction.service';
import {
  ProductAttrEntity,
  ProductAttrCategoryEntity,
} from './infrastructure/persistence/relational/entities/product-attr.entity';
import { PageResult, PageQueryDto } from '@/common/dto/page-result.dto';

@Injectable()
export class ProductAttrService {
  constructor(
    @InjectRepository(ProductAttrEntity)
    private readonly attrRepo: Repository<ProductAttrEntity>,
    @InjectRepository(ProductAttrCategoryEntity)
    private readonly cateRepo: Repository<ProductAttrCategoryEntity>,
    private readonly transactionService: TransactionService,
  ) {}

  // ---- 属性分类 ----

  async listAttrCategory(
    query: PageQueryDto,
  ): Promise<PageResult<ProductAttrCategoryEntity>> {
    const pageNum = query.pageNum ?? 1;
    const pageSize = query.pageSize ?? 10;
    const [list, total] = await this.cateRepo.findAndCount({
      skip: (pageNum - 1) * pageSize,
      take: pageSize,
    });
    return PageResult.of(list, total, query);
  }

  async createAttrCategory(
    dto: Partial<ProductAttrCategoryEntity>,
  ): Promise<ProductAttrCategoryEntity> {
    const entity = this.cateRepo.create(dto);
    return this.cateRepo.save(entity);
  }

  async updateAttrCategory(
    id: number,
    dto: Partial<ProductAttrCategoryEntity>,
  ): Promise<void> {
    await this.cateRepo.update(id, dto);
  }

  async deleteAttrCategory(id: number): Promise<void> {
    await this.cateRepo.delete(id);
  }

  async listAttrCategoryWithAttr(): Promise<any[]> {
    const categories = await this.cateRepo.find();
    const attrs = await this.attrRepo.find({ where: { type: 0 } });
    return categories.map((cate) => ({
      ...cate,
      attributeList: attrs.filter(
        (a) => a.productAttributeCategoryId === cate.id,
      ),
    }));
  }

  // ---- 属性 ----

  async listAttr(
    categoryId: number,
    type: number,
    query: PageQueryDto,
  ): Promise<PageResult<ProductAttrEntity>> {
    const pageNum = query.pageNum ?? 1;
    const pageSize = query.pageSize ?? 10;
    const [list, total] = await this.attrRepo.findAndCount({
      where: { productAttributeCategoryId: categoryId, type },
      order: { sort: 'DESC' },
      skip: (pageNum - 1) * pageSize,
      take: pageSize,
    });
    return PageResult.of(list, total, query);
  }

  async getAttrItem(id: number): Promise<ProductAttrEntity> {
    const attr = await this.attrRepo.findOneBy({ id });
    if (!attr) throw new NotFoundException(`属性 ${id} 不存在`);
    return attr;
  }

  async createAttr(
    dto: Partial<ProductAttrEntity>,
  ): Promise<ProductAttrEntity> {
    return this.transactionService.run(async (manager) => {
      const entity = manager.create(ProductAttrEntity, dto);
      const saved = await manager.save(ProductAttrEntity, entity);
      // 更新属性分类的计数
      const category = await manager.findOneBy(ProductAttrCategoryEntity, {
        id: saved.productAttributeCategoryId,
      });
      if (category) {
        if (saved.type === 0) {
          category.attributeCount = (category.attributeCount || 0) + 1;
        } else if (saved.type === 1) {
          category.paramCount = (category.paramCount || 0) + 1;
        }
        await manager.save(ProductAttrCategoryEntity, category);
      }
      return saved;
    });
  }

  async updateAttr(id: number, dto: Partial<ProductAttrEntity>): Promise<void> {
    await this.attrRepo.update(id, dto);
  }

  async deleteAttr(ids: number[]): Promise<void> {
    if (ids.length === 0) return;
    await this.transactionService.run(async (manager) => {
      // 查询所有待删除的属性，按分类和类型分组后分别更新计数
      const attrs = await manager.find(ProductAttrEntity, {
        where: { id: In(ids) },
      });
      if (attrs.length === 0) return;

      await manager.delete(ProductAttrEntity, ids);

      // 按 (productAttributeCategoryId, type) 分组统计删除数量
      const groupMap = new Map<
        string,
        { categoryId: number; type: number; count: number }
      >();
      for (const attr of attrs) {
        const key = `${attr.productAttributeCategoryId}_${attr.type}`;
        const existing = groupMap.get(key);
        if (existing) {
          existing.count += 1;
        } else {
          groupMap.set(key, {
            categoryId: attr.productAttributeCategoryId,
            type: attr.type,
            count: 1,
          });
        }
      }

      // 对每个分组分别更新对应分类的计数
      for (const { categoryId, type, count } of groupMap.values()) {
        const category = await manager.findOneBy(ProductAttrCategoryEntity, {
          id: categoryId,
        });
        if (!category) continue;

        if (type === 0) {
          category.attributeCount = Math.max(
            0,
            (category.attributeCount || 0) - count,
          );
        } else if (type === 1) {
          category.paramCount = Math.max(0, (category.paramCount || 0) - count);
        }
        await manager.save(ProductAttrCategoryEntity, category);
      }
    });
  }
}
