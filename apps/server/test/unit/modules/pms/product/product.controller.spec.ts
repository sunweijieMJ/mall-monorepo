import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProductController } from '@/modules/pms/product/product.controller';

describe('ProductController', () => {
  let controller: ProductController;
  const mockService = {
    create: vi.fn(),
    delete: vi.fn(),
    findList: vi.fn(),
    findSimpleList: vi.fn(),
    updateVerifyStatus: vi.fn(),
    updatePublishStatus: vi.fn(),
    updateNewStatus: vi.fn(),
    updateRecommendStatus: vi.fn(),
    update: vi.fn(),
    getUpdateInfo: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new ProductController(mockService as any);
  });

  describe('create', () => {
    it('调用 service.create 并返回结果', async () => {
      const dto = { name: '测试商品' } as any;
      const expected = { id: 1, ...dto };
      mockService.create.mockResolvedValue(expected);

      const result = await controller.create(dto);

      expect(mockService.create).toHaveBeenCalledWith(dto);
      expect(result).toBe(expected);
    });
  });

  describe('batchDelete', () => {
    it('提取 dto.ids 调用 service.delete', async () => {
      const dto = { ids: [1, 2, 3] };
      mockService.delete.mockResolvedValue(3);

      const result = await controller.batchDelete(dto);

      expect(mockService.delete).toHaveBeenCalledWith([1, 2, 3]);
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

  describe('listSimple', () => {
    it('调用 service.findSimpleList 并返回结果', async () => {
      const expected = [{ id: 1, name: '商品A' }];
      mockService.findSimpleList.mockResolvedValue(expected);

      const result = await controller.listSimple('商品');

      expect(mockService.findSimpleList).toHaveBeenCalledWith('商品');
      expect(result).toBe(expected);
    });

    it('keyword 未传时传 undefined', async () => {
      mockService.findSimpleList.mockResolvedValue([]);

      await controller.listSimple(undefined);

      expect(mockService.findSimpleList).toHaveBeenCalledWith(undefined);
    });
  });

  describe('updateVerifyStatus', () => {
    it('从 @CurrentUser 获取用户并调用 service.updateVerifyStatus', async () => {
      const user = { sub: 1, username: 'admin' } as any;
      const dto = { ids: [1, 2], verifyStatus: 1, detail: '审核通过' };
      mockService.updateVerifyStatus.mockResolvedValue(2);

      const result = await controller.updateVerifyStatus(user, dto);

      expect(mockService.updateVerifyStatus).toHaveBeenCalledWith(
        [1, 2],
        1,
        '审核通过',
        'admin',
      );
      expect(result).toBe(2);
    });
  });

  describe('updatePublishStatus', () => {
    it('调用 service.updatePublishStatus 并返回受影响行数', async () => {
      const dto = { ids: [1, 2], status: 1 };
      mockService.updatePublishStatus.mockResolvedValue(2);

      const result = await controller.updatePublishStatus(dto);

      expect(mockService.updatePublishStatus).toHaveBeenCalledWith([1, 2], 1);
      expect(result).toBe(2);
    });
  });

  describe('updateNewStatus', () => {
    it('调用 service.updateNewStatus 并返回受影响行数', async () => {
      const dto = { ids: [1, 2], status: 1 };
      mockService.updateNewStatus.mockResolvedValue(2);

      const result = await controller.updateNewStatus(dto);

      expect(mockService.updateNewStatus).toHaveBeenCalledWith([1, 2], 1);
      expect(result).toBe(2);
    });
  });

  describe('updateRecommendStatus', () => {
    it('调用 service.updateRecommendStatus 并返回受影响行数', async () => {
      const dto = { ids: [1, 2], status: 1 };
      mockService.updateRecommendStatus.mockResolvedValue(2);

      const result = await controller.updateRecommendStatus(dto);

      expect(mockService.updateRecommendStatus).toHaveBeenCalledWith([1, 2], 1);
      expect(result).toBe(2);
    });
  });

  describe('update', () => {
    it('调用 service.update 并返回受影响行数', async () => {
      const dto = { name: '更新商品' } as any;
      mockService.update.mockResolvedValue(1);

      const result = await controller.update(1, dto);

      expect(mockService.update).toHaveBeenCalledWith(1, dto);
      expect(result).toBe(1);
    });
  });

  describe('getDetail', () => {
    it('调用 service.getUpdateInfo 并返回商品详情', async () => {
      const expected = { id: 1, name: '测试商品' };
      mockService.getUpdateInfo.mockResolvedValue(expected);

      const result = await controller.getDetail(1);

      expect(mockService.getUpdateInfo).toHaveBeenCalledWith(1);
      expect(result).toBe(expected);
    });
  });
});
