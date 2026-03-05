import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import {
  FlashPromotionEntity,
  FlashSessionEntity,
  FlashProductRelationEntity,
} from './infrastructure/persistence/relational/entities/flash-promotion.entity';
import { ProductEntity } from '@/modules/pms/product/infrastructure/persistence/relational/entities/product.entity';
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
    @InjectRepository(ProductEntity)
    private readonly productRepo: Repository<ProductEntity>,
  ) {}

  // ---- 秒杀活动 ----

  async createFlash(
    dto: Partial<FlashPromotionEntity>,
  ): Promise<FlashPromotionEntity> {
    const entity = this.flashRepo.create(dto);
    return this.flashRepo.save(entity);
  }

  async updateFlash(
    id: number,
    dto: Partial<FlashPromotionEntity>,
  ): Promise<void> {
    await this.flashRepo.update(id, dto);
  }

  async deleteFlash(id: number): Promise<void> {
    await this.flashRepo.delete(id);
  }

  async updateFlashStatus(id: number, status: number): Promise<void> {
    await this.flashRepo.update(id, { status });
  }

  async getFlashItem(id: number): Promise<FlashPromotionEntity | null> {
    return this.flashRepo.findOneBy({ id });
  }

  async listFlash(
    keyword: string | undefined,
    pageNum: number,
    pageSize: number,
  ): Promise<PageResult<FlashPromotionEntity>> {
    const where: any = {};
    if (keyword) {
      where.title = Like(`%${keyword}%`);
    }
    const [list, total] = await this.flashRepo.findAndCount({
      where,
      skip: (pageNum - 1) * pageSize,
      take: pageSize,
    });
    const query = new PageQueryDto();
    query.pageNum = pageNum;
    query.pageSize = pageSize;
    return PageResult.of(list, total, query);
  }

  // ---- 场次 ----

  async createSession(
    dto: Partial<FlashSessionEntity>,
  ): Promise<FlashSessionEntity> {
    const entity = this.sessionRepo.create(dto);
    return this.sessionRepo.save(entity);
  }

  async updateSession(
    id: number,
    dto: Partial<FlashSessionEntity>,
  ): Promise<void> {
    await this.sessionRepo.update(id, dto);
  }

  async updateSessionStatus(id: number, status: number): Promise<void> {
    await this.sessionRepo.update(id, { status });
  }

  async deleteSession(id: number): Promise<void> {
    await this.sessionRepo.delete(id);
  }

  async getSessionItem(id: number): Promise<FlashSessionEntity | null> {
    return this.sessionRepo.findOneBy({ id });
  }

  async listSession(): Promise<FlashSessionEntity[]> {
    return this.sessionRepo.find();
  }

  async selectList(flashPromotionId: number): Promise<any[]> {
    // 查询所有启用的场次
    const sessions = await this.sessionRepo.find({
      where: { status: 1 },
    });
    // 对每个场次，查询该活动在该场次下的商品数量
    const result = [];
    for (const session of sessions) {
      const productCount = await this.relationRepo.count({
        where: {
          flashPromotionId,
          flashPromotionSessionId: session.id,
        },
      });
      result.push({
        ...session,
        productCount,
      });
    }
    return result;
  }

  // ---- 商品关联 ----

  async createRelation(
    relationList: Partial<FlashProductRelationEntity>[],
  ): Promise<FlashProductRelationEntity[]> {
    const entities = this.relationRepo.create(relationList);
    return this.relationRepo.save(entities);
  }

  async updateRelation(
    id: number,
    dto: Partial<FlashProductRelationEntity>,
  ): Promise<void> {
    await this.relationRepo.update(id, dto);
  }

  async deleteRelation(id: number): Promise<void> {
    await this.relationRepo.delete(id);
  }

  async getRelationItem(
    id: number,
  ): Promise<FlashProductRelationEntity | null> {
    return this.relationRepo.findOneBy({ id });
  }

  async listRelation(
    flashPromotionId: number,
    flashPromotionSessionId: number,
    pageNum: number,
    pageSize: number,
  ): Promise<PageResult<any>> {
    const [relations, total] = await this.relationRepo.findAndCount({
      where: {
        flashPromotionId,
        flashPromotionSessionId,
      },
      skip: (pageNum - 1) * pageSize,
      take: pageSize,
      order: { sort: 'DESC' },
    });

    // 联表查询商品信息
    const list = await Promise.all(
      relations.map(async (relation) => {
        const product = await this.productRepo.findOne({
          where: { id: relation.productId },
          select: ['id', 'name', 'pic', 'price', 'productSn', 'stock'],
        });
        return {
          ...relation,
          product,
        };
      }),
    );

    const query = new PageQueryDto();
    query.pageNum = pageNum;
    query.pageSize = pageSize;
    return PageResult.of(list, total, query);
  }

  async getRelationCount(
    flashPromotionId: number,
    flashPromotionSessionId: number,
  ): Promise<number> {
    return this.relationRepo.count({
      where: { flashPromotionId, flashPromotionSessionId },
    });
  }
}
