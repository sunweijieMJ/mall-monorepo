import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BrandService } from '@/modules/pms/brand/brand.service';
import { BrandEntity } from '@/modules/pms/brand/infrastructure/persistence/relational/entities/brand.entity';
import { ProductEntity } from '@/modules/pms/product/infrastructure/persistence/relational/entities/product.entity';
import { createMockRepository } from '../../../../helpers/mock.factory';

const brandFixture = {
  id: 1,
  name: 'Nike',
  firstLetter: 'N',
  showStatus: 1,
  sort: 100,
} as BrandEntity;

describe('BrandService', () => {
  let service: BrandService;
  const mockBrandRepo = createMockRepository();
  const mockProductRepo = createMockRepository();

  beforeEach(async () => {
    vi.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        BrandService,
        { provide: getRepositoryToken(BrandEntity), useValue: mockBrandRepo },
        {
          provide: getRepositoryToken(ProductEntity),
          useValue: mockProductRepo,
        },
      ],
    }).compile();
    service = module.get(BrandService);
  });

  describe('findList', () => {
    it('无关键词 → 返回分页结果', async () => {
      mockBrandRepo.findAndCount.mockResolvedValue([[brandFixture], 1]);

      const result = await service.findList({ page: 1, limit: 10 } as any);

      expect(result.list).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('带关键词 → 使用 Like 查询', async () => {
      mockBrandRepo.findAndCount.mockResolvedValue([[], 0]);

      await service.findList({ page: 1, limit: 10, keyword: 'Ni' } as any);

      const callArgs = mockBrandRepo.findAndCount.mock.calls[0][0];
      expect(callArgs.where.name).toBeDefined();
    });
  });

  describe('getItem', () => {
    it('存在 → 返回品牌', async () => {
      mockBrandRepo.findOneBy.mockResolvedValue(brandFixture);

      const result = await service.getItem(1);
      expect(result.name).toBe('Nike');
    });

    it('不存在 → 404', async () => {
      mockBrandRepo.findOneBy.mockResolvedValue(null);

      await expect(service.getItem(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('有 firstLetter → 直接使用', async () => {
      mockBrandRepo.save.mockResolvedValue(brandFixture);

      await service.create({ name: 'Nike', firstLetter: 'N' } as any);

      expect(mockBrandRepo.save).toHaveBeenCalled();
    });

    it('无 firstLetter → 自动取名称首字', async () => {
      mockBrandRepo.save.mockResolvedValue(brandFixture);

      const dto = { name: 'Nike' } as any;
      await service.create(dto);

      expect(dto.firstLetter).toBe('N');
    });
  });

  describe('update', () => {
    it('存在 → 更新并返回', async () => {
      mockBrandRepo.update.mockResolvedValue({});
      mockBrandRepo.findOneBy.mockResolvedValue({
        ...brandFixture,
        name: 'Adidas',
      });

      const result = await service.update(1, { name: 'Adidas' });
      expect(result.name).toBe('Adidas');
    });

    it('不存在 → 404', async () => {
      mockBrandRepo.update.mockResolvedValue({});
      mockBrandRepo.findOneBy.mockResolvedValue(null);

      await expect(service.update(999, { name: 'X' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('批量删除', async () => {
      mockBrandRepo.delete.mockResolvedValue({ affected: 2 });

      await service.remove([1, 2]);

      expect(mockBrandRepo.delete).toHaveBeenCalledWith([1, 2]);
    });
  });

  describe('recommendList', () => {
    it('返回 showStatus=1 的品牌分页', async () => {
      mockBrandRepo.findAndCount.mockResolvedValue([[brandFixture], 1]);

      const result = await service.recommendList(1, 10);

      expect(result.list).toHaveLength(1);
      const callArgs = mockBrandRepo.findAndCount.mock.calls[0][0];
      expect(callArgs.where.showStatus).toBe(1);
    });
  });

  describe('findAll', () => {
    it('返回所有品牌', async () => {
      mockBrandRepo.find.mockResolvedValue([brandFixture]);

      const result = await service.findAll();

      expect(result).toHaveLength(1);
      expect(mockBrandRepo.find).toHaveBeenCalledWith({
        order: { sort: 'DESC' },
      });
    });
  });

  describe('updateShowStatus', () => {
    it('批量更新显示状态', async () => {
      const qb = mockBrandRepo.createQueryBuilder();
      qb.update = vi.fn().mockReturnValue(qb);
      qb.set = vi.fn().mockReturnValue(qb);
      mockBrandRepo.createQueryBuilder.mockReturnValue(qb);
      qb.execute.mockResolvedValue({ affected: 2 });

      await service.updateShowStatus([1, 2], 1);

      expect(qb.update).toHaveBeenCalled();
      expect(qb.set).toHaveBeenCalledWith({ showStatus: 1 });
      expect(qb.where).toHaveBeenCalledWith('id IN (:...ids)', { ids: [1, 2] });
      expect(qb.execute).toHaveBeenCalled();
    });
  });

  describe('updateFactoryStatus', () => {
    it('批量更新厂家状态', async () => {
      const qb = mockBrandRepo.createQueryBuilder();
      qb.update = vi.fn().mockReturnValue(qb);
      qb.set = vi.fn().mockReturnValue(qb);
      mockBrandRepo.createQueryBuilder.mockReturnValue(qb);
      qb.execute.mockResolvedValue({ affected: 2 });

      await service.updateFactoryStatus([1, 2], 0);

      expect(qb.update).toHaveBeenCalled();
      expect(qb.set).toHaveBeenCalledWith({ factoryStatus: 0 });
      expect(qb.where).toHaveBeenCalledWith('id IN (:...ids)', { ids: [1, 2] });
      expect(qb.execute).toHaveBeenCalled();
    });
  });

  describe('getProductList', () => {
    it('只查已上架未删除的商品', async () => {
      mockProductRepo.findAndCount.mockResolvedValue([[], 0]);

      await service.getProductList(1, { page: 1, limit: 10 } as any);

      const callArgs = mockProductRepo.findAndCount.mock.calls[0][0];
      expect(callArgs.where.brandId).toBe(1);
      expect(callArgs.where.publishStatus).toBe(1);
      expect(callArgs.where.deleteStatus).toBe(0);
    });
  });
});
