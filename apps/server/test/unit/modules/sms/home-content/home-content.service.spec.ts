import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HomeContentService } from '@/modules/sms/home-content/home-content.service';
import {
  HomeAdvertiseEntity,
  HomeBrandEntity,
  HomeSubjectEntity,
  HomeNewProductEntity,
  HomeHotProductEntity,
} from '@/modules/sms/home-content/infrastructure/persistence/relational/entities/home-content.entity';
import { createMockRepository } from '../../../../helpers/mock.factory';

// ---- 测试数据 ----

const advertiseFixture = {
  id: 1,
  name: '春季促销',
  type: 0,
  pic: 'ad.jpg',
  status: 1,
  clickCount: 0,
  orderCount: 0,
  sort: 100,
} as HomeAdvertiseEntity;

const homeBrandFixture = {
  id: 1,
  brandId: 10,
  brandName: 'Nike',
  recommendStatus: 1,
  sort: 100,
} as HomeBrandEntity;

const subjectFixture = {
  id: 1,
  subjectId: 20,
  subjectName: '夏日特惠',
  recommendStatus: 1,
  sort: 50,
} as HomeSubjectEntity;

const newProductFixture = {
  id: 1,
  productId: 30,
  productName: '新品手机',
  recommendStatus: 1,
  sort: 80,
} as HomeNewProductEntity;

const hotProductFixture = {
  id: 1,
  productId: 40,
  productName: '热销耳机',
  recommendStatus: 1,
  sort: 90,
} as HomeHotProductEntity;

// ---- 辅助函数：创建带链式 QueryBuilder mock ----
// 每次调用 setupQueryBuilder 都会覆盖 mockRepo.createQueryBuilder，使其返回同一个 qb 对象
function setupQueryBuilder(
  mockRepo: Record<string, any>,
  data: any[],
  total: number,
) {
  const qb: Record<string, any> = {};
  qb.andWhere = vi.fn().mockReturnValue(qb);
  qb.orderBy = vi.fn().mockReturnValue(qb);
  qb.skip = vi.fn().mockReturnValue(qb);
  qb.take = vi.fn().mockReturnValue(qb);
  qb.getManyAndCount = vi.fn().mockResolvedValue([data, total]);
  // QueryBuilder 的 update 链（用于批量状态更新）
  qb.update = vi.fn().mockReturnValue(qb);
  qb.set = vi.fn().mockReturnValue(qb);
  qb.whereInIds = vi.fn().mockReturnValue(qb);
  qb.where = vi.fn().mockReturnValue(qb);
  qb.execute = vi.fn().mockResolvedValue({ affected: total });
  // 覆盖 createQueryBuilder，使源码调用时拿到同一个 qb
  mockRepo.createQueryBuilder = vi.fn().mockReturnValue(qb);
  return qb;
}

describe('HomeContentService', () => {
  let service: HomeContentService;
  const mockAdvertiseRepo = createMockRepository();
  const mockHomeBrandRepo = createMockRepository();
  const mockSubjectRepo = createMockRepository();
  const mockNewProductRepo = createMockRepository();
  const mockHotProductRepo = createMockRepository();

  beforeEach(async () => {
    vi.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        HomeContentService,
        {
          provide: getRepositoryToken(HomeAdvertiseEntity),
          useValue: mockAdvertiseRepo,
        },
        {
          provide: getRepositoryToken(HomeBrandEntity),
          useValue: mockHomeBrandRepo,
        },
        {
          provide: getRepositoryToken(HomeSubjectEntity),
          useValue: mockSubjectRepo,
        },
        {
          provide: getRepositoryToken(HomeNewProductEntity),
          useValue: mockNewProductRepo,
        },
        {
          provide: getRepositoryToken(HomeHotProductEntity),
          useValue: mockHotProductRepo,
        },
      ],
    }).compile();
    service = module.get(HomeContentService);
  });

  // ========== 首页广告 ==========

  describe('listAdvertise', () => {
    it('无过滤条件 -> 返回分页结果', async () => {
      setupQueryBuilder(mockAdvertiseRepo, [advertiseFixture], 1);

      const result = await service.listAdvertise({ page: 1, limit: 10 } as any);

      expect(result.list).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('带 name 过滤 -> 调用 andWhere', async () => {
      const qb = setupQueryBuilder(mockAdvertiseRepo, [], 0);

      await service.listAdvertise({ page: 1, limit: 10, name: '春季' } as any);

      expect(qb.andWhere).toHaveBeenCalledWith('a.name LIKE :name', {
        name: '%春季%',
      });
    });

    it('带 type 过滤 -> 调用 andWhere', async () => {
      const qb = setupQueryBuilder(mockAdvertiseRepo, [], 0);

      await service.listAdvertise({ page: 1, limit: 10, type: 0 } as any);

      expect(qb.andWhere).toHaveBeenCalledWith('a.type = :type', { type: 0 });
    });
  });

  describe('getAdvertiseItem', () => {
    it('获取广告详情 -> 返回实体', async () => {
      mockAdvertiseRepo.findOneBy.mockResolvedValue(advertiseFixture);

      const result = await service.getAdvertiseItem(1);

      expect(result).toEqual(advertiseFixture);
    });
  });

  describe('createAdvertise', () => {
    it('创建广告 -> clickCount 和 orderCount 初始化为 0', async () => {
      mockAdvertiseRepo.save.mockResolvedValue(advertiseFixture);

      const dto: any = { name: '春季促销' };
      await service.createAdvertise(dto);

      expect(dto.clickCount).toBe(0);
      expect(dto.orderCount).toBe(0);
      expect(mockAdvertiseRepo.save).toHaveBeenCalled();
    });
  });

  describe('updateAdvertise', () => {
    it('更新广告 -> 调用 update', async () => {
      mockAdvertiseRepo.update.mockResolvedValue({ affected: 1 });

      await service.updateAdvertise(1, { name: '秋季促销' });

      expect(mockAdvertiseRepo.update).toHaveBeenCalledWith(1, {
        name: '秋季促销',
      });
    });
  });

  describe('deleteAdvertise', () => {
    it('批量删除广告 -> 调用 delete', async () => {
      mockAdvertiseRepo.delete.mockResolvedValue({ affected: 2 });

      await service.deleteAdvertise([1, 2]);

      expect(mockAdvertiseRepo.delete).toHaveBeenCalledWith([1, 2]);
    });
  });

  describe('updateAdvertiseStatus', () => {
    it('更新广告状态 -> 调用 update', async () => {
      mockAdvertiseRepo.update.mockResolvedValue({ affected: 1 });

      await service.updateAdvertiseStatus(1, 0);

      expect(mockAdvertiseRepo.update).toHaveBeenCalledWith(1, { status: 0 });
    });
  });

  // ========== 首页品牌推荐 ==========

  describe('listHomeBrand', () => {
    it('无过滤条件 -> 返回分页结果', async () => {
      setupQueryBuilder(mockHomeBrandRepo, [homeBrandFixture], 1);

      const result = await service.listHomeBrand({ page: 1, limit: 10 } as any);

      expect(result.list).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('带 brandName 过滤 -> 调用 andWhere', async () => {
      const qb = setupQueryBuilder(mockHomeBrandRepo, [], 0);

      await service.listHomeBrand({
        page: 1,
        limit: 10,
        brandName: 'Nike',
      } as any);

      expect(qb.andWhere).toHaveBeenCalledWith('b.brandName LIKE :brandName', {
        brandName: '%Nike%',
      });
    });

    it('带 recommendStatus 过滤 -> 调用 andWhere', async () => {
      const qb = setupQueryBuilder(mockHomeBrandRepo, [], 0);

      await service.listHomeBrand({
        page: 1,
        limit: 10,
        recommendStatus: 1,
      } as any);

      expect(qb.andWhere).toHaveBeenCalledWith('b.recommendStatus = :rs', {
        rs: 1,
      });
    });
  });

  describe('createHomeBrand', () => {
    it('批量创建品牌推荐 -> 默认 recommendStatus=1, sort=0', async () => {
      mockHomeBrandRepo.create.mockImplementation((dto: any) => dto);
      mockHomeBrandRepo.save.mockResolvedValue([homeBrandFixture]);

      const result = await service.createHomeBrand([
        { brandId: 10, brandName: 'Nike' },
      ]);

      expect(result).toHaveLength(1);
      const createArg = mockHomeBrandRepo.create.mock.calls[0][0];
      expect(createArg.recommendStatus).toBe(1);
      expect(createArg.sort).toBe(0);
    });
  });

  describe('updateHomeBrandStatus', () => {
    it('批量更新品牌推荐状态 -> 通过 QueryBuilder 执行', async () => {
      const qb = setupQueryBuilder(mockHomeBrandRepo, [], 0);

      await service.updateHomeBrandStatus([1, 2], 0);

      expect(mockHomeBrandRepo.createQueryBuilder).toHaveBeenCalled();
      expect(qb.execute).toHaveBeenCalled();
    });
  });

  describe('updateHomeBrandSort', () => {
    it('更新品牌推荐排序 -> 调用 update', async () => {
      mockHomeBrandRepo.update.mockResolvedValue({ affected: 1 });

      await service.updateHomeBrandSort(1, 50);

      expect(mockHomeBrandRepo.update).toHaveBeenCalledWith(1, { sort: 50 });
    });
  });

  describe('deleteHomeBrand', () => {
    it('批量删除品牌推荐 -> 调用 delete', async () => {
      mockHomeBrandRepo.delete.mockResolvedValue({ affected: 2 });

      await service.deleteHomeBrand([1, 2]);

      expect(mockHomeBrandRepo.delete).toHaveBeenCalledWith([1, 2]);
    });
  });

  // ========== 首页专题推荐 ==========

  describe('listSubject', () => {
    it('无过滤条件 -> 返回分页结果', async () => {
      setupQueryBuilder(mockSubjectRepo, [subjectFixture], 1);

      const result = await service.listSubject({ page: 1, limit: 10 } as any);

      expect(result.list).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('带 subjectName 过滤 -> 调用 andWhere', async () => {
      const qb = setupQueryBuilder(mockSubjectRepo, [], 0);

      await service.listSubject({
        page: 1,
        limit: 10,
        subjectName: '夏日',
      } as any);

      expect(qb.andWhere).toHaveBeenCalledWith(
        's.subjectName LIKE :subjectName',
        { subjectName: '%夏日%' },
      );
    });
  });

  describe('createSubject', () => {
    it('批量创建专题推荐 -> 默认 recommendStatus=1, sort=0', async () => {
      mockSubjectRepo.create.mockImplementation((dto: any) => dto);
      mockSubjectRepo.save.mockResolvedValue([subjectFixture]);

      const result = await service.createSubject([
        { subjectId: 20, subjectName: '夏日特惠' },
      ]);

      expect(result).toHaveLength(1);
      const createArg = mockSubjectRepo.create.mock.calls[0][0];
      expect(createArg.recommendStatus).toBe(1);
      expect(createArg.sort).toBe(0);
    });
  });

  describe('deleteSubject', () => {
    it('批量删除专题推荐 -> 调用 delete', async () => {
      mockSubjectRepo.delete.mockResolvedValue({ affected: 1 });

      await service.deleteSubject([1]);

      expect(mockSubjectRepo.delete).toHaveBeenCalledWith([1]);
    });
  });

  describe('updateSubjectStatus', () => {
    it('批量更新专题推荐状态 -> 通过 QueryBuilder 执行', async () => {
      const qb = setupQueryBuilder(mockSubjectRepo, [], 0);

      await service.updateSubjectStatus([1, 2], 1);

      expect(mockSubjectRepo.createQueryBuilder).toHaveBeenCalled();
      expect(qb.execute).toHaveBeenCalled();
    });
  });

  describe('updateSubjectSort', () => {
    it('更新专题推荐排序 -> 调用 update', async () => {
      mockSubjectRepo.update.mockResolvedValue({ affected: 1 });

      await service.updateSubjectSort(1, 30);

      expect(mockSubjectRepo.update).toHaveBeenCalledWith(1, { sort: 30 });
    });
  });

  // ========== 新品推荐 ==========

  describe('listNewProduct', () => {
    it('无过滤条件 -> 返回分页结果', async () => {
      setupQueryBuilder(mockNewProductRepo, [newProductFixture], 1);

      const result = await service.listNewProduct({
        page: 1,
        limit: 10,
      } as any);

      expect(result.list).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('带 productName 过滤 -> 调用 andWhere', async () => {
      const qb = setupQueryBuilder(mockNewProductRepo, [], 0);

      await service.listNewProduct({
        page: 1,
        limit: 10,
        productName: '手机',
      } as any);

      expect(qb.andWhere).toHaveBeenCalledWith(
        'p.productName LIKE :productName',
        { productName: '%手机%' },
      );
    });

    it('带 recommendStatus 过滤 -> 调用 andWhere', async () => {
      const qb = setupQueryBuilder(mockNewProductRepo, [], 0);

      await service.listNewProduct({
        page: 1,
        limit: 10,
        recommendStatus: 1,
      } as any);

      expect(qb.andWhere).toHaveBeenCalledWith('p.recommendStatus = :rs', {
        rs: 1,
      });
    });
  });

  describe('createNewProduct', () => {
    it('批量创建新品推荐 -> 默认 recommendStatus=1, sort=0', async () => {
      mockNewProductRepo.create.mockImplementation((dto: any) => dto);
      mockNewProductRepo.save.mockResolvedValue([newProductFixture]);

      const result = await service.createNewProduct([
        { productId: 30, productName: '新品手机' },
      ]);

      expect(result).toHaveLength(1);
      const createArg = mockNewProductRepo.create.mock.calls[0][0];
      expect(createArg.recommendStatus).toBe(1);
      expect(createArg.sort).toBe(0);
    });
  });

  describe('deleteNewProduct', () => {
    it('批量删除新品推荐 -> 调用 delete', async () => {
      mockNewProductRepo.delete.mockResolvedValue({ affected: 2 });

      await service.deleteNewProduct([1, 2]);

      expect(mockNewProductRepo.delete).toHaveBeenCalledWith([1, 2]);
    });
  });

  describe('updateNewProductStatus', () => {
    it('批量更新新品推荐状态 -> 通过 QueryBuilder 执行', async () => {
      const qb = setupQueryBuilder(mockNewProductRepo, [], 0);

      await service.updateNewProductStatus([1, 2], 0);

      expect(mockNewProductRepo.createQueryBuilder).toHaveBeenCalled();
      expect(qb.execute).toHaveBeenCalled();
    });
  });

  describe('updateNewProductSort', () => {
    it('更新新品推荐排序 -> 调用 update', async () => {
      mockNewProductRepo.update.mockResolvedValue({ affected: 1 });

      await service.updateNewProductSort(1, 60);

      expect(mockNewProductRepo.update).toHaveBeenCalledWith(1, { sort: 60 });
    });
  });

  // ========== 人气推荐 ==========

  describe('listHotProduct', () => {
    it('无过滤条件 -> 返回分页结果', async () => {
      setupQueryBuilder(mockHotProductRepo, [hotProductFixture], 1);

      const result = await service.listHotProduct({
        page: 1,
        limit: 10,
      } as any);

      expect(result.list).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('带 productName 过滤 -> 调用 andWhere', async () => {
      const qb = setupQueryBuilder(mockHotProductRepo, [], 0);

      await service.listHotProduct({
        page: 1,
        limit: 10,
        productName: '耳机',
      } as any);

      expect(qb.andWhere).toHaveBeenCalledWith(
        'p.productName LIKE :productName',
        { productName: '%耳机%' },
      );
    });

    it('带 recommendStatus 过滤 -> 调用 andWhere', async () => {
      const qb = setupQueryBuilder(mockHotProductRepo, [], 0);

      await service.listHotProduct({
        page: 1,
        limit: 10,
        recommendStatus: 0,
      } as any);

      expect(qb.andWhere).toHaveBeenCalledWith('p.recommendStatus = :rs', {
        rs: 0,
      });
    });
  });

  describe('createHotProduct', () => {
    it('批量创建人气推荐 -> 默认 recommendStatus=1, sort=0', async () => {
      mockHotProductRepo.create.mockImplementation((dto: any) => dto);
      mockHotProductRepo.save.mockResolvedValue([hotProductFixture]);

      const result = await service.createHotProduct([
        { productId: 40, productName: '热销耳机' },
      ]);

      expect(result).toHaveLength(1);
      const createArg = mockHotProductRepo.create.mock.calls[0][0];
      expect(createArg.recommendStatus).toBe(1);
      expect(createArg.sort).toBe(0);
    });
  });

  describe('deleteHotProduct', () => {
    it('批量删除人气推荐 -> 调用 delete', async () => {
      mockHotProductRepo.delete.mockResolvedValue({ affected: 2 });

      await service.deleteHotProduct([1, 2]);

      expect(mockHotProductRepo.delete).toHaveBeenCalledWith([1, 2]);
    });
  });

  describe('updateHotProductStatus', () => {
    it('批量更新人气推荐状态 -> 通过 QueryBuilder 执行', async () => {
      const qb = setupQueryBuilder(mockHotProductRepo, [], 0);

      await service.updateHotProductStatus([1, 2], 1);

      expect(mockHotProductRepo.createQueryBuilder).toHaveBeenCalled();
      expect(qb.execute).toHaveBeenCalled();
    });
  });

  describe('updateHotProductSort', () => {
    it('更新人气推荐排序 -> 调用 update', async () => {
      mockHotProductRepo.update.mockResolvedValue({ affected: 1 });

      await service.updateHotProductSort(1, 70);

      expect(mockHotProductRepo.update).toHaveBeenCalledWith(1, { sort: 70 });
    });
  });
});
