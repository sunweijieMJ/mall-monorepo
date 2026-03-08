import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { PageResult } from '@/common/dto/page-result.dto';
import { ApiResponse } from '@/common/dto/api-response.dto';

/**
 * 分页响应装饰器
 * 用于 Swagger 文档，生成 { code, message, data: PageResult<T> } 的响应 schema
 *
 * @example
 * @ApiPaginatedResponse(BrandEntity)
 * findList(@Query() query: QueryBrandDto) { ... }
 */
export const ApiPaginatedResponse = <TModel extends Type<any>>(
  model: TModel,
) => {
  return applyDecorators(
    ApiExtraModels(ApiResponse, PageResult, model),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiResponse) },
          {
            properties: {
              data: {
                allOf: [
                  { $ref: getSchemaPath(PageResult) },
                  {
                    properties: {
                      list: {
                        type: 'array',
                        items: { $ref: getSchemaPath(model) },
                      },
                    },
                  },
                ],
              },
            },
          },
        ],
      },
    }),
  );
};
