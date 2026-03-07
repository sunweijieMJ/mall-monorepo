import { vi } from 'vitest';
import { getDataSourceToken } from '@nestjs/typeorm';
import type { Cache } from 'cache-manager';
import type { DataSource } from 'typeorm';
import type { Redis } from 'ioredis';

// ──────────────────────────────────────────────
// TypeORM Repository Mock
// ──────────────────────────────────────────────

/**
 * 创建通用 TypeORM Repository Mock。
 * 所有方法均为 vi.fn()，默认返回值为 undefined / null。
 * 在具体测试中用 .mockResolvedValue() / .mockResolvedValueOnce() 设置返回值。
 *
 * @example
 * const mockBrandRepo = createMockRepository();
 * mockBrandRepo.findAndCount.mockResolvedValue([[brandFixture], 1]);
 */
export function createMockRepository(): Record<string, any> {
  return {
    find: vi.fn(),
    findOne: vi.fn(),
    findAndCount: vi.fn(),
    findOneBy: vi.fn(),
    findBy: vi.fn(),
    count: vi.fn(),
    countBy: vi.fn(),
    // create 默认透传入参对象（模拟 TypeORM 行为）
    create: vi.fn((entity) => entity),
    save: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    upsert: vi.fn(),
    delete: vi.fn(),
    softDelete: vi.fn(),
    restore: vi.fn(),
    query: vi.fn(),
    createQueryBuilder: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      addSelect: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      andWhere: vi.fn().mockReturnThis(),
      orWhere: vi.fn().mockReturnThis(),
      leftJoin: vi.fn().mockReturnThis(),
      leftJoinAndSelect: vi.fn().mockReturnThis(),
      innerJoin: vi.fn().mockReturnThis(),
      innerJoinAndSelect: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      addOrderBy: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      take: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      offset: vi.fn().mockReturnThis(),
      setParameter: vi.fn().mockReturnThis(),
      getOne: vi.fn(),
      getOneOrFail: vi.fn(),
      getMany: vi.fn(),
      getManyAndCount: vi.fn(),
      getCount: vi.fn(),
      getRawOne: vi.fn(),
      getRawMany: vi.fn(),
      execute: vi.fn(),
    })),
    manager: {} as any,
    metadata: {} as any,
    target: {} as any,
  };
}

// ──────────────────────────────────────────────
// TypeORM DataSource Mock
// ──────────────────────────────────────────────

/**
 * 创建 TypeORM DataSource Mock。
 * 作为 getDataSourceToken() provider 注入，防止 TypeOrmModule.forFeature()
 * 在测试模块中因缺少真实 DB 连接而报错。
 *
 * @example
 * builder.overrideProvider(getDataSourceToken()).useValue(createMockDataSource());
 */
export function createMockDataSource(): Partial<DataSource> {
  const mockRepo = createMockRepository();
  return {
    getRepository: vi.fn().mockReturnValue(mockRepo),
    manager: {
      getRepository: vi.fn().mockReturnValue(mockRepo),
      transaction: vi.fn((cb: (em: any) => Promise<any>) =>
        cb({ getRepository: vi.fn().mockReturnValue(mockRepo) }),
      ),
    } as any,
    options: { type: 'postgres' } as any,
    isInitialized: true,
  };
}

/** getDataSourceToken() 的 provider 对象，方便直接放入 providers 数组 */
export function mockDataSourceProvider() {
  return {
    provide: getDataSourceToken(),
    useValue: createMockDataSource(),
  };
}

// ──────────────────────────────────────────────
// Cache Manager Mock
// ──────────────────────────────────────────────

/**
 * 创建 Cache Manager Mock。
 * 默认 get 返回 null（未命中缓存），set/del 返回 undefined。
 * 在具体测试中用 .mockResolvedValueOnce() 模拟缓存命中场景。
 *
 * @example
 * const mockCache = createMockCacheManager();
 * mockCache.get.mockResolvedValueOnce(adminFixture); // 模拟缓存命中
 */
// ──────────────────────────────────────────────
// Redis Client Mock (ioredis)
// ──────────────────────────────────────────────

/**
 * 创建 ioredis Client Mock。
 * 用于替代 REDIS_CLIENT provider，避免测试连接真实 Redis。
 */
export function createMockRedisClient(): Partial<Redis> {
  return {
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue('OK'),
    del: vi.fn().mockResolvedValue(1),
    incr: vi.fn().mockResolvedValue(1),
    expire: vi.fn().mockResolvedValue(1),
    pexpire: vi.fn().mockResolvedValue(1),
    exists: vi.fn().mockResolvedValue(0),
    ttl: vi.fn().mockResolvedValue(-1),
  } as unknown as Partial<Redis>;
}

export function createMockCacheManager(): Cache {
  return {
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue(undefined),
    del: vi.fn().mockResolvedValue(undefined),
    clear: vi.fn().mockResolvedValue(undefined),
    keys: vi.fn().mockResolvedValue([]),
    store: {} as any,
    on: vi.fn(),
  } as unknown as Cache;
}
