import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  HomeAdvertiseEntity,
  HomeBrandEntity,
  HomeSubjectEntity,
  HomeNewProductEntity,
  HomeHotProductEntity,
} from './infrastructure/persistence/relational/entities/home-content.entity';
import { PageQueryDto, PageResult } from '@/common/dto/page-result.dto';

@Injectable()
export class HomeContentService {
  constructor(
    @InjectRepository(HomeAdvertiseEntity)
    private readonly advertiseRepo: Repository<HomeAdvertiseEntity>,
    @InjectRepository(HomeBrandEntity)
    private readonly homeBrandRepo: Repository<HomeBrandEntity>,
    @InjectRepository(HomeSubjectEntity)
    private readonly subjectRepo: Repository<HomeSubjectEntity>,
    @InjectRepository(HomeNewProductEntity)
    private readonly newProductRepo: Repository<HomeNewProductEntity>,
    @InjectRepository(HomeHotProductEntity)
    private readonly hotProductRepo: Repository<HomeHotProductEntity>,
  ) {}

  // ---- 首页广告 TODO: 迁移自 SmsHomeAdvertiseServiceImpl ----
  async listAdvertise(
    query: PageQueryDto & any,
  ): Promise<PageResult<HomeAdvertiseEntity>> {
    const [list, total] = await this.advertiseRepo.findAndCount({
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    });
    return PageResult.of(list, total, query);
  }

  async createAdvertise(dto: any): Promise<HomeAdvertiseEntity> {
    return this.advertiseRepo.save(dto);
  }
  async updateAdvertise(id: number, dto: any): Promise<void> {
    await this.advertiseRepo.update(id, dto);
  }
  async deleteAdvertise(ids: number[]): Promise<void> {
    await this.advertiseRepo.delete(ids);
  }
  async updateAdvertiseStatus(ids: number[], status: number): Promise<void> {
    await this.advertiseRepo
      .createQueryBuilder()
      .update()
      .set({ status })
      .whereInIds(ids)
      .execute();
  }

  // ---- 首页品牌推荐 TODO: 迁移自 SmsHomeBrandServiceImpl ----
  async listHomeBrand(
    query: PageQueryDto & any,
  ): Promise<PageResult<HomeBrandEntity>> {
    const [list, total] = await this.homeBrandRepo.findAndCount({
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      order: { sort: 'ASC' },
    });
    return PageResult.of(list, total, query);
  }

  async createHomeBrand(dto: any): Promise<HomeBrandEntity[]> {
    // TODO: 批量创建，关联品牌名
    throw new Error('TODO: HomeContentService.createHomeBrand');
  }

  async updateHomeBrandStatus(ids: number[], status: number): Promise<void> {
    await this.homeBrandRepo
      .createQueryBuilder()
      .update()
      .set({ recommendStatus: status })
      .whereInIds(ids)
      .execute();
  }

  async updateHomeBrandSort(id: number, sort: number): Promise<void> {
    await this.homeBrandRepo.update(id, { sort });
  }
  async deleteHomeBrand(ids: number[]): Promise<void> {
    await this.homeBrandRepo.delete(ids);
  }

  // ---- 首页专题 TODO ----
  async listSubject(
    query: PageQueryDto & any,
  ): Promise<PageResult<HomeSubjectEntity>> {
    const [list, total] = await this.subjectRepo.findAndCount({
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    });
    return PageResult.of(list, total, query);
  }

  async createSubject(dto: any[]): Promise<any> {
    throw new Error('TODO');
  }
  async deleteSubject(ids: number[]): Promise<void> {
    await this.subjectRepo.delete(ids);
  }
  async updateSubjectStatus(ids: number[], status: number): Promise<void> {
    await this.subjectRepo
      .createQueryBuilder()
      .update()
      .set({ recommendStatus: status })
      .whereInIds(ids)
      .execute();
  }

  async updateSubjectSort(id: number, sort: number): Promise<void> {
    await this.subjectRepo.update(id, { sort });
  }

  // ---- 新品 TODO ----
  async listNewProduct(
    query: PageQueryDto & any,
  ): Promise<PageResult<HomeNewProductEntity>> {
    const [list, total] = await this.newProductRepo.findAndCount({
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    });
    return PageResult.of(list, total, query);
  }

  async createNewProduct(dto: any[]): Promise<any> {
    throw new Error('TODO');
  }
  async deleteNewProduct(ids: number[]): Promise<void> {
    await this.newProductRepo.delete(ids);
  }
  async updateNewProductStatus(ids: number[], status: number): Promise<void> {
    await this.newProductRepo
      .createQueryBuilder()
      .update()
      .set({ recommendStatus: status })
      .whereInIds(ids)
      .execute();
  }

  async updateNewProductSort(id: number, sort: number): Promise<void> {
    await this.newProductRepo.update(id, { sort });
  }

  // ---- 热品 TODO ----
  async listHotProduct(
    query: PageQueryDto & any,
  ): Promise<PageResult<HomeHotProductEntity>> {
    const [list, total] = await this.hotProductRepo.findAndCount({
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    });
    return PageResult.of(list, total, query);
  }

  async createHotProduct(dto: any[]): Promise<any> {
    throw new Error('TODO');
  }
  async deleteHotProduct(ids: number[]): Promise<void> {
    await this.hotProductRepo.delete(ids);
  }
  async updateHotProductStatus(ids: number[], status: number): Promise<void> {
    await this.hotProductRepo
      .createQueryBuilder()
      .update()
      .set({ recommendStatus: status })
      .whereInIds(ids)
      .execute();
  }

  async updateHotProductSort(id: number, sort: number): Promise<void> {
    await this.hotProductRepo.update(id, { sort });
  }
}
