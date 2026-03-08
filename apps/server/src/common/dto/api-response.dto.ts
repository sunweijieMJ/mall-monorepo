import { ApiProperty } from '@nestjs/swagger';

/** 统一成功响应格式 */
export class ApiResponse<T = unknown> {
  @ApiProperty({ type: 'integer', example: 200 })
  code: number;

  @ApiProperty({ example: 'success' })
  message: string;

  @ApiProperty()
  data: T;
}

/** 统一错误响应格式 */
export class ApiErrorResponse {
  @ApiProperty({ type: 'integer', example: 400 })
  code: number;

  @ApiProperty({
    example: '请求参数错误',
    oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
  })
  message: string | string[];

  @ApiProperty({ nullable: true, example: null })
  data: Record<string, unknown> | null;
}
