import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ProductAttrEntity,
  ProductAttrCategoryEntity,
} from './infrastructure/persistence/relational/entities/product-attr.entity';

@Injectable()
export class ProductAttrService {
  constructor(
    @InjectRepository(ProductAttrEntity)
    private readonly attrRepo: Repository<ProductAttrEntity>,
    @InjectRepository(ProductAttrCategoryEntity)
    private readonly cateRepo: Repository<ProductAttrCategoryEntity>,
  ) {}

  // ---- 属性分类 ----
  /** TODO: 迁移自 PmsProductAttributeCategoryServiceImpl.getList() */
  async listAttrCategory(query: any): Promise<any> {
    /* TODO */ return this.cateRepo.find();
  }
  async createAttrCategory(dto: any): Promise<any> {
    /* TODO */ return this.cateRepo.save(dto);
  }
  async updateAttrCategory(id: number, dto: any): Promise<any> {
    /* TODO */ return this.cateRepo.update(id, dto);
  }
  async deleteAttrCategory(id: number): Promise<void> {
    /* TODO */ await this.cateRepo.delete(id);
  }
  /** 获取含属性的分类列表 - TODO: 迁移自 getListWithAttr() */
  async listAttrCategoryWithAttr(query: any): Promise<any> {
    /* TODO */ return [];
  }

  // ---- 属性 ----
  /** TODO: 迁移自 PmsProductAttributeServiceImpl.getList() */
  async listAttr(categoryId: number, type: number, query: any): Promise<any> {
    // TODO: implement - type: 0=规格 1=参数
    return this.attrRepo.find({
      where: { productAttributeCategoryId: categoryId, type },
    });
  }

  async createAttr(dto: any): Promise<any> {
    /* TODO */ return this.attrRepo.save(dto);
  }
  async updateAttr(id: number, dto: any): Promise<any> {
    /* TODO */ return this.attrRepo.update(id, dto);
  }
  async deleteAttr(ids: number[]): Promise<void> {
    /* TODO */ await this.attrRepo.delete(ids);
  }
}
