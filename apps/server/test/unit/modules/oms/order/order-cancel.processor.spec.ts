import { vi, describe, it, expect, beforeEach } from 'vitest';
import { OrderCancelProcessor } from '@/modules/oms/order/order-cancel.processor';

describe('OrderCancelProcessor', () => {
  let processor: OrderCancelProcessor;
  const mockOrderService = {
    autoCancelIfUnpaid: vi.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    processor = new OrderCancelProcessor(mockOrderService as any);
  });

  it('正常处理 job → 调用 autoCancelIfUnpaid', async () => {
    const job = { data: { orderId: 42 } } as any;

    await processor.process(job);

    expect(mockOrderService.autoCancelIfUnpaid).toHaveBeenCalledWith(42);
  });

  it('从 job.data 提取 orderId', async () => {
    const job = { data: { orderId: 100 } } as any;

    await processor.process(job);

    expect(mockOrderService.autoCancelIfUnpaid).toHaveBeenCalledWith(100);
  });
});
