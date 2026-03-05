import type { MemberEntity } from '@/modules/portal/member/infrastructure/persistence/relational/entities/member.entity';

/**
 * 创建会员测试数据。
 * password 字段为 bcrypt('Member@123456') 的哈希值，仅用于 mock，不会真正被验证。
 *
 * @example
 * const member = createMemberFixture({ username: 'vip-member' });
 * mockMemberRepo.findOne.mockResolvedValue(member);
 */
export function createMemberFixture(
  overrides: Partial<MemberEntity> = {},
): MemberEntity {
  return {
    id: 1,
    memberLevelId: 1,
    username: 'test-member',
    // bcrypt hash of 'Member@123456'
    password: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    nickname: '测试会员',
    phone: '13800138000',
    icon: '',
    gender: 0,
    birthday: null as any,
    city: '',
    job: '',
    personalSign: '',
    sourceType: 0,
    integration: 0,
    growth: 0,
    luckyCount: 0,
    historyIntegration: 0,
    status: 1,
    createTime: new Date('2024-01-01T00:00:00Z'),
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    ...overrides,
  } as MemberEntity;
}

/** 创建已禁用的会员测试数据 */
export function createDisabledMemberFixture(
  overrides: Partial<MemberEntity> = {},
): MemberEntity {
  return createMemberFixture({
    status: 0,
    username: 'disabled-member',
    ...overrides,
  });
}
