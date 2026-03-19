import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  FlashPromotionController,
  FlashSessionController,
  FlashProductRelationController,
} from '@/modules/sms/flash-promotion/flash-promotion.controller';

const mockService = {
  createFlash: vi.fn(),
  listFlash: vi.fn(),
  updateFlashStatus: vi.fn(),
  updateFlash: vi.fn(),
  deleteFlash: vi.fn(),
  getFlashItem: vi.fn(),
  createSession: vi.fn(),
  selectList: vi.fn(),
  listSession: vi.fn(),
  updateSessionStatus: vi.fn(),
  updateSession: vi.fn(),
  deleteSession: vi.fn(),
  getSessionItem: vi.fn(),
  createRelation: vi.fn(),
  listRelation: vi.fn(),
  updateRelation: vi.fn(),
  deleteRelation: vi.fn(),
  getRelationItem: vi.fn(),
};

describe('FlashPromotionController', () => {
  let controller: FlashPromotionController;

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new FlashPromotionController(mockService as any);
  });

  describe('create', () => {
    it('调用 service.createFlash 并返回结果', async () => {
      const dto = { title: '秒杀活动' };
      const expected = { id: 1 };
      mockService.createFlash.mockResolvedValue(expected);

      const result = await controller.create(dto as any);

      expect(mockService.createFlash).toHaveBeenCalledWith(dto);
      expect(result).toBe(expected);
    });
  });

  describe('list', () => {
    it('调用 service.listFlash 并返回分页结果', async () => {
      const q = { keyword: '秒杀', page: 1, limit: 10 };
      const expected = { list: [], total: 0 };
      mockService.listFlash.mockResolvedValue(expected);

      const result = await controller.list(q as any);

      expect(mockService.listFlash).toHaveBeenCalledWith('秒杀', 1, 10);
      expect(result).toBe(expected);
    });
  });

  describe('updateStatus', () => {
    it('调用 service.updateFlashStatus 并返回受影响行数', async () => {
      const dto = { status: 1 };
      mockService.updateFlashStatus.mockResolvedValue(1);

      const result = await controller.updateStatus(1, dto as any);

      expect(mockService.updateFlashStatus).toHaveBeenCalledWith(1, 1);
      expect(result).toBe(1);
    });
  });

  describe('update', () => {
    it('调用 service.updateFlash 并返回受影响行数', async () => {
      const dto = { title: '新标题' };
      mockService.updateFlash.mockResolvedValue(1);

      const result = await controller.update(1, dto as any);

      expect(mockService.updateFlash).toHaveBeenCalledWith(1, dto);
      expect(result).toBe(1);
    });
  });

  describe('delete', () => {
    it('调用 service.deleteFlash 并返回受影响行数', async () => {
      mockService.deleteFlash.mockResolvedValue(1);

      const result = await controller.delete(1);

      expect(mockService.deleteFlash).toHaveBeenCalledWith(1);
      expect(result).toBe(1);
    });
  });

  describe('getItem', () => {
    it('调用 service.getFlashItem 并返回活动详情', async () => {
      const expected = { id: 1 };
      mockService.getFlashItem.mockResolvedValue(expected);

      const result = await controller.getItem(1);

      expect(mockService.getFlashItem).toHaveBeenCalledWith(1);
      expect(result).toBe(expected);
    });
  });
});

describe('FlashSessionController', () => {
  let controller: FlashSessionController;

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new FlashSessionController(mockService as any);
  });

  describe('create', () => {
    it('调用 service.createSession 并返回结果', async () => {
      const dto = { name: '08:00' };
      const expected = { id: 1 };
      mockService.createSession.mockResolvedValue(expected);

      const result = await controller.create(dto as any);

      expect(mockService.createSession).toHaveBeenCalledWith(dto);
      expect(result).toBe(expected);
    });
  });

  describe('listSelectable', () => {
    it('调用 service.selectList 并返回可选场次', async () => {
      const expected = [{ id: 1, productCount: 5 }];
      mockService.selectList.mockResolvedValue(expected);

      const result = await controller.listSelectable(10);

      expect(mockService.selectList).toHaveBeenCalledWith(10);
      expect(result).toBe(expected);
    });
  });

  describe('list', () => {
    it('调用 service.listSession 并返回全部场次', async () => {
      const expected = [{ id: 1 }];
      mockService.listSession.mockResolvedValue(expected);

      const result = await controller.list();

      expect(mockService.listSession).toHaveBeenCalled();
      expect(result).toBe(expected);
    });
  });

  describe('updateStatus', () => {
    it('调用 service.updateSessionStatus 并返回受影响行数', async () => {
      const dto = { status: 1 };
      mockService.updateSessionStatus.mockResolvedValue(1);

      const result = await controller.updateStatus(1, dto as any);

      expect(mockService.updateSessionStatus).toHaveBeenCalledWith(1, 1);
      expect(result).toBe(1);
    });
  });

  describe('update', () => {
    it('调用 service.updateSession 并返回受影响行数', async () => {
      const dto = { name: '10:00' };
      mockService.updateSession.mockResolvedValue(1);

      const result = await controller.update(1, dto as any);

      expect(mockService.updateSession).toHaveBeenCalledWith(1, dto);
      expect(result).toBe(1);
    });
  });

  describe('delete', () => {
    it('调用 service.deleteSession 并返回受影响行数', async () => {
      mockService.deleteSession.mockResolvedValue(1);

      const result = await controller.delete(1);

      expect(mockService.deleteSession).toHaveBeenCalledWith(1);
      expect(result).toBe(1);
    });
  });

  describe('getItem', () => {
    it('调用 service.getSessionItem 并返回场次详情', async () => {
      const expected = { id: 1 };
      mockService.getSessionItem.mockResolvedValue(expected);

      const result = await controller.getItem(1);

      expect(mockService.getSessionItem).toHaveBeenCalledWith(1);
      expect(result).toBe(expected);
    });
  });
});

describe('FlashProductRelationController', () => {
  let controller: FlashProductRelationController;

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new FlashProductRelationController(mockService as any);
  });

  describe('batchCreate', () => {
    it('调用 service.createRelation 并转换 flashPromotionPrice', async () => {
      const relationList = [
        {
          flashPromotionId: 1,
          flashPromotionSessionId: 1,
          productId: 10,
          flashPromotionPrice: 99.9,
        },
      ];
      const expected = [{ id: 1 }];
      mockService.createRelation.mockResolvedValue(expected);

      const result = await controller.batchCreate(relationList as any);

      expect(mockService.createRelation).toHaveBeenCalledWith([
        {
          flashPromotionId: 1,
          flashPromotionSessionId: 1,
          productId: 10,
          flashPromotionPrice: '99.9',
        },
      ]);
      expect(result).toBe(expected);
    });

    it('flashPromotionPrice 为 null 时转为 undefined', async () => {
      const relationList = [
        {
          flashPromotionId: 1,
          flashPromotionSessionId: 1,
          productId: 10,
          flashPromotionPrice: null,
        },
      ];
      mockService.createRelation.mockResolvedValue([{ id: 1 }]);

      await controller.batchCreate(relationList as any);

      expect(mockService.createRelation).toHaveBeenCalledWith([
        {
          flashPromotionId: 1,
          flashPromotionSessionId: 1,
          productId: 10,
          flashPromotionPrice: undefined,
        },
      ]);
    });
  });

  describe('list', () => {
    it('调用 service.listRelation 并返回分页结果', async () => {
      const q = { page: 1, limit: 10 };
      const expected = { list: [], total: 0 };
      mockService.listRelation.mockResolvedValue(expected);

      const result = await controller.list(1, 2, q as any);

      expect(mockService.listRelation).toHaveBeenCalledWith(1, 2, 1, 10);
      expect(result).toBe(expected);
    });
  });

  describe('update', () => {
    it('调用 service.updateRelation 并转换 flashPromotionPrice', async () => {
      const dto = { flashPromotionPrice: 88.8, flashPromotionCount: 100 };
      mockService.updateRelation.mockResolvedValue(1);

      const result = await controller.update(1, dto as any);

      expect(mockService.updateRelation).toHaveBeenCalledWith(1, {
        flashPromotionCount: 100,
        flashPromotionPrice: '88.8',
      });
      expect(result).toBe(1);
    });

    it('flashPromotionPrice 为 null 时不包含该字段', async () => {
      const dto = {
        flashPromotionPrice: null,
        flashPromotionCount: 50,
      } as any;
      mockService.updateRelation.mockResolvedValue(1);

      await controller.update(1, dto);

      expect(mockService.updateRelation).toHaveBeenCalledWith(1, {
        flashPromotionCount: 50,
      });
    });
  });

  describe('delete', () => {
    it('调用 service.deleteRelation 并返回受影响行数', async () => {
      mockService.deleteRelation.mockResolvedValue(1);

      const result = await controller.delete(1);

      expect(mockService.deleteRelation).toHaveBeenCalledWith(1);
      expect(result).toBe(1);
    });
  });

  describe('getItem', () => {
    it('调用 service.getRelationItem 并返回关联详情', async () => {
      const expected = { id: 1 };
      mockService.getRelationItem.mockResolvedValue(expected);

      const result = await controller.getItem(1);

      expect(mockService.getRelationItem).toHaveBeenCalledWith(1);
      expect(result).toBe(expected);
    });
  });
});
