import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MemberProductCollectionNewEntity } from './infrastructure/persistence/relational/entities/member-product-collection.entity';
import { PageQueryDto, PageResult } from '@/common/dto/page-result.dto';

/** 收藏商品的请求体 */
export interface AddCollectionDto {
  productId: number;
  productName?: string;
  productPic?: string;
  productPrice?: number;
  productSubTitle?: string;
  productSkuCode?: string;
}

@Injectable()
export class CollectionService {
  constructor(
    @InjectRepository(MemberProductCollectionNewEntity)
    private readonly collectionRepo: Repository<MemberProductCollectionNewEntity>,
  ) {}

  /**
   * 收藏商品
   * 若已收藏则不重复插入
   * @param memberId 会员 ID
   * @param dto 商品信息
   */
  async add(
    memberId: number,
    dto: AddCollectionDto,
  ): Promise<MemberProductCollectionNewEntity> {
    const { productId } = dto;

    // 检查是否已收藏
    const existing = await this.collectionRepo.findOne({
      where: { memberId, productId },
    });
    if (existing) {
      throw new BadRequestException('已收藏该商品');
    }

    const entity = this.collectionRepo.create({
      memberId,
      productId,
      productName: dto.productName,
      productPic: dto.productPic,
      productPrice: dto.productPrice != null ? String(dto.productPrice) : null,
      createTime: new Date(),
    });

    return this.collectionRepo.save(entity);
  }

  /**
   * 取消收藏商品
   * @param memberId 会员 ID
   * @param productId 商品 ID
   */
  async delete(memberId: number, productId: number): Promise<void> {
    await this.collectionRepo.delete({ memberId, productId });
  }

  /**
   * 分页查询收藏商品列表
   * @param memberId 会员 ID
   * @param query 分页参数
   */
  async list(
    memberId: number,
    query: PageQueryDto,
  ): Promise<PageResult<MemberProductCollectionNewEntity>> {
    const { page, limit } = query;
    const [list, total] = await this.collectionRepo.findAndCount({
      where: { memberId },
      skip: (page - 1) * limit,
      take: limit,
      order: { createTime: 'DESC' },
    });
    return PageResult.of(list, total, query);
  }

  /**
   * 清空该会员所有收藏记录
   * @param memberId 会员 ID
   */
  async clear(memberId: number): Promise<void> {
    await this.collectionRepo.delete({ memberId });
  }

  /**
   * 查询单条收藏详情
   * @param memberId 会员 ID
   * @param productId 商品 ID
   */
  async getDetail(
    memberId: number,
    productId: number,
  ): Promise<MemberProductCollectionNewEntity | null> {
    return this.collectionRepo.findOne({ where: { memberId, productId } });
  }
}
