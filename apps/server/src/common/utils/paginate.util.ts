import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import { PageQueryDto, PageResult } from '../dto/page-result.dto';

/**
 * 为 QueryBuilder 应用分页参数并执行查询
 * 减少各 Service 中重复的分页代码
 *
 * @example
 * ```typescript
 * const qb = this.repo.createQueryBuilder('brand');
 * if (keyword) qb.where('brand.name LIKE :keyword', { keyword: `%${keyword}%` });
 * return paginate(qb, query);
 * ```
 */
export async function paginate<T extends ObjectLiteral>(
  qb: SelectQueryBuilder<T>,
  query: PageQueryDto,
): Promise<PageResult<T>> {
  qb.skip((query.page - 1) * query.limit).take(query.limit);
  const [list, total] = await qb.getManyAndCount();
  return PageResult.of(list, total, query);
}
