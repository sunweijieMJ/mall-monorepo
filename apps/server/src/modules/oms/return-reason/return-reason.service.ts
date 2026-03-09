import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ReturnReasonEntity } from './infrastructure/persistence/relational/entities/return-reason.entity';
import { PageQueryDto, PageResult } from '@/common/dto/page-result.dto';

@Injectable()
export class ReturnReasonService {
  constructor(
    @InjectRepository(ReturnReasonEntity)
    private readonly repo: Repository<ReturnReasonEntity>,
  ) {}

  async list(query: PageQueryDto): Promise<PageResult<ReturnReasonEntity>> {
    const [list, total] = await this.repo.findAndCount({
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      order: { sort: 'DESC' },
    });
    return PageResult.of(list, total, query);
  }

  async create(dto: Partial<ReturnReasonEntity>): Promise<ReturnReasonEntity> {
    const entity = this.repo.create({
      ...dto,
      status: 1,
    });
    return this.repo.save(entity);
  }

  async update(id: number, dto: Partial<ReturnReasonEntity>): Promise<number> {
    const result = await this.repo.update(id, dto);
    return result.affected ?? 0;
  }

  async delete(ids: number[]): Promise<number> {
    const result = await this.repo.softDelete(ids);
    return result.affected ?? 0;
  }

  async getItem(id: number): Promise<ReturnReasonEntity | null> {
    return this.repo.findOneBy({ id });
  }

  async updateStatus(ids: number[], status: number): Promise<number> {
    const result = await this.repo.update({ id: In(ids) }, { status });
    return result.affected ?? 0;
  }
}
