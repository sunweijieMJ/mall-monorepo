import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  BrandController,
  PortalBrandController,
} from '@/modules/pms/brand/brand.controller';

describe('BrandController', () => {
  let controller: BrandController;
  const mockService = {
    create: vi.fn(),
    remove: vi.fn(),
    findList: vi.fn(),
    findAll: vi.fn(),
    updateShowStatus: vi.fn(),
    updateFactoryStatus: vi.fn(),
    update: vi.fn(),
    getItem: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new BrandController(mockService as any);
  });

  describe('create', () => {
    it('调用 service.create 并返回结果', async () => {
      const dto = { name: '耐克' } as any;
      const expected = { id: 1, ...dto };
      mockService.create.mockResolvedValue(expected);

      const result = await controller.create(dto);

      expect(mockService.create).toHaveBeenCalledWith(dto);
      expect(result).toBe(expected);
    });
  });

  describe('batchDelete', () => {
    it('提取 dto.ids 调用 service.remove', async () => {
      const dto = { ids: [1, 2, 3] };
      mockService.remove.mockResolvedValue(3);

      const result = await controller.batchDelete(dto);

      expect(mockService.remove).toHaveBeenCalledWith([1, 2, 3]);
      expect(result).toBe(3);
    });
  });

  describe('list', () => {
    it('调用 service.findList 并返回分页结果', async () => {
      const query = { page: 1, limit: 10 } as any;
      const expected = { list: [], total: 0 };
      mockService.findList.mockResolvedValue(expected);

      const result = await controller.list(query);

      expect(mockService.findList).toHaveBeenCalledWith(query);
      expect(result).toBe(expected);
    });
  });

  describe('listAll', () => {
    it('调用 service.findAll 并返回全部品牌', async () => {
      const expected = [{ id: 1 }];
      mockService.findAll.mockResolvedValue(expected);

      const result = await controller.listAll();

      expect(mockService.findAll).toHaveBeenCalled();
      expect(result).toBe(expected);
    });
  });

  describe('updateShowStatus', () => {
    it('调用 service.updateShowStatus 并返回受影响行数', async () => {
      const dto = { ids: [1, 2], status: 1 };
      mockService.updateShowStatus.mockResolvedValue(2);

      const result = await controller.updateShowStatus(dto);

      expect(mockService.updateShowStatus).toHaveBeenCalledWith([1, 2], 1);
      expect(result).toBe(2);
    });
  });

  describe('updateFactoryStatus', () => {
    it('调用 service.updateFactoryStatus 并返回受影响行数', async () => {
      const dto = { ids: [1, 2], status: 1 };
      mockService.updateFactoryStatus.mockResolvedValue(2);

      const result = await controller.updateFactoryStatus(dto);

      expect(mockService.updateFactoryStatus).toHaveBeenCalledWith([1, 2], 1);
      expect(result).toBe(2);
    });
  });

  describe('update', () => {
    it('调用 service.update 并返回受影响行数', async () => {
      const dto = { name: '阿迪达斯' } as any;
      mockService.update.mockResolvedValue(1);

      const result = await controller.update(1, dto);

      expect(mockService.update).toHaveBeenCalledWith(1, dto);
      expect(result).toBe(1);
    });
  });

  describe('getItem', () => {
    it('调用 service.getItem 并返回详情', async () => {
      const expected = { id: 1, name: '耐克' };
      mockService.getItem.mockResolvedValue(expected);

      const result = await controller.getItem(1);

      expect(mockService.getItem).toHaveBeenCalledWith(1);
      expect(result).toBe(expected);
    });
  });
});

describe('PortalBrandController', () => {
  let controller: PortalBrandController;
  const mockService = {
    recommendList: vi.fn(),
    getProductList: vi.fn(),
    getItem: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new PortalBrandController(mockService as any);
  });

  describe('recommendList', () => {
    it('调用 service.recommendList 并返回分页结果', async () => {
      const query = { page: 1, limit: 10 } as any;
      const expected = { list: [], total: 0 };
      mockService.recommendList.mockResolvedValue(expected);

      const result = await controller.recommendList(query);

      expect(mockService.recommendList).toHaveBeenCalledWith(
        query.page,
        query.limit,
      );
      expect(result).toBe(expected);
    });
  });

  describe('productList', () => {
    it('调用 service.getProductList 并返回分页结果', async () => {
      const query = { page: 1, limit: 10 } as any;
      const expected = { list: [], total: 0 };
      mockService.getProductList.mockResolvedValue(expected);

      const result = await controller.productList(1, query);

      expect(mockService.getProductList).toHaveBeenCalledWith(1, query);
      expect(result).toBe(expected);
    });
  });

  describe('getItem', () => {
    it('调用 service.getItem 并返回品牌详情', async () => {
      const expected = { id: 1, name: '耐克' };
      mockService.getItem.mockResolvedValue(expected);

      const result = await controller.getItem(1);

      expect(mockService.getItem).toHaveBeenCalledWith(1);
      expect(result).toBe(expected);
    });
  });
});
