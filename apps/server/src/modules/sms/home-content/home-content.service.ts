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

  // ---- 首页广告 ----
  async listAdvertise(
    query: PageQueryDto & { name?: string; type?: number; endTime?: string },
  ): Promise<PageResult<HomeAdvertiseEntity>> {
    const qb = this.advertiseRepo.createQueryBuilder('a');

    if (query.name) {
      qb.andWhere('a.name LIKE :name', { name: `%${query.name}%` });
    }
    if (query.type != null) {
      qb.andWhere('a.type = :type', { type: query.type });
    }
    if (query.endTime) {
      const startStr = `${query.endTime} 00:00:00`;
      const endStr = `${query.endTime} 23:59:59`;
      qb.andWhere('a.endTime BETWEEN :start AND :end', {
        start: startStr,
        end: endStr,
      });
    }

    qb.orderBy('a.sort', 'DESC');
    qb.skip((query.page - 1) * query.limit).take(query.limit);

    const [list, total] = await qb.getManyAndCount();
    return PageResult.of(list, total, query);
  }

  async getAdvertiseItem(id: number): Promise<HomeAdvertiseEntity | null> {
    return this.advertiseRepo.findOneBy({ id });
  }

  async createAdvertise(
    dto: Partial<HomeAdvertiseEntity>,
  ): Promise<HomeAdvertiseEntity> {
    dto.clickCount = 0;
    dto.orderCount = 0;
    return this.advertiseRepo.save(dto);
  }

  async updateAdvertise(
    id: number,
    dto: Partial<HomeAdvertiseEntity>,
  ): Promise<void> {
    await this.advertiseRepo.update(id, dto);
  }

  async deleteAdvertise(ids: number[]): Promise<void> {
    await this.advertiseRepo.delete(ids);
  }

  async updateAdvertiseStatus(id: number, status: number): Promise<void> {
    await this.advertiseRepo.update(id, { status });
  }

  // ---- 首页品牌推荐 ----
  async listHomeBrand(
    query: PageQueryDto & {
      brandName?: string;
      recommendStatus?: number;
    },
  ): Promise<PageResult<HomeBrandEntity>> {
    const qb = this.homeBrandRepo.createQueryBuilder('b');

    if (query.brandName) {
      qb.andWhere('b.brandName LIKE :brandName', {
        brandName: `%${query.brandName}%`,
      });
    }
    if (query.recommendStatus != null) {
      qb.andWhere('b.recommendStatus = :rs', { rs: query.recommendStatus });
    }

    qb.orderBy('b.sort', 'DESC');
    qb.skip((query.page - 1) * query.limit).take(query.limit);

    const [list, total] = await qb.getManyAndCount();
    return PageResult.of(list, total, query);
  }

  async createHomeBrand(
    list: Partial<HomeBrandEntity>[],
  ): Promise<HomeBrandEntity[]> {
    const entities = list.map((item) => {
      return this.homeBrandRepo.create({
        ...item,
        recommendStatus: 1,
        sort: 0,
      });
    });
    return this.homeBrandRepo.save(entities);
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

  // ---- 首页专题推荐 ----
  async listSubject(
    query: PageQueryDto & {
      subjectName?: string;
      recommendStatus?: number;
    },
  ): Promise<PageResult<HomeSubjectEntity>> {
    const qb = this.subjectRepo.createQueryBuilder('s');

    if (query.subjectName) {
      qb.andWhere('s.subjectName LIKE :subjectName', {
        subjectName: `%${query.subjectName}%`,
      });
    }
    if (query.recommendStatus != null) {
      qb.andWhere('s.recommendStatus = :rs', { rs: query.recommendStatus });
    }

    qb.orderBy('s.sort', 'DESC');
    qb.skip((query.page - 1) * query.limit).take(query.limit);

    const [list, total] = await qb.getManyAndCount();
    return PageResult.of(list, total, query);
  }

  async createSubject(
    list: Partial<HomeSubjectEntity>[],
  ): Promise<HomeSubjectEntity[]> {
    const entities = list.map((item) => {
      return this.subjectRepo.create({
        ...item,
        recommendStatus: 1,
        sort: 0,
      });
    });
    return this.subjectRepo.save(entities);
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

  // ---- 新品推荐 ----
  async listNewProduct(
    query: PageQueryDto & {
      productName?: string;
      recommendStatus?: number;
    },
  ): Promise<PageResult<HomeNewProductEntity>> {
    const qb = this.newProductRepo.createQueryBuilder('p');

    if (query.productName) {
      qb.andWhere('p.productName LIKE :productName', {
        productName: `%${query.productName}%`,
      });
    }
    if (query.recommendStatus != null) {
      qb.andWhere('p.recommendStatus = :rs', { rs: query.recommendStatus });
    }

    qb.orderBy('p.sort', 'DESC');
    qb.skip((query.page - 1) * query.limit).take(query.limit);

    const [list, total] = await qb.getManyAndCount();
    return PageResult.of(list, total, query);
  }

  async createNewProduct(
    list: Partial<HomeNewProductEntity>[],
  ): Promise<HomeNewProductEntity[]> {
    const entities = list.map((item) => {
      return this.newProductRepo.create({
        ...item,
        recommendStatus: 1,
        sort: 0,
      });
    });
    return this.newProductRepo.save(entities);
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

  // ---- 人气推荐 ----
  async listHotProduct(
    query: PageQueryDto & {
      productName?: string;
      recommendStatus?: number;
    },
  ): Promise<PageResult<HomeHotProductEntity>> {
    const qb = this.hotProductRepo.createQueryBuilder('p');

    if (query.productName) {
      qb.andWhere('p.productName LIKE :productName', {
        productName: `%${query.productName}%`,
      });
    }
    if (query.recommendStatus != null) {
      qb.andWhere('p.recommendStatus = :rs', { rs: query.recommendStatus });
    }

    qb.orderBy('p.sort', 'DESC');
    qb.skip((query.page - 1) * query.limit).take(query.limit);

    const [list, total] = await qb.getManyAndCount();
    return PageResult.of(list, total, query);
  }

  async createHotProduct(
    list: Partial<HomeHotProductEntity>[],
  ): Promise<HomeHotProductEntity[]> {
    const entities = list.map((item) => {
      return this.hotProductRepo.create({
        ...item,
        recommendStatus: 1,
        sort: 0,
      });
    });
    return this.hotProductRepo.save(entities);
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
