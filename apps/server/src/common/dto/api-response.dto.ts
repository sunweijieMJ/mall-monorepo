import { ApiProperty } from '@nestjs/swagger';

/** 统一成功响应格式 */
export class ApiResponse<T = unknown> {
  @ApiProperty({ type: 'integer', description: '状态码', example: 200 })
  code: number;

  @ApiProperty({ description: '提示信息', example: 'success' })
  message: string;

  @ApiProperty({ description: '响应数据' })
  data: T;
}

/** 统一错误响应格式 */
export class ApiErrorResponse {
  @ApiProperty({ type: 'integer', description: '错误状态码', example: 400 })
  code: number;

  @ApiProperty({
    description: '错误信息',
    example: '请求参数错误',
    oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
  })
  message: string | string[];

  @ApiProperty({ description: '错误详情', nullable: true, example: null })
  data: Record<string, unknown> | null;
}
