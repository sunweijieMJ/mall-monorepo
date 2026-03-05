import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  AdminResourceEntity,
  AdminResourceCategoryEntity,
} from './infrastructure/persistence/relational/entities/admin-resource.entity';
import { PageQueryDto, PageResult } from '@/common/dto/page-result.dto';

@Injectable()
export class AdminResourceService {
  constructor(
    @InjectRepository(AdminResourceEntity)
    private readonly resourceRepo: Repository<AdminResourceEntity>,
    @InjectRepository(AdminResourceCategoryEntity)
    private readonly categoryRepo: Repository<AdminResourceCategoryEntity>,
  ) {}

  // ---- 资源 ----
  /** TODO: 迁移自 UmsResourceServiceImpl */
  async list(
    query: PageQueryDto & any,
  ): Promise<PageResult<AdminResourceEntity>> {
    const [list, total] = await this.resourceRepo.findAndCount({
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    });
    return PageResult.of(list, total, query);
  }

  async create(dto: any): Promise<AdminResourceEntity> {
    return this.resourceRepo.save(dto);
  }
  async update(id: number, dto: any): Promise<void> {
    await this.resourceRepo.update(id, dto);
  }
  async delete(id: number): Promise<void> {
    await this.resourceRepo.delete(id);
  }

  // ---- 资源分类 ----
  async listCategory(): Promise<AdminResourceCategoryEntity[]> {
    return this.categoryRepo.find({ order: { sort: 'ASC' } });
  }
  async createCategory(dto: any): Promise<AdminResourceCategoryEntity> {
    return this.categoryRepo.save(dto);
  }
  async updateCategory(id: number, dto: any): Promise<void> {
    await this.categoryRepo.update(id, dto);
  }
  async deleteCategory(id: number): Promise<void> {
    await this.categoryRepo.delete(id);
  }
}
