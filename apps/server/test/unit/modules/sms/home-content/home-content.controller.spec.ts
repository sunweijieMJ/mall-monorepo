import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  HomeAdvertiseController,
  HomeBrandController,
  HomeSubjectController,
  HomeNewProductController,
  HomeRecommendProductController,
} from '@/modules/sms/home-content/home-content.controller';

const mockService = {
  createAdvertise: vi.fn(),
  deleteAdvertise: vi.fn(),
  listAdvertise: vi.fn(),
  updateAdvertiseStatus: vi.fn(),
  updateAdvertise: vi.fn(),
  getAdvertiseItem: vi.fn(),
  createHomeBrand: vi.fn(),
  deleteHomeBrand: vi.fn(),
  listHomeBrand: vi.fn(),
  updateHomeBrandStatus: vi.fn(),
  updateHomeBrandSort: vi.fn(),
  createSubject: vi.fn(),
  deleteSubject: vi.fn(),
  listSubject: vi.fn(),
  updateSubjectStatus: vi.fn(),
  updateSubjectSort: vi.fn(),
  createNewProduct: vi.fn(),
  deleteNewProduct: vi.fn(),
  listNewProduct: vi.fn(),
  updateNewProductStatus: vi.fn(),
  updateNewProductSort: vi.fn(),
  createHotProduct: vi.fn(),
  deleteHotProduct: vi.fn(),
  listHotProduct: vi.fn(),
  updateHotProductStatus: vi.fn(),
  updateHotProductSort: vi.fn(),
};

describe('HomeAdvertiseController', () => {
  let controller: HomeAdvertiseController;

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new HomeAdvertiseController(mockService as any);
  });

  describe('create', () => {
    it('调用 service.createAdvertise 并返回结果', async () => {
      const dto = { name: '广告1' };
      const expected = { id: 1 };
      mockService.createAdvertise.mockResolvedValue(expected);

      const result = await controller.create(dto as any);

      expect(mockService.createAdvertise).toHaveBeenCalledWith(dto);
      expect(result).toBe(expected);
    });
  });

  describe('batchDelete', () => {
    it('调用 service.deleteAdvertise 并传入 dto.ids', async () => {
      const dto = { ids: [1, 2] };
      mockService.deleteAdvertise.mockResolvedValue(2);

      const result = await controller.batchDelete(dto as any);

      expect(mockService.deleteAdvertise).toHaveBeenCalledWith([1, 2]);
      expect(result).toBe(2);
    });
  });

  describe('list', () => {
    it('调用 service.listAdvertise 并返回分页结果', async () => {
      const query = { page: 1, limit: 10 };
      const expected = { list: [], total: 0 };
      mockService.listAdvertise.mockResolvedValue(expected);

      const result = await controller.list(query as any);

      expect(mockService.listAdvertise).toHaveBeenCalledWith(query);
      expect(result).toBe(expected);
    });
  });

  describe('updateStatus', () => {
    it('调用 service.updateAdvertiseStatus 并返回受影响行数', async () => {
      const dto = { status: 1 };
      mockService.updateAdvertiseStatus.mockResolvedValue(1);

      const result = await controller.updateStatus(1, dto as any);

      expect(mockService.updateAdvertiseStatus).toHaveBeenCalledWith(1, 1);
      expect(result).toBe(1);
    });
  });

  describe('update', () => {
    it('调用 service.updateAdvertise 并返回受影响行数', async () => {
      const dto = { name: '更新广告' };
      mockService.updateAdvertise.mockResolvedValue(1);

      const result = await controller.update(1, dto as any);

      expect(mockService.updateAdvertise).toHaveBeenCalledWith(1, dto);
      expect(result).toBe(1);
    });
  });

  describe('getItem', () => {
    it('调用 service.getAdvertiseItem 并返回广告详情', async () => {
      const expected = { id: 1 };
      mockService.getAdvertiseItem.mockResolvedValue(expected);

      const result = await controller.getItem(1);

      expect(mockService.getAdvertiseItem).toHaveBeenCalledWith(1);
      expect(result).toBe(expected);
    });
  });
});

describe('HomeBrandController', () => {
  let controller: HomeBrandController;

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new HomeBrandController(mockService as any);
  });

  describe('batchCreate', () => {
    it('调用 service.createHomeBrand 并返回结果', async () => {
      const dto = [{ brandId: 1, brandName: '品牌A' }];
      const expected = [{ id: 1 }];
      mockService.createHomeBrand.mockResolvedValue(expected);

      const result = await controller.batchCreate(dto as any);

      expect(mockService.createHomeBrand).toHaveBeenCalledWith(dto);
      expect(result).toBe(expected);
    });
  });

  describe('batchDelete', () => {
    it('调用 service.deleteHomeBrand 并传入 dto.ids', async () => {
      const dto = { ids: [1, 2] };
      mockService.deleteHomeBrand.mockResolvedValue(2);

      const result = await controller.batchDelete(dto as any);

      expect(mockService.deleteHomeBrand).toHaveBeenCalledWith([1, 2]);
      expect(result).toBe(2);
    });
  });

  describe('list', () => {
    it('调用 service.listHomeBrand 并返回分页结果', async () => {
      const query = { page: 1, limit: 10 };
      const expected = { list: [], total: 0 };
      mockService.listHomeBrand.mockResolvedValue(expected);

      const result = await controller.list(query as any);

      expect(mockService.listHomeBrand).toHaveBeenCalledWith(query);
      expect(result).toBe(expected);
    });
  });

  describe('updateStatus', () => {
    it('调用 service.updateHomeBrandStatus 并返回受影响行数', async () => {
      const dto = { ids: [1, 2], status: 1 };
      mockService.updateHomeBrandStatus.mockResolvedValue(2);

      const result = await controller.updateStatus(dto as any);

      expect(mockService.updateHomeBrandStatus).toHaveBeenCalledWith([1, 2], 1);
      expect(result).toBe(2);
    });
  });

  describe('updateSort', () => {
    it('调用 service.updateHomeBrandSort 并返回受影响行数', async () => {
      const dto = { sort: 5 };
      mockService.updateHomeBrandSort.mockResolvedValue(1);

      const result = await controller.updateSort(1, dto as any);

      expect(mockService.updateHomeBrandSort).toHaveBeenCalledWith(1, 5);
      expect(result).toBe(1);
    });
  });
});

describe('HomeSubjectController', () => {
  let controller: HomeSubjectController;

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new HomeSubjectController(mockService as any);
  });

  describe('batchCreate', () => {
    it('调用 service.createSubject 并返回结果', async () => {
      const dto = [{ subjectId: 1 }];
      const expected = [{ id: 1 }];
      mockService.createSubject.mockResolvedValue(expected);

      const result = await controller.batchCreate(dto as any);

      expect(mockService.createSubject).toHaveBeenCalledWith(dto);
      expect(result).toBe(expected);
    });
  });

  describe('batchDelete', () => {
    it('调用 service.deleteSubject 并传入 dto.ids', async () => {
      const dto = { ids: [1, 2] };
      mockService.deleteSubject.mockResolvedValue(2);

      const result = await controller.batchDelete(dto as any);

      expect(mockService.deleteSubject).toHaveBeenCalledWith([1, 2]);
      expect(result).toBe(2);
    });
  });

  describe('list', () => {
    it('调用 service.listSubject 并返回分页结果', async () => {
      const query = { page: 1, limit: 10 };
      const expected = { list: [], total: 0 };
      mockService.listSubject.mockResolvedValue(expected);

      const result = await controller.list(query as any);

      expect(mockService.listSubject).toHaveBeenCalledWith(query);
      expect(result).toBe(expected);
    });
  });

  describe('updateStatus', () => {
    it('调用 service.updateSubjectStatus 并返回受影响行数', async () => {
      const dto = { ids: [1], status: 1 };
      mockService.updateSubjectStatus.mockResolvedValue(1);

      const result = await controller.updateStatus(dto as any);

      expect(mockService.updateSubjectStatus).toHaveBeenCalledWith([1], 1);
      expect(result).toBe(1);
    });
  });

  describe('updateSort', () => {
    it('调用 service.updateSubjectSort 并返回受影响行数', async () => {
      const dto = { sort: 3 };
      mockService.updateSubjectSort.mockResolvedValue(1);

      const result = await controller.updateSort(1, dto as any);

      expect(mockService.updateSubjectSort).toHaveBeenCalledWith(1, 3);
      expect(result).toBe(1);
    });
  });
});

describe('HomeNewProductController', () => {
  let controller: HomeNewProductController;

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new HomeNewProductController(mockService as any);
  });

  describe('batchCreate', () => {
    it('调用 service.createNewProduct 并返回结果', async () => {
      const dto = [{ productId: 1 }];
      const expected = [{ id: 1 }];
      mockService.createNewProduct.mockResolvedValue(expected);

      const result = await controller.batchCreate(dto as any);

      expect(mockService.createNewProduct).toHaveBeenCalledWith(dto);
      expect(result).toBe(expected);
    });
  });

  describe('batchDelete', () => {
    it('调用 service.deleteNewProduct 并传入 dto.ids', async () => {
      const dto = { ids: [1, 2] };
      mockService.deleteNewProduct.mockResolvedValue(2);

      const result = await controller.batchDelete(dto as any);

      expect(mockService.deleteNewProduct).toHaveBeenCalledWith([1, 2]);
      expect(result).toBe(2);
    });
  });

  describe('list', () => {
    it('调用 service.listNewProduct 并返回分页结果', async () => {
      const query = { page: 1, limit: 10 };
      const expected = { list: [], total: 0 };
      mockService.listNewProduct.mockResolvedValue(expected);

      const result = await controller.list(query as any);

      expect(mockService.listNewProduct).toHaveBeenCalledWith(query);
      expect(result).toBe(expected);
    });
  });

  describe('updateStatus', () => {
    it('调用 service.updateNewProductStatus 并返回受影响行数', async () => {
      const dto = { ids: [1], status: 1 };
      mockService.updateNewProductStatus.mockResolvedValue(1);

      const result = await controller.updateStatus(dto as any);

      expect(mockService.updateNewProductStatus).toHaveBeenCalledWith([1], 1);
      expect(result).toBe(1);
    });
  });

  describe('updateSort', () => {
    it('调用 service.updateNewProductSort 并返回受影响行数', async () => {
      const dto = { sort: 2 };
      mockService.updateNewProductSort.mockResolvedValue(1);

      const result = await controller.updateSort(1, dto as any);

      expect(mockService.updateNewProductSort).toHaveBeenCalledWith(1, 2);
      expect(result).toBe(1);
    });
  });
});

describe('HomeRecommendProductController', () => {
  let controller: HomeRecommendProductController;

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new HomeRecommendProductController(mockService as any);
  });

  describe('batchCreate', () => {
    it('调用 service.createHotProduct 并返回结果', async () => {
      const dto = [{ productId: 1 }];
      const expected = [{ id: 1 }];
      mockService.createHotProduct.mockResolvedValue(expected);

      const result = await controller.batchCreate(dto as any);

      expect(mockService.createHotProduct).toHaveBeenCalledWith(dto);
      expect(result).toBe(expected);
    });
  });

  describe('batchDelete', () => {
    it('调用 service.deleteHotProduct 并传入 dto.ids', async () => {
      const dto = { ids: [1, 2] };
      mockService.deleteHotProduct.mockResolvedValue(2);

      const result = await controller.batchDelete(dto as any);

      expect(mockService.deleteHotProduct).toHaveBeenCalledWith([1, 2]);
      expect(result).toBe(2);
    });
  });

  describe('list', () => {
    it('调用 service.listHotProduct 并返回分页结果', async () => {
      const query = { page: 1, limit: 10 };
      const expected = { list: [], total: 0 };
      mockService.listHotProduct.mockResolvedValue(expected);

      const result = await controller.list(query as any);

      expect(mockService.listHotProduct).toHaveBeenCalledWith(query);
      expect(result).toBe(expected);
    });
  });

  describe('updateStatus', () => {
    it('调用 service.updateHotProductStatus 并返回受影响行数', async () => {
      const dto = { ids: [1], status: 1 };
      mockService.updateHotProductStatus.mockResolvedValue(1);

      const result = await controller.updateStatus(dto as any);

      expect(mockService.updateHotProductStatus).toHaveBeenCalledWith([1], 1);
      expect(result).toBe(1);
    });
  });

  describe('updateSort', () => {
    it('调用 service.updateHotProductSort 并返回受影响行数', async () => {
      const dto = { sort: 1 };
      mockService.updateHotProductSort.mockResolvedValue(1);

      const result = await controller.updateSort(1, dto as any);

      expect(mockService.updateHotProductSort).toHaveBeenCalledWith(1, 1);
      expect(result).toBe(1);
    });
  });
});
