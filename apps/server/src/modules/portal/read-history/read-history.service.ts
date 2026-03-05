import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MemberReadHistoryNewEntity } from './infrastructure/persistence/relational/entities/member-read-history.entity';
import { PageQueryDto, PageResult } from '@/common/dto/page-result.dto';

/** 保存浏览历史的请求体 */
export interface SaveReadHistoryDto {
  productId: number;
  productName?: string;
  productPic?: string;
  productSubTitle?: string;
  productPrice?: number;
  productSkuCode?: string;
}

@Injectable()
export class ReadHistoryService {
  constructor(
    @InjectRepository(MemberReadHistoryNewEntity)
    private readonly readHistoryRepo: Repository<MemberReadHistoryNewEntity>,
  ) {}

  /**
   * 保存浏览历史
   * 先删除同一会员+商品的旧记录，再插入新记录（保证记录时效性，排在最前）
   * @param memberId 会员 ID
   * @param dto 商品浏览信息
   */
  async save(
    memberId: number,
    dto: SaveReadHistoryDto,
  ): Promise<MemberReadHistoryNewEntity> {
    const { productId } = dto;

    // 删除同一会员+同一商品的旧浏览记录
    await this.readHistoryRepo.delete({ memberId, productId });

    // 插入新记录
    const entity = this.readHistoryRepo.create({
      memberId,
      productId,
      productName: dto.productName,
      productPic: dto.productPic,
      productPrice: dto.productPrice,
      createTime: new Date(),
    });

    return this.readHistoryRepo.save(entity);
  }

  /**
   * 分页查询浏览历史（按创建时间倒序）
   * @param memberId 会员 ID
   * @param query 分页参数
   */
  async list(
    memberId: number,
    query: PageQueryDto,
  ): Promise<PageResult<MemberReadHistoryNewEntity>> {
    const { page, limit } = query;
    const [list, total] = await this.readHistoryRepo.findAndCount({
      where: { memberId },
      skip: (page - 1) * limit,
      take: limit,
      order: { createTime: 'DESC' },
    });
    return PageResult.of(list, total, query);
  }

  /**
   * 清空该会员所有浏览历史
   * @param memberId 会员 ID
   */
  async clear(memberId: number): Promise<void> {
    await this.readHistoryRepo.delete({ memberId });
  }
}
