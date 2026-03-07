import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SubjectService } from '@/modules/cms/subject/subject.service';
import { SubjectEntity } from '@/modules/cms/subject/infrastructure/persistence/relational/entities/subject.entity';
import { SubjectProductRelationEntity } from '@/modules/cms/subject/infrastructure/persistence/relational/entities/subject-product-relation.entity';
import { ProductEntity } from '@/modules/pms/product/infrastructure/persistence/relational/entities/product.entity';
import { TransactionService } from '@/infrastructure/database/transaction/transaction.service';
import { createMockRepository } from '../../../../helpers/mock.factory';

// ── 测试夹具 ──

const subjectFixture = {
  id: 1,
  title: '夏季穿搭指南',
  categoryId: 10,
  showStatus: 1,
  productCount: 5,
  createTime: new Date(),
} as SubjectEntity;

const relationFixture = {
  id: 1,
  subjectId: 1,
  productId: 100,
} as SubjectProductRelationEntity;

const productFixture = {
  id: 100,
  name: '测试商品',
  publishStatus: 1,
  deleteStatus: 0,
} as ProductEntity;

// ── Mock TransactionService ──
// run 方法直接执行回调，并传入一个带 delete 的假 EntityManager
const mockManager = {
  delete: vi.fn().mockResolvedValue({ affected: 1 }),
};
const mockTransactionService = {
  run: vi.fn((cb: (manager: any) => Promise<any>) => cb(mockManager)),
};

describe('SubjectService', () => {
  let service: SubjectService;
  const mockSubjectRepo = createMockRepository();
  const mockRelationRepo = createMockRepository();
  const mockProductRepo = createMockRepository();

  beforeEach(async () => {
    vi.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        SubjectService,
        {
          provide: getRepositoryToken(SubjectEntity),
          useValue: mockSubjectRepo,
        },
        {
          provide: getRepositoryToken(SubjectProductRelationEntity),
          useValue: mockRelationRepo,
        },
        {
          provide: getRepositoryToken(ProductEntity),
          useValue: mockProductRepo,
        },
        { provide: TransactionService, useValue: mockTransactionService },
      ],
    }).compile();
    service = module.get(SubjectService);
  });

  // ── list ──

  describe('list', () => {
    it('无关键词 → 返回分页结果', async () => {
      mockSubjectRepo.findAndCount.mockResolvedValue([[subjectFixture], 1]);

      const result = await service.list({ page: 1, limit: 10 } as any);

      expect(result.list).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(mockSubjectRepo.findAndCount).toHaveBeenCalledTimes(1);
    });

    it('带关键词 → 使用 Like 模糊匹配标题', async () => {
      mockSubjectRepo.findAndCount.mockResolvedValue([[], 0]);

      await service.list({ page: 1, limit: 10, keyword: '夏季' } as any);

      const callArgs = mockSubjectRepo.findAndCount.mock.calls[0][0];
      expect(callArgs.where.title).toBeDefined();
    });

    it('分页参数正确传递（skip / take）', async () => {
      mockSubjectRepo.findAndCount.mockResolvedValue([[], 0]);

      await service.list({ page: 2, limit: 5 } as any);

      const callArgs = mockSubjectRepo.findAndCount.mock.calls[0][0];
      expect(callArgs.skip).toBe(5); // (2-1)*5
      expect(callArgs.take).toBe(5);
    });
  });

  // ── create ──

  describe('create', () => {
    it('正常创建 → 返回保存后的实体', async () => {
      mockSubjectRepo.save.mockResolvedValue(subjectFixture);

      const dto = { title: '夏季穿搭指南', categoryId: 10 } as any;
      const result = await service.create(dto);

      expect(result.id).toBe(1);
      expect(mockSubjectRepo.create).toHaveBeenCalled();
      expect(mockSubjectRepo.save).toHaveBeenCalled();
    });

    it('创建时自动设置 createTime', async () => {
      mockSubjectRepo.save.mockResolvedValue(subjectFixture);

      const dto = { title: '测试专题' } as any;
      await service.create(dto);

      // create 被调用时传入的对象应包含 createTime
      const createArg = mockSubjectRepo.create.mock.calls[0][0];
      expect(createArg.createTime).toBeInstanceOf(Date);
    });
  });

  // ── update ──

  describe('update', () => {
    it('正常更新 → 调用 repo.update', async () => {
      mockSubjectRepo.update.mockResolvedValue({ affected: 1 });

      await service.update(1, { title: '更新后的标题' } as any);

      expect(mockSubjectRepo.update).toHaveBeenCalledWith(1, {
        title: '更新后的标题',
      });
    });
  });

  // ── delete ──

  describe('delete', () => {
    it('批量删除 → 事务中先删关联关系再删专题', async () => {
      await service.delete([1, 2]);

      // 验证 transactionService.run 被调用
      expect(mockTransactionService.run).toHaveBeenCalledTimes(1);
      // 验证 manager.delete 被调用两次（关联关系 + 专题本体）
      expect(mockManager.delete).toHaveBeenCalledTimes(2);
      // 第一次删除关联关系
      expect(mockManager.delete.mock.calls[0][0]).toBe(
        SubjectProductRelationEntity,
      );
      // 第二次删除专题
      expect(mockManager.delete.mock.calls[1][0]).toBe(SubjectEntity);
    });
  });

  // ── getProductList ──

  describe('getProductList', () => {
    it('有关联商品 → 返回商品分页列表', async () => {
      mockRelationRepo.findAndCount.mockResolvedValue([[relationFixture], 1]);
      mockProductRepo.find.mockResolvedValue([productFixture]);

      const result = await service.getProductList(1, {
        page: 1,
        limit: 10,
      } as any);

      expect(result.list).toHaveLength(1);
      expect(result.list[0].id).toBe(100);
      expect(result.total).toBe(1);
    });

    it('无关联商品 → 返回空列表', async () => {
      mockRelationRepo.findAndCount.mockResolvedValue([[], 0]);

      const result = await service.getProductList(1, {
        page: 1,
        limit: 10,
      } as any);

      expect(result.list).toHaveLength(0);
      expect(result.total).toBe(0);
      // 不应查询 productRepo
      expect(mockProductRepo.find).not.toHaveBeenCalled();
    });

    it('分页参数正确透传到关联表查询', async () => {
      mockRelationRepo.findAndCount.mockResolvedValue([[], 0]);

      await service.getProductList(1, { page: 3, limit: 5 } as any);

      const callArgs = mockRelationRepo.findAndCount.mock.calls[0][0];
      expect(callArgs.where.subjectId).toBe(1);
      expect(callArgs.skip).toBe(10); // (3-1)*5
      expect(callArgs.take).toBe(5);
    });
  });
});
