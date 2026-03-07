import { vi, describe, it, expect, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CleanupSessionsTask } from '@/infrastructure/scheduler/tasks/cleanup-sessions.task';
import { SessionEntity } from '@/core/auth/infrastructure/persistence/relational/entities/session.entity';
import { createMockRepository } from '../../../helpers/mock.factory';

describe('CleanupSessionsTask', () => {
  let task: CleanupSessionsTask;
  const mockSessionRepo = createMockRepository();

  beforeEach(async () => {
    vi.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        CleanupSessionsTask,
        {
          provide: getRepositoryToken(SessionEntity),
          useValue: mockSessionRepo,
        },
      ],
    }).compile();
    task = module.get(CleanupSessionsTask);
  });

  it('有过期 session → 删除并记录日志', async () => {
    mockSessionRepo.delete.mockResolvedValue({ affected: 3 });

    await task.handleCron();

    expect(mockSessionRepo.delete).toHaveBeenCalledWith(
      expect.objectContaining({ expiresAt: expect.anything() }),
    );
  });

  it('无过期 session → 不记录日志', async () => {
    mockSessionRepo.delete.mockResolvedValue({ affected: 0 });

    await task.handleCron();

    expect(mockSessionRepo.delete).toHaveBeenCalled();
  });

  it('affected=null → 不抛异常', async () => {
    mockSessionRepo.delete.mockResolvedValue({ affected: null });

    await expect(task.handleCron()).resolves.toBeUndefined();
  });
});
