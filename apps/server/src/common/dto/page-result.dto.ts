import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { Transform } from 'class-transformer';

/** 前端分页查询基类（适配 mall 前端传参规范：pageNum + pageSize） */
export class PageQueryDto {
  @ApiPropertyOptional({
    description: '页码，从 1 开始',
    type: 'integer',
    default: 1,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Transform(({ value }) => Number(value))
  pageNum?: number = 1;

  @ApiPropertyOptional({
    description: '每页数量',
    type: 'integer',
    default: 10,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  @Transform(({ value }) => Number(value))
  pageSize?: number = 10;

  get page(): number {
    return this.pageNum ?? 1;
  }

  get limit(): number {
    return this.pageSize ?? 10;
  }
}

/** 分页响应结构（对应前端 PageResult<T>） */
export class PageResult<T> {
  @ApiProperty({ description: '数据列表' })
  list: T[];

  @ApiProperty({ description: '总条数', type: 'integer' })
  total: number;

  @ApiProperty({ description: '当前页码', type: 'integer' })
  pageNum: number;

  @ApiProperty({ description: '每页数量', type: 'integer' })
  pageSize: number;

  @ApiProperty({ description: '总页数', type: 'integer' })
  totalPage: number;

  static of<T>(list: T[], total: number, query: PageQueryDto): PageResult<T> {
    const result = new PageResult<T>();
    result.list = list;
    result.total = total;
    result.pageNum = query.pageNum ?? 1;
    result.pageSize = query.pageSize ?? 10;
    result.totalPage = Math.ceil(total / (query.pageSize ?? 10));
    return result;
  }
}
