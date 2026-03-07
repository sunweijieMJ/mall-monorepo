import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HomeService } from '@/modules/portal/home/home.service';
import { HomeAdvertiseEntity } from '@/modules/sms/home-content/infrastructure/persistence/relational/entities/home-advertise.entity';
import { HomeBrandEntity } from '@/modules/sms/home-content/infrastructure/persistence/relational/entities/home-brand.entity';
import { HomeNewProductEntity } from '@/modules/sms/home-content/infrastructure/persistence/relational/entities/home-new-product.entity';
import { HomeHotProductEntity } from '@/modules/sms/home-content/infrastructure/persistence/relational/entities/home-content.entity';
import { HomeRecommendSubjectEntity } from '@/modules/sms/home-content/infrastructure/persistence/relational/entities/home-recommend-subject.entity';
import {
  FlashPromotionEntity,
  FlashProductRelationEntity,
  FlashSessionEntity,
} from '@/modules/sms/flash-promotion/infrastructure/persistence/relational/entities/flash-promotion.entity';
import { ProductEntity } from '@/modules/pms/product/infrastructure/persistence/relational/entities/product.entity';
import { createMockRepository } from '../../../../helpers/mock.factory';

describe('HomeService', () => {
  let service: HomeService;
  const mockAdvertiseRepo = createMockRepository();
  const mockBrandRepo = createMockRepository();
  const mockNewProductRepo = createMockRepository();
  const mockHotProductRepo = createMockRepository();
  const mockSubjectRepo = createMockRepository();
  const mockFlashPromotionRepo = createMockRepository();
  const mockFlashSessionRepo = createMockRepository();
  const mockFlashProductRelRepo = createMockRepository();
  const mockProductRepo = createMockRepository();

  beforeEach(async () => {
    vi.clearAllMocks();

    const module = await Test.createTestingModule({
      providers: [
        HomeService,
        {
          provide: getRepositoryToken(HomeAdvertiseEntity),
          useValue: mockAdvertiseRepo,
        },
        {
          provide: getRepositoryToken(HomeBrandEntity),
          useValue: mockBrandRepo,
        },
        {
          provide: getRepositoryToken(HomeNewProductEntity),
          useValue: mockNewProductRepo,
        },
        {
          provide: getRepositoryToken(HomeHotProductEntity),
          useValue: mockHotProductRepo,
        },
        {
          provide: getRepositoryToken(HomeRecommendSubjectEntity),
          useValue: mockSubjectRepo,
        },
        {
          provide: getRepositoryToken(FlashPromotionEntity),
          useValue: mockFlashPromotionRepo,
        },
        {
          provide: getRepositoryToken(FlashSessionEntity),
          useValue: mockFlashSessionRepo,
        },
        {
          provide: getRepositoryToken(FlashProductRelationEntity),
          useValue: mockFlashProductRelRepo,
        },
        {
          provide: getRepositoryToken(ProductEntity),
          useValue: mockProductRepo,
        },
      ],
    }).compile();

    service = module.get(HomeService);
  });

  describe('getHomeContent', () => {
    it('并行聚合 6 个模块数据', async () => {
      const banners = [{ id: 1, name: '广告1' }];
      const brands = [{ id: 1, name: '品牌1' }];
      const newProducts = [{ id: 1, name: '新品1' }];
      const hotProducts = [{ id: 1, name: '热品1' }];
      const subjects = [{ id: 1, name: '专题1' }];

      mockAdvertiseRepo.find.mockResolvedValue(banners);
      mockBrandRepo.find.mockResolvedValue(brands);
      mockNewProductRepo.find.mockResolvedValue(newProducts);
      mockHotProductRepo.find.mockResolvedValue(hotProducts);
      mockSubjectRepo.find.mockResolvedValue(subjects);
      // 无秒杀活动
      const fpQb = mockFlashPromotionRepo.createQueryBuilder();
      fpQb.getOne.mockResolvedValue(null);
      mockFlashPromotionRepo.createQueryBuilder.mockReturnValue(fpQb);

      const result = await service.getHomeContent();

      expect(result.advertiseList).toBe(banners);
      expect(result.brandList).toBe(brands);
      expect(result.newProductList).toBe(newProducts);
      expect(result.hotProductList).toBe(hotProducts);
      expect(result.subjectList).toBe(subjects);
      expect(result.homeFlashPromotion).toBeNull();
    });

    it('无秒杀活动 → homeFlashPromotion 为 null', async () => {
      mockAdvertiseRepo.find.mockResolvedValue([]);
      mockBrandRepo.find.mockResolvedValue([]);
      mockNewProductRepo.find.mockResolvedValue([]);
      mockHotProductRepo.find.mockResolvedValue([]);
      mockSubjectRepo.find.mockResolvedValue([]);
      const fpQb = mockFlashPromotionRepo.createQueryBuilder();
      fpQb.getOne.mockResolvedValue(null);
      mockFlashPromotionRepo.createQueryBuilder.mockReturnValue(fpQb);

      const result = await service.getHomeContent();

      expect(result.homeFlashPromotion).toBeNull();
    });

    it('有秒杀活动但无场次 → homeFlashPromotion 为 null', async () => {
      mockAdvertiseRepo.find.mockResolvedValue([]);
      mockBrandRepo.find.mockResolvedValue([]);
      mockNewProductRepo.find.mockResolvedValue([]);
      mockHotProductRepo.find.mockResolvedValue([]);
      mockSubjectRepo.find.mockResolvedValue([]);

      const fpQb = mockFlashPromotionRepo.createQueryBuilder();
      fpQb.getOne.mockResolvedValue({ id: 1, title: '秒杀活动', status: 1 });
      mockFlashPromotionRepo.createQueryBuilder.mockReturnValue(fpQb);

      const fsQb = mockFlashSessionRepo.createQueryBuilder();
      fsQb.getOne.mockResolvedValue(null);
      mockFlashSessionRepo.createQueryBuilder.mockReturnValue(fsQb);

      const result = await service.getHomeContent();

      expect(result.homeFlashPromotion).toBeNull();
    });

    it('有秒杀活动和场次 → 返回完整秒杀数据', async () => {
      mockAdvertiseRepo.find.mockResolvedValue([]);
      mockBrandRepo.find.mockResolvedValue([]);
      mockNewProductRepo.find.mockResolvedValue([]);
      mockHotProductRepo.find.mockResolvedValue([]);
      mockSubjectRepo.find.mockResolvedValue([]);

      const promotion = { id: 10, title: '限时秒杀', status: 1 };
      const session = {
        id: 20,
        name: '10点场',
        startTime: '10:00:00',
        endTime: '12:00:00',
      };
      const nextSession = { startTime: '14:00:00' };

      const fpQb = mockFlashPromotionRepo.createQueryBuilder();
      fpQb.getOne.mockResolvedValue(promotion);
      mockFlashPromotionRepo.createQueryBuilder.mockReturnValue(fpQb);

      // 第一次调用返回当前场次，第二次调用返回下一场次
      const fsQb = mockFlashSessionRepo.createQueryBuilder();
      fsQb.getOne
        .mockResolvedValueOnce(session)
        .mockResolvedValueOnce(nextSession);
      mockFlashSessionRepo.createQueryBuilder.mockReturnValue(fsQb);

      const relations = [
        {
          productId: 100,
          flashPromotionPrice: '99.00',
          flashPromotionCount: 50,
          flashPromotionLimit: 1,
        },
        {
          productId: 200,
          flashPromotionPrice: '199.00',
          flashPromotionCount: 30,
          flashPromotionLimit: 2,
        },
      ];
      mockFlashProductRelRepo.find.mockResolvedValue(relations);

      const products = [
        { id: 100, name: '商品A', pic: 'a.jpg', price: '199.00' },
        { id: 200, name: '商品B', pic: 'b.jpg', price: '399.00' },
      ];
      mockProductRepo.findBy.mockResolvedValue(products);

      const result = await service.getHomeContent();
      const flash = result.homeFlashPromotion as any;

      expect(flash).not.toBeNull();
      expect(flash.id).toBe(10);
      expect(flash.title).toBe('限时秒杀');
      expect(flash.sessionId).toBe(20);
      expect(flash.sessionName).toBe('10点场');
      expect(flash.nextStartTime).toBe('14:00:00');
      expect(flash.productList).toHaveLength(2);
      expect(flash.productList[0].name).toBe('商品A');
      expect(flash.productList[0].flashPromotionPrice).toBe('99.00');
    });

    it('秒杀商品为空 → productList 空数组', async () => {
      mockAdvertiseRepo.find.mockResolvedValue([]);
      mockBrandRepo.find.mockResolvedValue([]);
      mockNewProductRepo.find.mockResolvedValue([]);
      mockHotProductRepo.find.mockResolvedValue([]);
      mockSubjectRepo.find.mockResolvedValue([]);

      const fpQb = mockFlashPromotionRepo.createQueryBuilder();
      fpQb.getOne.mockResolvedValue({ id: 10, title: '秒杀' });
      mockFlashPromotionRepo.createQueryBuilder.mockReturnValue(fpQb);

      const fsQb = mockFlashSessionRepo.createQueryBuilder();
      fsQb.getOne
        .mockResolvedValueOnce({
          id: 20,
          name: '场次',
          startTime: '10:00',
          endTime: '12:00',
        })
        .mockResolvedValueOnce(null); // 无下一场
      mockFlashSessionRepo.createQueryBuilder.mockReturnValue(fsQb);

      mockFlashProductRelRepo.find.mockResolvedValue([]);
      // productIds 为空，不查 productRepo

      const result = await service.getHomeContent();
      const flash = result.homeFlashPromotion as any;

      expect(flash.productList).toEqual([]);
      expect(flash.nextStartTime).toBeNull();
      expect(mockProductRepo.findBy).not.toHaveBeenCalled();
    });
  });
});
