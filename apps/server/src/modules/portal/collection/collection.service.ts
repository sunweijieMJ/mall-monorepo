import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MemberProductCollectionNewEntity } from './infrastructure/persistence/relational/entities/member-product-collection.entity';
import { PageQueryDto, PageResult } from '@/common/dto/page-result.dto';
import { AddCollectionDto } from './dto/add-collection.dto';
import { ProductEntity } from '@/modules/pms/product/infrastructure/persistence/relational/entities/product.entity';

@Injectable()
export class CollectionService {
  constructor(
    @InjectRepository(MemberProductCollectionNewEntity)
    private readonly collectionRepo: Repository<MemberProductCollectionNewEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepo: Repository<ProductEntity>,
  ) {}

  /**
   * 收藏商品
   * 从数据库查询商品信息，防止前端传入伪造数据
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

    // 从数据库查询商品信息
    const product = await this.productRepo.findOne({
      where: { id: productId },
    });
    if (!product) {
      throw new NotFoundException(`商品 ${productId} 不存在`);
    }

    const entity = this.collectionRepo.create({
      memberId,
      productId,
      productName: product.name,
      productPic: product.pic,
      productPrice: product.price,
      createdAt: new Date(),
    });

    return this.collectionRepo.save(entity);
  }

  /**
   * 取消收藏商品
   */
  async delete(memberId: number, productId: number): Promise<void> {
    await this.collectionRepo.delete({ memberId, productId });
  }

  /**
   * 分页查询收藏商品列表
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
      order: { createdAt: 'DESC' },
    });
    return PageResult.of(list, total, query);
  }

  /**
   * 清空该会员所有收藏记录
   */
  async clear(memberId: number): Promise<void> {
    await this.collectionRepo.delete({ memberId });
  }

  /**
   * 查询单条收藏详情
   */
  async getDetail(
    memberId: number,
    productId: number,
  ): Promise<MemberProductCollectionNewEntity | null> {
    return this.collectionRepo.findOne({ where: { memberId, productId } });
  }
}
