import type { AdminUserEntity } from '@/modules/ums/admin-user/infrastructure/persistence/relational/entities/admin-user.entity';

/**
 * 创建管理员测试数据。
 * password 字段为 bcrypt('Admin@123456') 的哈希值，仅用于 mock，不会真正被验证。
 *
 * @example
 * const admin = createAdminFixture({ username: 'custom-admin' });
 * mockAdminRepo.findOne.mockResolvedValue(admin);
 */
export function createAdminFixture(
  overrides: Partial<AdminUserEntity> = {},
): AdminUserEntity {
  return {
    id: 1,
    username: 'test-admin',
    // bcrypt hash of 'Admin@123456'
    password: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    email: 'admin@test.com',
    nickName: '测试管理员',
    icon: '',
    note: '测试账号',
    status: 1,
    loginTime: new Date('2024-01-01T00:00:00Z'),
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    ...overrides,
  } as AdminUserEntity;
}

/** 创建已禁用的管理员测试数据 */
export function createDisabledAdminFixture(
  overrides: Partial<AdminUserEntity> = {},
): AdminUserEntity {
  return createAdminFixture({
    status: 0,
    username: 'disabled-admin',
    ...overrides,
  });
}
