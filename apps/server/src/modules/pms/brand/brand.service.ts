import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { BrandEntity } from './infrastructure/persistence/relational/entities/brand.entity';
import { CreateBrandDto } from './dto/create-brand.dto';
import { QueryBrandDto } from './dto/query-brand.dto';
import { PageQueryDto, PageResult } from '@/common/dto/page-result.dto';
import { ProductEntity } from '@/modules/pms/product/infrastructure/persistence/relational/entities/product.entity';

@Injectable()
export class BrandService {
  constructor(
    @InjectRepository(BrandEntity)
    private readonly brandRepo: Repository<BrandEntity>,

    @InjectRepository(ProductEntity)
    private readonly productRepo: Repository<ProductEntity>,
  ) {}

  async findList(query: QueryBrandDto): Promise<PageResult<BrandEntity>> {
    const where: any = {};
    if (query.keyword) {
      where.name = Like(`%${query.keyword}%`);
    }
    const [list, total] = await this.brandRepo.findAndCount({
      where,
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      order: { sort: 'DESC' },
    });
    return PageResult.of(list, total, query);
  }

  async findAll(): Promise<BrandEntity[]> {
    return this.brandRepo.find({ order: { sort: 'DESC' } });
  }

  async getItem(id: number): Promise<BrandEntity> {
    const brand = await this.brandRepo.findOneBy({ id });
    if (!brand) throw new NotFoundException(`品牌 ${id} 不存在`);
    return brand;
  }

  async create(dto: CreateBrandDto): Promise<BrandEntity> {
    // 首字母为空时取名称第一个字符
    if (!dto.firstLetter && dto.name) {
      dto.firstLetter = dto.name.substring(0, 1);
    }
    const entity = this.brandRepo.create(dto);
    return this.brandRepo.save(entity);
  }

  async update(id: number, dto: Partial<CreateBrandDto>): Promise<BrandEntity> {
    if (!dto.firstLetter && dto.name) {
      dto.firstLetter = dto.name.substring(0, 1);
    }
    await this.brandRepo.update(id, dto);
    const brand = await this.brandRepo.findOneBy({ id });
    if (!brand) throw new NotFoundException(`品牌 ${id} 不存在`);
    return brand;
  }

  async remove(ids: number[]): Promise<void> {
    await this.brandRepo.delete(ids);
  }

  async updateShowStatus(ids: number[], showStatus: number): Promise<void> {
    await this.brandRepo
      .createQueryBuilder()
      .update()
      .set({ showStatus })
      .where('id IN (:...ids)', { ids })
      .execute();
  }

  async updateFactoryStatus(
    ids: number[],
    factoryStatus: number,
  ): Promise<void> {
    await this.brandRepo
      .createQueryBuilder()
      .update()
      .set({ factoryStatus })
      .where('id IN (:...ids)', { ids })
      .execute();
  }

  // ========== 移动端（Portal）接口 ==========

  /**
   * 推荐品牌列表（分页）
   * 只返回 showStatus=1 的品牌，按 sort 倒序
   */
  async recommendList(
    page: number,
    limit: number,
  ): Promise<PageResult<BrandEntity>> {
    const p = page || 1;
    const l = limit || 10;
    const [list, total] = await this.brandRepo.findAndCount({
      where: { showStatus: 1 },
      order: { sort: 'DESC' },
      skip: (p - 1) * l,
      take: l,
    });
    const query = new PageQueryDto();
    query.pageNum = p;
    query.pageSize = l;
    return PageResult.of(list, total, query);
  }

  /**
   * 获取品牌下的商品列表（分页）
   * 只返回已上架（publishStatus=1）且未删除（deleteStatus=0）的商品
   */
  async getProductList(
    brandId: number,
    query: PageQueryDto,
  ): Promise<PageResult<ProductEntity>> {
    const [list, total] = await this.productRepo.findAndCount({
      where: {
        brandId,
        publishStatus: 1,
        deleteStatus: 0,
      },
      order: { sort: 'DESC' },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    });
    return PageResult.of(list, total, query);
  }
}
