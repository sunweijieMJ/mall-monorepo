import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  FlashPromotionEntity,
  FlashSessionEntity,
  FlashProductRelationEntity,
} from './infrastructure/persistence/relational/entities/flash-promotion.entity';
import { PageQueryDto, PageResult } from '@/common/dto/page-result.dto';

@Injectable()
export class FlashPromotionService {
  constructor(
    @InjectRepository(FlashPromotionEntity)
    private readonly flashRepo: Repository<FlashPromotionEntity>,
    @InjectRepository(FlashSessionEntity)
    private readonly sessionRepo: Repository<FlashSessionEntity>,
    @InjectRepository(FlashProductRelationEntity)
    private readonly relationRepo: Repository<FlashProductRelationEntity>,
  ) {}

  // ---- 秒杀活动 ----
  /** TODO: 迁移自 SmsFlashPromotionServiceImpl */
  async listFlash(
    query: PageQueryDto,
  ): Promise<PageResult<FlashPromotionEntity>> {
    const [list, total] = await this.flashRepo.findAndCount({
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    });
    return PageResult.of(list, total, query);
  }

  async createFlash(dto: any): Promise<FlashPromotionEntity> {
    return this.flashRepo.save(dto);
  }
  async updateFlash(id: number, dto: any): Promise<void> {
    await this.flashRepo.update(id, dto);
  }
  async deleteFlash(id: number): Promise<void> {
    await this.flashRepo.delete(id);
  }
  async updateFlashStatus(id: number, status: number): Promise<void> {
    await this.flashRepo.update(id, { status });
  }

  // ---- 场次 ----
  /** TODO: 迁移自 SmsFlashPromotionSessionServiceImpl */
  async listSession(flashId: number): Promise<FlashSessionEntity[]> {
    return this.sessionRepo.find();
  }
  async createSession(dto: any): Promise<FlashSessionEntity> {
    return this.sessionRepo.save(dto);
  }
  async updateSession(id: number, dto: any): Promise<void> {
    await this.sessionRepo.update(id, dto);
  }
  async deleteSession(id: number): Promise<void> {
    await this.sessionRepo.delete(id);
  }
  async updateSessionStatus(id: number, status: number): Promise<void> {
    await this.sessionRepo.update(id, { status });
  }

  // ---- 商品关联 ----
  /** TODO: 迁移自 SmsFlashPromotionProductRelationServiceImpl */
  async listRelation(
    query: any,
  ): Promise<PageResult<FlashProductRelationEntity>> {
    // TODO: implement - 关联查询商品信息
    const [list, total] = await this.relationRepo.findAndCount({
      where: {
        flashPromotionId: query.flashPromotionId,
        flashPromotionSessionId: query.flashPromotionSessionId,
      },
    });
    return PageResult.of(list, total, query);
  }

  async createRelation(dto: any): Promise<FlashProductRelationEntity[]> {
    // TODO: implement - 批量创建
    throw new Error('TODO: FlashPromotionService.createRelation');
  }

  async updateRelation(id: number, dto: any): Promise<void> {
    await this.relationRepo.update(id, dto);
  }
  async deleteRelation(ids: number[]): Promise<void> {
    await this.relationRepo.delete(ids);
  }
}
