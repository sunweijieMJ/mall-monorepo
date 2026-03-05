import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BrandEntity } from './infrastructure/persistence/relational/entities/brand.entity';
import { CreateBrandDto } from './dto/create-brand.dto';
import { QueryBrandDto } from './dto/query-brand.dto';
import { PageResult } from '@/common/dto/page-result.dto';

@Injectable()
export class BrandService {
  constructor(
    @InjectRepository(BrandEntity)
    private readonly brandRepo: Repository<BrandEntity>,
  ) {}

  /**
   * 获取品牌列表（分页）
   * TODO: 迁移自 PmsBrandServiceImpl.listBrand()
   *   - 支持 keyword 模糊搜索 name
   *   - 按 sort 升序、id 降序
   */
  async findList(query: QueryBrandDto): Promise<PageResult<BrandEntity>> {
    // TODO: implement
    const [list, total] = await this.brandRepo.findAndCount({
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      order: { sort: 'ASC', id: 'DESC' },
    });
    return PageResult.of(list, total, query);
  }

  /**
   * 获取全部品牌（不分页，用于选择器）
   * TODO: 迁移自 PmsBrandServiceImpl.listAllBrand()
   */
  async findAll(): Promise<BrandEntity[]> {
    // TODO: implement
    return this.brandRepo.find({
      where: { showStatus: 1 },
      order: { sort: 'ASC' },
    });
  }

  /**
   * 创建品牌
   * TODO: 迁移自 PmsBrandServiceImpl.createBrand()
   */
  async create(dto: CreateBrandDto): Promise<BrandEntity> {
    // TODO: implement
    const entity = this.brandRepo.create(dto);
    return this.brandRepo.save(entity);
  }

  /**
   * 更新品牌
   * TODO: 迁移自 PmsBrandServiceImpl.updateBrand()
   */
  async update(id: number, dto: Partial<CreateBrandDto>): Promise<BrandEntity> {
    // TODO: implement
    await this.brandRepo.update(id, dto);
    const brand = await this.brandRepo.findOneBy({ id });
    if (!brand) throw new NotFoundException(`品牌 ${id} 不存在`);
    return brand;
  }

  /**
   * 删除品牌
   * TODO: 迁移自 PmsBrandServiceImpl.deleteBrand()
   */
  async remove(ids: number[]): Promise<void> {
    // TODO: implement（检查是否有关联商品）
    await this.brandRepo.delete(ids);
  }

  /**
   * 更新显示状态
   * TODO: 迁移自 PmsBrandServiceImpl.updateShowStatus()
   */
  async updateShowStatus(ids: number[], showStatus: number): Promise<void> {
    // TODO: implement
    await this.brandRepo
      .createQueryBuilder()
      .update()
      .set({ showStatus })
      .whereInIds(ids)
      .execute();
  }

  /**
   * 更新厂家制造商状态
   * TODO: 迁移自 PmsBrandServiceImpl.updateFactoryStatus()
   */
  async updateFactoryStatus(
    ids: number[],
    factoryStatus: number,
  ): Promise<void> {
    // TODO: implement
    await this.brandRepo
      .createQueryBuilder()
      .update()
      .set({ factoryStatus })
      .whereInIds(ids)
      .execute();
  }
}
