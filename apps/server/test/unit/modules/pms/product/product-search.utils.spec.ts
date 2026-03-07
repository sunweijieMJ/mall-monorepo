import { vi, describe, it, expect, beforeEach } from 'vitest';
import { applyKeywordSearch } from '@/modules/pms/product/product-search.utils';

// 创建模拟 QueryBuilder
function createMockQueryBuilder() {
  const qb: any = {
    andWhere: vi.fn().mockReturnThis(),
  };
  return qb;
}

describe('applyKeywordSearch', () => {
  let qb: ReturnType<typeof createMockQueryBuilder>;

  beforeEach(() => {
    qb = createMockQueryBuilder();
  });

  it('keyword 为 undefined → 不添加条件', () => {
    const result = applyKeywordSearch(qb, 'p', undefined);
    expect(result).toBe(qb);
    expect(qb.andWhere).not.toHaveBeenCalled();
  });

  it('keyword 为空字符串 → 不添加条件', () => {
    const result = applyKeywordSearch(qb, 'p', '');
    expect(result).toBe(qb);
    expect(qb.andWhere).not.toHaveBeenCalled();
  });

  it('keyword 为纯空格 → 不添加条件', () => {
    const result = applyKeywordSearch(qb, 'p', '   ');
    expect(result).toBe(qb);
    expect(qb.andWhere).not.toHaveBeenCalled();
  });

  it('单列搜索 → 使用 ILIKE', () => {
    applyKeywordSearch(qb, 'product', '手机', ['name']);
    expect(qb.andWhere).toHaveBeenCalledWith('product.name ILIKE :keyword', {
      keyword: '%手机%',
    });
  });

  it('多列搜索 → 使用 OR 连接多个 ILIKE', () => {
    applyKeywordSearch(qb, 'p', '华为', ['name', 'subTitle']);
    expect(qb.andWhere).toHaveBeenCalledWith(
      '(p.name ILIKE :kw0 OR p.subTitle ILIKE :kw1)',
      { kw0: '%华为%', kw1: '%华为%' },
    );
  });

  it('keyword 前后有空格 → 自动 trim', () => {
    applyKeywordSearch(qb, 'p', '  iPhone  ');
    // 默认列为 ['name']
    expect(qb.andWhere).toHaveBeenCalledWith('p.name ILIKE :keyword', {
      keyword: '%iPhone%',
    });
  });
});
