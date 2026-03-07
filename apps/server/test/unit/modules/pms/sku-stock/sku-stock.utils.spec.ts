import { vi, describe, it, expect } from 'vitest';
import { BadRequestException } from '@nestjs/common';

// Mock SkuStockEntity — 必须在 import 之前 mock
vi.mock(
  '@/modules/pms/sku-stock/infrastructure/persistence/relational/entities/sku-stock.entity',
  () => ({ SkuStockEntity: class SkuStockEntity {} }),
);

import {
  deductStock,
  releaseStock,
} from '@/modules/pms/sku-stock/sku-stock.utils';

// 创建链式调用的 mock EntityManager
function createMockManager(affected: number) {
  const execute = vi.fn().mockResolvedValue({ affected });
  const manager: any = {
    createQueryBuilder: vi.fn().mockReturnValue({
      update: vi.fn().mockReturnThis(),
      set: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      execute,
    }),
  };
  return { manager, execute };
}

describe('deductStock', () => {
  it('库存充足 → 正常扣减', async () => {
    const { manager } = createMockManager(1);
    await expect(deductStock(manager, 100, 2)).resolves.toBeUndefined();
  });

  it('库存不足（affected=0）→ 抛出 BadRequestException', async () => {
    const { manager } = createMockManager(0);
    await expect(deductStock(manager, 100, 99)).rejects.toThrow(
      BadRequestException,
    );
    await expect(deductStock(manager, 100, 99)).rejects.toThrow(
      'SKU(100) 库存不足',
    );
  });

  it('WHERE 条件包含 stock >= qty', async () => {
    const { manager } = createMockManager(1);
    await deductStock(manager, 5, 3);

    const qb = manager.createQueryBuilder();
    expect(qb.where).toHaveBeenCalledWith('id = :id AND stock >= :qty', {
      id: 5,
      qty: 3,
    });
  });
});

describe('deductStock - set() 回调验证', () => {
  it('set() 传入正确的 SQL 表达式', async () => {
    const setArg = { stock: null as any, lockStock: null as any };
    const execute = vi.fn().mockResolvedValue({ affected: 1 });
    const manager: any = {
      createQueryBuilder: vi.fn().mockReturnValue({
        update: vi.fn().mockReturnThis(),
        set: vi.fn((arg: any) => {
          setArg.stock = arg.stock;
          setArg.lockStock = arg.lockStock;
          return { where: vi.fn().mockReturnValue({ execute }) };
        }),
        where: vi.fn().mockReturnThis(),
        execute,
      }),
    };

    await deductStock(manager, 10, 3);

    // set() 的参数是返回 SQL 片段的函数
    expect(typeof setArg.stock).toBe('function');
    expect(typeof setArg.lockStock).toBe('function');
    expect(setArg.stock()).toBe('stock - 3');
    expect(setArg.lockStock()).toBe('lock_stock + 3');
  });
});

describe('releaseStock', () => {
  it('正常释放库存', async () => {
    const { manager } = createMockManager(1);
    await expect(releaseStock(manager, 100, 5)).resolves.toBeUndefined();
  });

  it('WHERE 条件仅需 id', async () => {
    const { manager } = createMockManager(1);
    await releaseStock(manager, 7, 2);

    const qb = manager.createQueryBuilder();
    expect(qb.where).toHaveBeenCalledWith('id = :id', { id: 7 });
  });

  it('set() 传入正确的 SQL 表达式（含 GREATEST）', async () => {
    const setArg = { stock: null as any, lockStock: null as any };
    const execute = vi.fn().mockResolvedValue({ affected: 1 });
    const manager: any = {
      createQueryBuilder: vi.fn().mockReturnValue({
        update: vi.fn().mockReturnThis(),
        set: vi.fn((arg: any) => {
          setArg.stock = arg.stock;
          setArg.lockStock = arg.lockStock;
          return { where: vi.fn().mockReturnValue({ execute }) };
        }),
        where: vi.fn().mockReturnThis(),
        execute,
      }),
    };

    await releaseStock(manager, 10, 5);

    expect(typeof setArg.stock).toBe('function');
    expect(typeof setArg.lockStock).toBe('function');
    expect(setArg.stock()).toBe('stock + 5');
    expect(setArg.lockStock()).toBe('GREATEST(lock_stock - 5, 0)');
  });
});
