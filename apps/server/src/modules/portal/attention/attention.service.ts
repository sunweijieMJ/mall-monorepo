import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MemberBrandAttentionNewEntity } from './infrastructure/persistence/relational/entities/member-brand-attention.entity';
import { PageQueryDto, PageResult } from '@/common/dto/page-result.dto';
import { AddAttentionDto } from './dto/add-attention.dto';
import { BrandEntity } from '@/modules/pms/brand/infrastructure/persistence/relational/entities/brand.entity';
import { MemberEntity } from '@/modules/portal/member/infrastructure/persistence/relational/entities/member.entity';

@Injectable()
export class AttentionService {
  constructor(
    @InjectRepository(MemberBrandAttentionNewEntity)
    private readonly attentionRepo: Repository<MemberBrandAttentionNewEntity>,
    @InjectRepository(BrandEntity)
    private readonly brandRepo: Repository<BrandEntity>,
    @InjectRepository(MemberEntity)
    private readonly memberRepo: Repository<MemberEntity>,
  ) {}

  /**
   * 关注品牌
   * 从数据库查询品牌和会员信息，防止前端传入伪造数据
   */
  async add(
    memberId: number,
    dto: AddAttentionDto,
  ): Promise<MemberBrandAttentionNewEntity> {
    const { brandId } = dto;

    // 检查是否已关注
    const existing = await this.attentionRepo.findOne({
      where: { memberId, brandId },
    });
    if (existing) {
      throw new BadRequestException('已关注该品牌');
    }

    // 从数据库查询品牌信息
    const brand = await this.brandRepo.findOne({ where: { id: brandId } });
    if (!brand) {
      throw new NotFoundException(`品牌 ${brandId} 不存在`);
    }

    // 从数据库查询会员信息
    const member = await this.memberRepo.findOne({ where: { id: memberId } });

    const entity = this.attentionRepo.create({
      memberId,
      brandId,
      brandName: brand.name,
      brandLogo: brand.logo,
      memberNickname: member?.nickname ?? '',
      memberIcon: member?.icon ?? '',
      createdAt: new Date(),
    });

    return this.attentionRepo.save(entity);
  }

  /**
   * 取消关注品牌
   */
  async delete(memberId: number, brandId: number): Promise<number> {
    const result = await this.attentionRepo.delete({ memberId, brandId });
    return result.affected ?? 0;
  }

  /**
   * 分页查询已关注品牌列表
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
      order: { createdAt: 'DESC' },
    });
    return PageResult.of(list, total, query);
  }

  /**
   * 清空该会员所有关注记录
   */
  async clear(memberId: number): Promise<number> {
    const result = await this.attentionRepo.delete({ memberId });
    return result.affected ?? 0;
  }
}
