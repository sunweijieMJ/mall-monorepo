import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FlashPromotionService } from '@/modules/sms/flash-promotion/flash-promotion.service';
import {
  FlashPromotionEntity,
  FlashSessionEntity,
  FlashProductRelationEntity,
} from '@/modules/sms/flash-promotion/infrastructure/persistence/relational/entities/flash-promotion.entity';
import { ProductEntity } from '@/modules/pms/product/infrastructure/persistence/relational/entities/product.entity';
import { createMockRepository } from '../../../../helpers/mock.factory';

// ---- 测试数据 ----

const flashFixture = {
  id: 1,
  title: '618大促',
  startDate: new Date('2026-06-18'),
  endDate: new Date('2026-06-20'),
  status: 1,
  createdAt: new Date(),
} as FlashPromotionEntity;

const sessionFixture = {
  id: 1,
  name: '上午场',
  startTime: '09:00:00',
  endTime: '12:00:00',
  status: 1,
  createdAt: new Date(),
} as FlashSessionEntity;

const relationFixture = {
  id: 1,
  flashPromotionId: 1,
  flashPromotionSessionId: 1,
  productId: 10,
  flashPromotionPrice: '99.00',
  flashPromotionCount: 100,
  flashPromotionLimit: 1,
  sort: 0,
} as FlashProductRelationEntity;

const productFixture = {
  id: 10,
  name: '测试商品',
  pic: 'test.jpg',
  price: '199.00',
  productSn: 'SN001',
  stock: 500,
} as ProductEntity;

describe('FlashPromotionService', () => {
  let service: FlashPromotionService;
  const mockFlashRepo = createMockRepository();
  const mockSessionRepo = createMockRepository();
  const mockRelationRepo = createMockRepository();
  const mockProductRepo = createMockRepository();

  beforeEach(async () => {
    vi.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        FlashPromotionService,
        {
          provide: getRepositoryToken(FlashPromotionEntity),
          useValue: mockFlashRepo,
        },
        {
          provide: getRepositoryToken(FlashSessionEntity),
          useValue: mockSessionRepo,
        },
        {
          provide: getRepositoryToken(FlashProductRelationEntity),
          useValue: mockRelationRepo,
        },
        {
          provide: getRepositoryToken(ProductEntity),
          useValue: mockProductRepo,
        },
      ],
    }).compile();
    service = module.get(FlashPromotionService);
  });

  // ========== 秒杀活动 ==========

  describe('createFlash', () => {
    it('创建秒杀活动 -> 返回已保存实体', async () => {
      mockFlashRepo.save.mockResolvedValue(flashFixture);

      const result = await service.createFlash({ title: '618大促' });

      expect(mockFlashRepo.create).toHaveBeenCalled();
      expect(mockFlashRepo.save).toHaveBeenCalled();
      expect(result.title).toBe('618大促');
    });
  });

  describe('updateFlash', () => {
    it('更新秒杀活动 -> 调用 update', async () => {
      mockFlashRepo.update.mockResolvedValue({ affected: 1 });

      await service.updateFlash(1, { title: '双11大促' });

      expect(mockFlashRepo.update).toHaveBeenCalledWith(1, {
        title: '双11大促',
      });
    });
  });

  describe('deleteFlash', () => {
    it('删除秒杀活动 -> 调用 delete', async () => {
      mockFlashRepo.delete.mockResolvedValue({ affected: 1 });

      await service.deleteFlash(1);

      expect(mockFlashRepo.delete).toHaveBeenCalledWith(1);
    });
  });

  describe('updateFlashStatus', () => {
    it('更新活动状态 -> 调用 update 设置 status', async () => {
      mockFlashRepo.update.mockResolvedValue({ affected: 1 });

      await service.updateFlashStatus(1, 0);

      expect(mockFlashRepo.update).toHaveBeenCalledWith(1, { status: 0 });
    });
  });

  describe('getFlashItem', () => {
    it('获取秒杀活动详情 -> 返回实体', async () => {
      mockFlashRepo.findOneBy.mockResolvedValue(flashFixture);

      const result = await service.getFlashItem(1);

      expect(result).toEqual(flashFixture);
      expect(mockFlashRepo.findOneBy).toHaveBeenCalledWith({ id: 1 });
    });
  });

  describe('listFlash', () => {
    it('无关键词 -> 返回分页结果', async () => {
      mockFlashRepo.findAndCount.mockResolvedValue([[flashFixture], 1]);

      const result = await service.listFlash(undefined, 1, 10);

      expect(result.list).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('带关键词 -> 使用 Like 查询 title', async () => {
      mockFlashRepo.findAndCount.mockResolvedValue([[], 0]);

      await service.listFlash('618', 1, 10);

      const callArgs = mockFlashRepo.findAndCount.mock.calls[0][0];
      expect(callArgs.where.title).toBeDefined();
    });
  });

  // ========== 场次 ==========

  describe('createSession', () => {
    it('创建场次 -> 返回已保存实体', async () => {
      mockSessionRepo.save.mockResolvedValue(sessionFixture);

      const result = await service.createSession({ name: '上午场' });

      expect(mockSessionRepo.create).toHaveBeenCalled();
      expect(mockSessionRepo.save).toHaveBeenCalled();
      expect(result.name).toBe('上午场');
    });
  });

  describe('updateSession', () => {
    it('更新场次 -> 调用 update', async () => {
      mockSessionRepo.update.mockResolvedValue({ affected: 1 });

      await service.updateSession(1, { name: '下午场' });

      expect(mockSessionRepo.update).toHaveBeenCalledWith(1, {
        name: '下午场',
      });
    });
  });

  describe('deleteSession', () => {
    it('删除场次 -> 调用 delete', async () => {
      mockSessionRepo.delete.mockResolvedValue({ affected: 1 });

      await service.deleteSession(1);

      expect(mockSessionRepo.delete).toHaveBeenCalledWith(1);
    });
  });

  describe('updateSessionStatus', () => {
    it('更新场次状态 -> 调用 update 设置 status', async () => {
      mockSessionRepo.update.mockResolvedValue({ affected: 1 });

      await service.updateSessionStatus(1, 0);

      expect(mockSessionRepo.update).toHaveBeenCalledWith(1, { status: 0 });
    });
  });

  describe('getSessionItem', () => {
    it('获取场次详情 -> 返回实体', async () => {
      mockSessionRepo.findOneBy.mockResolvedValue(sessionFixture);

      const result = await service.getSessionItem(1);

      expect(result).toEqual(sessionFixture);
      expect(mockSessionRepo.findOneBy).toHaveBeenCalledWith({ id: 1 });
    });
  });

  describe('listSession', () => {
    it('获取所有场次列表 -> 返回数组', async () => {
      mockSessionRepo.find.mockResolvedValue([sessionFixture]);

      const result = await service.listSession();

      expect(result).toHaveLength(1);
      expect(mockSessionRepo.find).toHaveBeenCalled();
    });
  });

  describe('selectList', () => {
    it('查询启用场次及对应商品数量 -> 返回带 productCount 的列表', async () => {
      mockSessionRepo.find.mockResolvedValue([sessionFixture]);
      mockRelationRepo.count.mockResolvedValue(5);

      const result = await service.selectList(1);

      expect(result).toHaveLength(1);
      expect(result[0].productCount).toBe(5);
      expect(result[0].name).toBe('上午场');
      // 验证查询启用状态的场次
      expect(mockSessionRepo.find).toHaveBeenCalledWith({
        where: { status: 1 },
      });
    });
  });

  // ========== 商品关联 ==========

  describe('createRelation', () => {
    it('批量创建商品关联 -> 返回已保存列表', async () => {
      mockRelationRepo.create.mockReturnValue([relationFixture]);
      mockRelationRepo.save.mockResolvedValue([relationFixture]);

      const result = await service.createRelation([{ productId: 10 }]);

      expect(mockRelationRepo.create).toHaveBeenCalled();
      expect(mockRelationRepo.save).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });
  });

  describe('updateRelation', () => {
    it('更新商品关联 -> 调用 update', async () => {
      mockRelationRepo.update.mockResolvedValue({ affected: 1 });

      await service.updateRelation(1, { flashPromotionPrice: '59.00' });

      expect(mockRelationRepo.update).toHaveBeenCalledWith(1, {
        flashPromotionPrice: '59.00',
      });
    });
  });

  describe('deleteRelation', () => {
    it('删除商品关联 -> 调用 delete', async () => {
      mockRelationRepo.delete.mockResolvedValue({ affected: 1 });

      await service.deleteRelation(1);

      expect(mockRelationRepo.delete).toHaveBeenCalledWith(1);
    });
  });

  describe('getRelationItem', () => {
    it('获取商品关联详情 -> 返回实体', async () => {
      mockRelationRepo.findOneBy.mockResolvedValue(relationFixture);

      const result = await service.getRelationItem(1);

      expect(result).toEqual(relationFixture);
      expect(mockRelationRepo.findOneBy).toHaveBeenCalledWith({ id: 1 });
    });
  });

  describe('listRelation', () => {
    it('分页查询商品关联 -> 返回带商品信息的分页结果', async () => {
      mockRelationRepo.findAndCount.mockResolvedValue([[relationFixture], 1]);
      mockProductRepo.find.mockResolvedValue([productFixture]);

      const result = await service.listRelation(1, 1, 1, 10);

      expect(result.list).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.list[0].product).toEqual(productFixture);
    });

    it('无商品ID时 -> 不查询商品表', async () => {
      const relationNoProduct = { ...relationFixture, productId: undefined };
      mockRelationRepo.findAndCount.mockResolvedValue([[relationNoProduct], 1]);

      await service.listRelation(1, 1, 1, 10);

      expect(mockProductRepo.find).not.toHaveBeenCalled();
    });
  });

  describe('getRelationCount', () => {
    it('获取商品关联数量 -> 返回数字', async () => {
      mockRelationRepo.count.mockResolvedValue(3);

      const result = await service.getRelationCount(1, 1);

      expect(result).toBe(3);
      expect(mockRelationRepo.count).toHaveBeenCalledWith({
        where: { flashPromotionId: 1, flashPromotionSessionId: 1 },
      });
    });
  });
});
