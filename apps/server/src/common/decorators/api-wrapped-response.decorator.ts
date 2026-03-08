import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { ApiResponse } from '@/common/dto/api-response.dto';

/**
 * 统一响应包装装饰器
 * 生成 { code, message, data: Model } 或 { code, message, data: Model[] } 的 Swagger schema
 *
 * @example
 * @ApiWrappedResponse(BrandEntity)
 * findOne() { ... }
 *
 * @ApiWrappedResponse(BrandEntity, { isArray: true })
 * findAll() { ... }
 */
export const ApiWrappedResponse = <TModel extends Type<any>>(
  model: TModel,
  options?: { isArray?: boolean },
) => {
  const dataSchema = options?.isArray
    ? { type: 'array', items: { $ref: getSchemaPath(model) } }
    : { $ref: getSchemaPath(model) };

  return applyDecorators(
    ApiExtraModels(ApiResponse, model),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiResponse) },
          {
            properties: {
              data: dataSchema,
            },
          },
        ],
      },
    }),
  );
};
