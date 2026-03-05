import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReturnApplyEntity } from './infrastructure/persistence/relational/entities/return-apply.entity';
import { PageQueryDto, PageResult } from '@/common/dto/page-result.dto';

@Injectable()
export class ReturnApplyService {
  constructor(
    @InjectRepository(ReturnApplyEntity)
    private readonly repo: Repository<ReturnApplyEntity>,
  ) {}

  /** 退货申请列表 - TODO: 迁移自 OmsOrderReturnApplyServiceImpl.list() */
  async list(
    query: PageQueryDto & any,
  ): Promise<PageResult<ReturnApplyEntity>> {
    // TODO: implement - 支持 status / orderSn / createTime 过滤
    const [list, total] = await this.repo.findAndCount({
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      order: { id: 'DESC' },
    });
    return PageResult.of(list, total, query);
  }

  /** 获取退货详情 - TODO */
  async detail(id: number): Promise<ReturnApplyEntity> {
    // TODO: implement
    return this.repo.findOneByOrFail({ id });
  }

  /** 处理退货申请 - TODO: 迁移自 OmsOrderReturnApplyServiceImpl.update() */
  async handle(id: number, dto: any): Promise<void> {
    // TODO: implement - status 变更、设置收货地址、handleMan、handleNote
    throw new Error('TODO: ReturnApplyService.handle');
  }

  /** 确认收货 - TODO */
  async confirmReceive(id: number, dto: any): Promise<void> {
    // TODO: implement
    throw new Error('TODO: ReturnApplyService.confirmReceive');
  }

  /** 删除 - TODO */
  async delete(ids: number[]): Promise<void> {
    await this.repo.delete(ids);
  }
}
