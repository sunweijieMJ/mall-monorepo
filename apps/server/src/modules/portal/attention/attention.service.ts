import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MemberBrandAttentionNewEntity } from './infrastructure/persistence/relational/entities/member-brand-attention.entity';
import { PageQueryDto, PageResult } from '@/common/dto/page-result.dto';

/** 关注品牌的请求体 */
export interface AddAttentionDto {
  brandId: number;
  brandName?: string;
  brandLogo?: string;
  /** 可选：会员昵称和头像（从用户信息补充） */
  memberNickname?: string;
  memberIcon?: string;
}

@Injectable()
export class AttentionService {
  constructor(
    @InjectRepository(MemberBrandAttentionNewEntity)
    private readonly attentionRepo: Repository<MemberBrandAttentionNewEntity>,
  ) {}

  /**
   * 关注品牌
   * 若已关注则不重复插入
   * @param memberId 会员 ID
   * @param dto 品牌信息
   */
  async add(
    memberId: number,
    dto: AddAttentionDto,
  ): Promise<MemberBrandAttentionNewEntity | { message: string }> {
    const { brandId } = dto;

    // 检查是否已关注
    const existing = await this.attentionRepo.findOne({
      where: { memberId, brandId },
    });
    if (existing) {
      return { message: '已关注该品牌' };
    }

    const entity = this.attentionRepo.create({
      memberId,
      brandId,
      brandName: dto.brandName,
      brandLogo: dto.brandLogo,
      memberNickname: dto.memberNickname,
      memberIcon: dto.memberIcon,
      createTime: new Date(),
    });

    return this.attentionRepo.save(entity);
  }

  /**
   * 取消关注品牌
   * @param memberId 会员 ID
   * @param brandId 品牌 ID
   */
  async delete(memberId: number, brandId: number): Promise<void> {
    await this.attentionRepo.delete({ memberId, brandId });
  }

  /**
   * 分页查询已关注品牌列表
   * @param memberId 会员 ID
   * @param query 分页参数
   */
  async list(
    memberId: number,
    query: PageQueryDto,
  ): Promise<PageResult<MemberBrandAttentionNewEntity>> {
    const { page, limit } = query;
    const [list, total] = await this.attentionRepo.findAndCount({
      where: { memberId },
      skip: (page - 1) * limit,
      take: limit,
      order: { createTime: 'DESC' },
    });
    return PageResult.of(list, total, query);
  }

  /**
   * 清空该会员所有关注记录
   * @param memberId 会员 ID
   */
  async clear(memberId: number): Promise<void> {
    await this.attentionRepo.delete({ memberId });
  }
}
