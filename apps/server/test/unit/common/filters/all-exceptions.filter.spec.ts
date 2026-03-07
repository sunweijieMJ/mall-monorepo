import { vi, describe, it, expect, beforeEach } from 'vitest';
import {
  HttpException,
  HttpStatus,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ThrottlerException } from '@nestjs/throttler';
import { AllExceptionsFilter } from '@/common/filters/all-exceptions.filter';

function createMockHost() {
  const mockResponse = {};
  const mockRequest = {
    headers: { 'x-request-id': 'req-123' },
  };
  return {
    switchToHttp: () => ({
      getRequest: () => mockRequest,
      getResponse: () => mockResponse,
    }),
    _response: mockResponse,
    _request: mockRequest,
  };
}

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;
  let mockReply: ReturnType<typeof vi.fn>;
  let host: ReturnType<typeof createMockHost>;

  beforeEach(() => {
    mockReply = vi.fn();
    const httpAdapterHost = {
      httpAdapter: {
        reply: mockReply,
        getRequestUrl: () => '/api/v1/test',
      },
    } as any;
    filter = new AllExceptionsFilter(httpAdapterHost);
    host = createMockHost();
  });

  it('NotFoundException → { code: 404, message, data: null }', () => {
    filter.catch(new NotFoundException('资源不存在'), host as any);

    expect(mockReply).toHaveBeenCalledWith(
      host._response,
      { code: 404, message: '资源不存在', data: null },
      404,
    );
  });

  it('HttpException 对象形式响应 → 提取 message 和 errors', () => {
    const exception = new HttpException(
      { message: '参数错误', errors: { name: '不能为空' } },
      HttpStatus.BAD_REQUEST,
    );
    filter.catch(exception, host as any);

    expect(mockReply).toHaveBeenCalledWith(
      host._response,
      { code: 400, message: '参数错误', data: { name: '不能为空' } },
      400,
    );
  });

  it('UnprocessableEntityException (422) → 携带字段错误', () => {
    const exception = new UnprocessableEntityException({
      message: '校验失败',
      errors: { username: '用户名已存在' },
    });
    filter.catch(exception, host as any);

    const [, body, status] = mockReply.mock.calls[0];
    expect(status).toBe(422);
    expect(body.code).toBe(422);
    expect(body.data).toEqual({ username: '用户名已存在' });
  });

  it('ThrottlerException → 429 + 固定消息', () => {
    filter.catch(new ThrottlerException(), host as any);

    const [, body, status] = mockReply.mock.calls[0];
    expect(status).toBe(429);
    expect(body.code).toBe(429);
    expect(body.message).toBe('请求过于频繁，请稍后再试');
  });

  it('原生 Error → 500 + 不暴露内部信息', () => {
    filter.catch(new Error('数据库连接超时'), host as any);

    const [, body, status] = mockReply.mock.calls[0];
    expect(status).toBe(500);
    expect(body.code).toBe(500);
    expect(body.message).toBe('服务器内部错误');
    expect(body.data).toBeNull();
  });

  it('非 Error 类型异常 → 500', () => {
    filter.catch('unknown crash', host as any);

    const [, body, status] = mockReply.mock.calls[0];
    expect(status).toBe(500);
    expect(body.code).toBe(500);
    expect(body.message).toBe('服务器内部错误');
  });
});
