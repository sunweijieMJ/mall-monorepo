import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductAttrService } from '@/modules/pms/product-attr/product-attr.service';
import {
  ProductAttrEntity,
  ProductAttrCategoryEntity,
} from '@/modules/pms/product-attr/infrastructure/persistence/relational/entities/product-attr.entity';
import { TransactionService } from '@/infrastructure/database/transaction/transaction.service';
import { createMockRepository } from '../../../../helpers/mock.factory';

// ---- 测试数据 ----

const attrCategoryFixture = {
  id: 1,
  name: '颜色',
  attributeCount: 3,
  paramCount: 2,
} as ProductAttrCategoryEntity;

const attrFixture = {
  id: 1,
  productAttributeCategoryId: 1,
  name: '红色',
  selectType: 0,
  inputType: 0,
  sort: 100,
  type: 0,
} as ProductAttrEntity;

const paramFixture = {
  id: 2,
  productAttributeCategoryId: 1,
  name: '重量',
  selectType: 0,
  inputType: 0,
  sort: 50,
  type: 1,
} as ProductAttrEntity;

// ---- TransactionService Mock ----
// 模拟 TransactionService.run：直接执行回调并传入一个 mock EntityManager
function createMockTransactionService() {
  const mockManager = {
    create: vi.fn((_, dto) => dto),
    save: vi.fn((_, entity) =>
      Promise.resolve({ ...entity, id: entity.id ?? 1 }),
    ),
    findOneBy: vi.fn(),
    find: vi.fn(),
    delete: vi.fn().mockResolvedValue({ affected: 1 }),
  };

  return {
    service: {
      run: vi.fn((cb: (manager: any) => Promise<any>) => cb(mockManager)),
    },
    manager: mockManager,
  };
}

describe('ProductAttrService', () => {
  let service: ProductAttrService;
  const mockAttrRepo = createMockRepository();
  const mockCateRepo = createMockRepository();
  let mockTx: ReturnType<typeof createMockTransactionService>;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockTx = createMockTransactionService();

    const module = await Test.createTestingModule({
      providers: [
        ProductAttrService,
        {
          provide: getRepositoryToken(ProductAttrEntity),
          useValue: mockAttrRepo,
        },
        {
          provide: getRepositoryToken(ProductAttrCategoryEntity),
          useValue: mockCateRepo,
        },
        { provide: TransactionService, useValue: mockTx.service },
      ],
    }).compile();
    service = module.get(ProductAttrService);
  });

  // ========== 属性分类 ==========

  describe('listAttrCategory', () => {
    it('分页查询属性分类 -> 返回分页结果', async () => {
      mockCateRepo.findAndCount.mockResolvedValue([[attrCategoryFixture], 1]);

      const result = await service.listAttrCategory({
        pageNum: 1,
        pageSize: 10,
      } as any);

      expect(result.list).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });

  describe('createAttrCategory', () => {
    it('创建属性分类 -> 返回已保存实体', async () => {
      mockCateRepo.save.mockResolvedValue(attrCategoryFixture);

      const result = await service.createAttrCategory({ name: '颜色' });

      expect(mockCateRepo.create).toHaveBeenCalled();
      expect(mockCateRepo.save).toHaveBeenCalled();
      expect(result.name).toBe('颜色');
    });
  });

  describe('updateAttrCategory', () => {
    it('更新属性分类 -> 调用 update', async () => {
      mockCateRepo.update.mockResolvedValue({ affected: 1 });

      await service.updateAttrCategory(1, { name: '尺寸' });

      expect(mockCateRepo.update).toHaveBeenCalledWith(1, { name: '尺寸' });
    });
  });

  describe('deleteAttrCategory', () => {
    it('删除属性分类 -> 调用 delete', async () => {
      mockCateRepo.delete.mockResolvedValue({ affected: 1 });

      await service.deleteAttrCategory(1);

      expect(mockCateRepo.delete).toHaveBeenCalledWith(1);
    });
  });

  describe('listAttrCategoryWithAttr', () => {
    it('查询属性分类并关联属性列表 -> 返回树形结构', async () => {
      mockCateRepo.find.mockResolvedValue([attrCategoryFixture]);
      mockAttrRepo.find.mockResolvedValue([attrFixture]);

      const result = await service.listAttrCategoryWithAttr();

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('颜色');
      expect(result[0].attributeList).toHaveLength(1);
      expect(result[0].attributeList[0].name).toBe('红色');
      // 验证只查询 type=0 的属性
      expect(mockAttrRepo.find).toHaveBeenCalledWith({ where: { type: 0 } });
    });
  });

  // ========== 属性 ==========

  describe('listAttr', () => {
    it('按分类ID和类型分页查询属性 -> 返回分页结果', async () => {
      mockAttrRepo.findAndCount.mockResolvedValue([[attrFixture], 1]);

      const result = await service.listAttr(1, 0, {
        pageNum: 1,
        pageSize: 10,
      } as any);

      expect(result.list).toHaveLength(1);
      expect(result.total).toBe(1);
      const callArgs = mockAttrRepo.findAndCount.mock.calls[0][0];
      expect(callArgs.where.productAttributeCategoryId).toBe(1);
      expect(callArgs.where.type).toBe(0);
      expect(callArgs.order.sort).toBe('DESC');
    });
  });

  describe('getAttrItem', () => {
    it('存在 -> 返回属性', async () => {
      mockAttrRepo.findOneBy.mockResolvedValue(attrFixture);

      const result = await service.getAttrItem(1);

      expect(result.name).toBe('红色');
    });

    it('不存在 -> 404', async () => {
      mockAttrRepo.findOneBy.mockResolvedValue(null);

      await expect(service.getAttrItem(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('createAttr', () => {
    it('创建规格属性(type=0) -> 更新分类 attributeCount', async () => {
      const dto = { name: '蓝色', productAttributeCategoryId: 1, type: 0 };
      mockTx.manager.findOneBy.mockResolvedValue({
        ...attrCategoryFixture,
        attributeCount: 3,
      });

      const result = await service.createAttr(dto as any);

      expect(mockTx.service.run).toHaveBeenCalled();
      expect(result.name).toBe('蓝色');
      // 验证保存了分类实体，attributeCount 应该 +1
      const savedCategory = mockTx.manager.save.mock.calls[1][1];
      expect(savedCategory.attributeCount).toBe(4);
    });

    it('创建参数属性(type=1) -> 更新分类 paramCount', async () => {
      const dto = { name: '材质', productAttributeCategoryId: 1, type: 1 };
      mockTx.manager.findOneBy.mockResolvedValue({
        ...attrCategoryFixture,
        paramCount: 2,
      });

      await service.createAttr(dto as any);

      const savedCategory = mockTx.manager.save.mock.calls[1][1];
      expect(savedCategory.paramCount).toBe(3);
    });

    it('分类不存在 -> 不更新计数，仍正常返回', async () => {
      const dto = {
        name: '无分类属性',
        productAttributeCategoryId: 999,
        type: 0,
      };
      mockTx.manager.findOneBy.mockResolvedValue(null);

      const result = await service.createAttr(dto as any);

      expect(result.name).toBe('无分类属性');
      // save 只被调用一次（保存属性自身），不会保存分类
      expect(mockTx.manager.save).toHaveBeenCalledTimes(1);
    });

    it('创建非 0/1 类型属性 -> 不更新计数', async () => {
      const dto = { name: '特殊属性', productAttributeCategoryId: 1, type: 2 };
      mockTx.manager.findOneBy.mockResolvedValue({ ...attrCategoryFixture });

      await service.createAttr(dto as any);

      // 分类被查到但 type=2 不匹配 0 或 1，attributeCount/paramCount 不变
      const savedCategory = mockTx.manager.save.mock.calls[1][1];
      expect(savedCategory.attributeCount).toBe(3);
      expect(savedCategory.paramCount).toBe(2);
    });

    it('分类 attributeCount 为 null -> 初始化为 1', async () => {
      const dto = { name: '新属性', productAttributeCategoryId: 1, type: 0 };
      mockTx.manager.findOneBy.mockResolvedValue({
        ...attrCategoryFixture,
        attributeCount: null,
      });

      await service.createAttr(dto as any);

      const savedCategory = mockTx.manager.save.mock.calls[1][1];
      expect(savedCategory.attributeCount).toBe(1);
    });
  });

  describe('updateAttr', () => {
    it('更新属性 -> 调用 update', async () => {
      mockAttrRepo.update.mockResolvedValue({ affected: 1 });

      await service.updateAttr(1, { name: '绿色' });

      expect(mockAttrRepo.update).toHaveBeenCalledWith(1, { name: '绿色' });
    });
  });

  describe('deleteAttr', () => {
    it('批量删除属性(type=0) -> 分类 attributeCount 减少', async () => {
      mockTx.manager.find.mockResolvedValue([attrFixture]); // type=0 的属性
      mockTx.manager.findOneBy.mockResolvedValue({
        ...attrCategoryFixture,
        attributeCount: 3,
      });

      await service.deleteAttr([1]);

      expect(mockTx.service.run).toHaveBeenCalled();
      expect(mockTx.manager.delete).toHaveBeenCalled();
      // 验证 attributeCount 减少 1
      const savedCategory = mockTx.manager.save.mock.calls[0][1];
      expect(savedCategory.attributeCount).toBe(2);
    });

    it('批量删除属性(type=1) -> 分类 paramCount 减少', async () => {
      mockTx.manager.find.mockResolvedValue([paramFixture]); // type=1 的属性
      mockTx.manager.findOneBy.mockResolvedValue({
        ...attrCategoryFixture,
        paramCount: 2,
      });

      await service.deleteAttr([2]);

      const savedCategory = mockTx.manager.save.mock.calls[0][1];
      expect(savedCategory.paramCount).toBe(1);
    });

    it('删除同分类多个属性 -> groupMap 合并计数', async () => {
      const attr2 = { ...attrFixture, id: 3 }; // 同分类同类型
      mockTx.manager.find.mockResolvedValue([attrFixture, attr2]); // 2 个 type=0
      mockTx.manager.findOneBy.mockResolvedValue({
        ...attrCategoryFixture,
        attributeCount: 5,
      });

      await service.deleteAttr([1, 3]);

      const savedCategory = mockTx.manager.save.mock.calls[0][1];
      expect(savedCategory.attributeCount).toBe(3); // 5 - 2
    });

    it('删除后分类不存在 -> 跳过计数更新', async () => {
      mockTx.manager.find.mockResolvedValue([attrFixture]);
      mockTx.manager.findOneBy.mockResolvedValue(null); // 分类已不存在

      await service.deleteAttr([1]);

      expect(mockTx.manager.delete).toHaveBeenCalled();
      // save 不应被调用（分类不存在时 continue）
      expect(mockTx.manager.save).not.toHaveBeenCalled();
    });

    it('find 返回空数组 -> 不执行删除和计数更新', async () => {
      mockTx.manager.find.mockResolvedValue([]);

      await service.deleteAttr([999]);

      expect(mockTx.manager.delete).not.toHaveBeenCalled();
    });

    it('空数组 -> 直接返回不执行事务', async () => {
      await service.deleteAttr([]);

      expect(mockTx.service.run).not.toHaveBeenCalled();
    });
  });
});
