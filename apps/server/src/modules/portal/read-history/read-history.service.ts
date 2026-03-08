import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { MemberReadHistoryNewEntity } from './infrastructure/persistence/relational/entities/member-read-history.entity';
import { PageQueryDto, PageResult } from '@/common/dto/page-result.dto';
import { SaveReadHistoryDto } from './dto/save-read-history.dto';
import { ProductEntity } from '@/modules/pms/product/infrastructure/persistence/relational/entities/product.entity';

@Injectable()
export class ReadHistoryService {
  constructor(
    @InjectRepository(MemberReadHistoryNewEntity)
    private readonly readHistoryRepo: Repository<MemberReadHistoryNewEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepo: Repository<ProductEntity>,
  ) {}

  /**
   * 保存浏览历史
   * 先删除同一会员+商品的旧记录，再插入新记录（保证记录时效性，排在最前）
   * 从数据库查询商品信息，防止前端传入伪造数据
   */
  async save(
    memberId: number,
    dto: SaveReadHistoryDto,
  ): Promise<MemberReadHistoryNewEntity> {
    const { productId } = dto;

    // 从数据库查询商品信息
    const product = await this.productRepo.findOne({
      where: { id: productId },
    });
    if (!product) {
      throw new NotFoundException(`商品 ${productId} 不存在`);
    }

    // 删除同一会员+同一商品的旧浏览记录
    await this.readHistoryRepo.delete({ memberId, productId });

    // 插入新记录
    const entity = this.readHistoryRepo.create({
      memberId,
      productId,
      productName: product.name,
      productPic: product.pic,
      productPrice: product.price,
      createdAt: new Date(),
    });

    return this.readHistoryRepo.save(entity);
  }

  /**
   * 分页查询浏览历史（按创建时间倒序）
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
      order: { createdAt: 'DESC' },
    });
    return PageResult.of(list, total, query);
  }

  /**
   * 批量删除指定浏览历史（校验归属权）
   */
  async batchDelete(memberId: number, ids: number[]): Promise<void> {
    if (ids.length === 0) return;
    await this.readHistoryRepo.delete({ id: In(ids), memberId });
  }

  /**
   * 清空该会员所有浏览历史
   */
  async clear(memberId: number): Promise<void> {
    await this.readHistoryRepo.delete({ memberId });
  }
}
