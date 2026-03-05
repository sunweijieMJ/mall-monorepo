import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReturnReasonEntity } from './infrastructure/persistence/relational/entities/return-reason.entity';
import { PageQueryDto, PageResult } from '@/common/dto/page-result.dto';

@Injectable()
export class ReturnReasonService {
  constructor(
    @InjectRepository(ReturnReasonEntity)
    private readonly repo: Repository<ReturnReasonEntity>,
  ) {}

  /** 分页列表 - TODO: 迁移自 OmsOrderReturnReasonServiceImpl.list() */
  async list(query: PageQueryDto): Promise<PageResult<ReturnReasonEntity>> {
    const [list, total] = await this.repo.findAndCount({
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      order: { sort: 'ASC' },
    });
    return PageResult.of(list, total, query);
  }

  /** 创建 - TODO */
  async create(dto: any): Promise<ReturnReasonEntity> {
    return this.repo.save(dto);
  }

  /** 更新 - TODO */
  async update(id: number, dto: any): Promise<void> {
    await this.repo.update(id, dto);
  }

  /** 批量删除 - TODO */
  async delete(ids: number[]): Promise<void> {
    await this.repo.delete(ids);
  }

  /** 修改启用状态 - TODO */
  async updateStatus(ids: number[], status: number): Promise<void> {
    await this.repo
      .createQueryBuilder()
      .update()
      .set({ status })
      .whereInIds(ids)
      .execute();
  }
}
