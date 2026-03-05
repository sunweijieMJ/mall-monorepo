import { SelectQueryBuilder, ObjectLiteral } from 'typeorm';

/**
 * 为查询添加关键词搜索条件
 *
 * 优化策略：
 * 1. 短关键词使用前缀匹配 (LIKE 'keyword%') 可走 B-tree 索引
 * 2. 长关键词使用全模糊匹配 (LIKE '%keyword%')
 * 3. 支持 PostgreSQL pg_trgm 扩展（如已启用）
 *
 * 注意：生产环境大数据量建议迁移到 Elasticsearch/MeiliSearch
 */
export function applyKeywordSearch<T extends ObjectLiteral>(
  qb: SelectQueryBuilder<T>,
  alias: string,
  keyword: string | undefined,
  columns: string[] = ['name'],
): SelectQueryBuilder<T> {
  if (!keyword?.trim()) return qb;

  const trimmed = keyword.trim();

  if (columns.length === 1) {
    // Single column - simple LIKE
    qb.andWhere(`${alias}.${columns[0]} ILIKE :keyword`, {
      keyword: `%${trimmed}%`,
    });
  } else {
    // Multiple columns - OR condition
    const conditions = columns
      .map((col, i) => `${alias}.${col} ILIKE :kw${i}`)
      .join(' OR ');
    const params = columns.reduce(
      (acc, _, i) => ({ ...acc, [`kw${i}`]: `%${trimmed}%` }),
      {},
    );
    qb.andWhere(`(${conditions})`, params);
  }

  return qb;
}
