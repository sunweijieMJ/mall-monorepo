import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductCategoryService } from '@/modules/pms/product-category/product-category.service';
import { ProductCategoryEntity } from '@/modules/pms/product-category/infrastructure/persistence/relational/entities/product-category.entity';
import { createMockRepository } from '../../../../helpers/mock.factory';

// ---- 测试数据 ----

const level0Category = {
  id: 1,
  parentId: 0,
  name: '服装',
  level: 0,
  productCount: 10,
  productUnit: '件',
  navStatus: 1,
  showStatus: 1,
  sort: 100,
} as ProductCategoryEntity;

const level1Category = {
  id: 2,
  parentId: 1,
  name: 'T恤',
  level: 1,
  productCount: 5,
  productUnit: '件',
  navStatus: 0,
  showStatus: 1,
  sort: 50,
} as ProductCategoryEntity;

describe('ProductCategoryService', () => {
  let service: ProductCategoryService;
  const mockCategoryRepo = createMockRepository();

  beforeEach(async () => {
    vi.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        ProductCategoryService,
        {
          provide: getRepositoryToken(ProductCategoryEntity),
          useValue: mockCategoryRepo,
        },
      ],
    }).compile();
    service = module.get(ProductCategoryService);
  });

  describe('getList', () => {
    it('按 parentId 分页查询 -> 返回分页结果', async () => {
      mockCategoryRepo.findAndCount.mockResolvedValue([[level0Category], 1]);

      const result = await service.getList(0, {
        pageNum: 1,
        pageSize: 10,
      } as any);

      expect(result.list).toHaveLength(1);
      expect(result.total).toBe(1);
      const callArgs = mockCategoryRepo.findAndCount.mock.calls[0][0];
      expect(callArgs.where.parentId).toBe(0);
      expect(callArgs.order.sort).toBe('DESC');
    });
  });

  describe('listWithChildren', () => {
    it('返回一级分类及其子分类 -> 树形结构', async () => {
      mockCategoryRepo.find.mockResolvedValue([level0Category, level1Category]);

      const result = await service.listWithChildren();

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('服装');
      expect(result[0].children).toHaveLength(1);
      expect(result[0].children[0].name).toBe('T恤');
    });
  });

  describe('getItem', () => {
    it('存在 -> 返回分类', async () => {
      mockCategoryRepo.findOneBy.mockResolvedValue(level0Category);

      const result = await service.getItem(1);

      expect(result.name).toBe('服装');
    });

    it('不存在 -> 404', async () => {
      mockCategoryRepo.findOneBy.mockResolvedValue(null);

      await expect(service.getItem(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('parentId 为 0 -> level 设置为 0', async () => {
      mockCategoryRepo.save.mockResolvedValue(level0Category);

      await service.create({ name: '服装', parentId: 0 });

      const savedArg = mockCategoryRepo.create.mock.calls[0][0];
      expect(savedArg.level).toBe(0);
      expect(savedArg.productCount).toBe(0);
    });

    it('parentId 非 0 -> level 为 parent.level + 1', async () => {
      mockCategoryRepo.findOneBy.mockResolvedValue(level0Category);
      mockCategoryRepo.save.mockResolvedValue(level1Category);

      await service.create({ name: 'T恤', parentId: 1 });

      const savedArg = mockCategoryRepo.create.mock.calls[0][0];
      expect(savedArg.level).toBe(1);
    });
  });

  describe('update', () => {
    it('parentId 为 0 -> level 设置为 0 并调用 update', async () => {
      mockCategoryRepo.update.mockResolvedValue({ affected: 1 });

      await service.update(1, { name: '服装2', parentId: 0 });

      expect(mockCategoryRepo.update).toHaveBeenCalled();
    });

    it('parentId 非 0 -> level 为 parent.level + 1', async () => {
      mockCategoryRepo.findOneBy.mockResolvedValue(level0Category);
      mockCategoryRepo.update.mockResolvedValue({ affected: 1 });

      const dto: any = { name: 'T恤2', parentId: 1 };
      await service.update(2, dto);

      expect(dto.level).toBe(1);
    });
  });

  describe('delete', () => {
    it('删除分类 -> 调用 delete', async () => {
      mockCategoryRepo.delete.mockResolvedValue({ affected: 1 });

      await service.delete(1);

      expect(mockCategoryRepo.delete).toHaveBeenCalledWith(1);
    });
  });

  describe('updateNavStatus', () => {
    it('批量更新导航状态 -> 调用 QueryBuilder 执行', async () => {
      const mockQb = {
        update: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        execute: vi.fn().mockResolvedValue({ affected: 2 }),
      };
      mockCategoryRepo.createQueryBuilder.mockReturnValue(mockQb);

      await service.updateNavStatus([1, 2], 1);

      expect(mockCategoryRepo.createQueryBuilder).toHaveBeenCalled();
      expect(mockQb.execute).toHaveBeenCalled();
    });
  });

  describe('updateShowStatus', () => {
    it('批量更新显示状态 -> 调用 QueryBuilder 执行', async () => {
      const mockQb = {
        update: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        execute: vi.fn().mockResolvedValue({ affected: 2 }),
      };
      mockCategoryRepo.createQueryBuilder.mockReturnValue(mockQb);

      await service.updateShowStatus([1, 2], 0);

      expect(mockCategoryRepo.createQueryBuilder).toHaveBeenCalled();
      expect(mockQb.execute).toHaveBeenCalled();
    });
  });
});
