import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
    const entity = this.attrRepo.create(dto);
    const saved = await this.attrRepo.save(entity);
    // 更新属性分类的计数
    const category = await this.cateRepo.findOneBy({
      id: saved.productAttributeCategoryId,
    });
    if (category) {
      if (saved.type === 0) {
        category.attributeCount = (category.attributeCount || 0) + 1;
      } else if (saved.type === 1) {
        category.paramCount = (category.paramCount || 0) + 1;
      }
      await this.cateRepo.save(category);
    }
    return saved;
  }

  async updateAttr(id: number, dto: Partial<ProductAttrEntity>): Promise<void> {
    await this.attrRepo.update(id, dto);
  }

  async deleteAttr(ids: number[]): Promise<void> {
    if (ids.length === 0) return;
    // 获取第一个属性以确定类型和分类
    const firstAttr = await this.attrRepo.findOneBy({ id: ids[0] });
    if (!firstAttr) return;
    const count = ids.length;
    await this.attrRepo.delete(ids);
    // 更新属性分类的计数
    const category = await this.cateRepo.findOneBy({
      id: firstAttr.productAttributeCategoryId,
    });
    if (category) {
      if (firstAttr.type === 0) {
        category.attributeCount = Math.max(
          0,
          (category.attributeCount || 0) - count,
        );
      } else if (firstAttr.type === 1) {
        category.paramCount = Math.max(0, (category.paramCount || 0) - count);
      }
      await this.cateRepo.save(category);
    }
  }
}
