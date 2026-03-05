import { ApiProperty } from '@nestjs/swagger';

/** 统一成功响应格式 */
export class ApiResponse<T = unknown> {
  @ApiProperty({ example: 200 })
  code: number;

  @ApiProperty({ example: 'success' })
  message: string;

  @ApiProperty()
  data: T;
}

/** 统一错误响应格式 */
export class ApiErrorResponse {
  @ApiProperty({ example: 400 })
  code: number;

  @ApiProperty({ example: '请求参数错误' })
  message: string | string[];

  @ApiProperty()
  data: Record<string, unknown> | null;
}

export function createApiResponse<T>(
  data: T,
  message = 'success',
): ApiResponse<T> {
  return { code: 200, message, data };
}
