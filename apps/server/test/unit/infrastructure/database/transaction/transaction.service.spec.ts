import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TransactionService } from '@/infrastructure/database/transaction/transaction.service';

// 创建 mock queryRunner
function createMockQueryRunner() {
  return {
    connect: vi.fn(),
    startTransaction: vi.fn(),
    commitTransaction: vi.fn(),
    rollbackTransaction: vi.fn(),
    release: vi.fn(),
    manager: { save: vi.fn(), getRepository: vi.fn() },
  };
}

describe('TransactionService', () => {
  let service: TransactionService;
  let mockQueryRunner: ReturnType<typeof createMockQueryRunner>;

  beforeEach(() => {
    mockQueryRunner = createMockQueryRunner();
    const mockDataSource = {
      createQueryRunner: vi.fn().mockReturnValue(mockQueryRunner),
    } as any;
    service = new TransactionService(mockDataSource);
  });

  it('成功时 commit + release，返回回调结果', async () => {
    const result = await service.run(async (manager) => {
      expect(manager).toBe(mockQueryRunner.manager);
      return 'ok';
    });

    expect(result).toBe('ok');
    expect(mockQueryRunner.connect).toHaveBeenCalledOnce();
    expect(mockQueryRunner.startTransaction).toHaveBeenCalledOnce();
    expect(mockQueryRunner.commitTransaction).toHaveBeenCalledOnce();
    expect(mockQueryRunner.rollbackTransaction).not.toHaveBeenCalled();
    expect(mockQueryRunner.release).toHaveBeenCalledOnce();
  });

  it('回调抛错时 rollback + release + 重抛原始错误', async () => {
    const error = new Error('业务异常');

    await expect(
      service.run(async () => {
        throw error;
      }),
    ).rejects.toThrow('业务异常');

    expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalledOnce();
    expect(mockQueryRunner.commitTransaction).not.toHaveBeenCalled();
    expect(mockQueryRunner.release).toHaveBeenCalledOnce();
  });

  it('release 在成功和失败时都执行（finally 语义）', async () => {
    // 成功
    await service.run(async () => 'done');
    expect(mockQueryRunner.release).toHaveBeenCalledTimes(1);

    // 重置
    vi.clearAllMocks();
    mockQueryRunner = createMockQueryRunner();

    // 失败
    const ds2 = {
      createQueryRunner: vi.fn().mockReturnValue(mockQueryRunner),
    } as any;
    const service2 = new TransactionService(ds2);
    await service2
      .run(async () => {
        throw new Error('err');
      })
      .catch(() => {});
    expect(mockQueryRunner.release).toHaveBeenCalledTimes(1);
  });
});
