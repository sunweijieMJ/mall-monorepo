import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';
import { Transform } from 'class-transformer';

/** 前端分页查询基类（适配 mall 前端传参规范：pageNum + pageSize） */
export class PageQueryDto {
  @ApiProperty({ description: '页码，从 1 开始', default: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Transform(({ value }) => Number(value))
  pageNum?: number = 1;

  @ApiProperty({ description: '每页数量', default: 10 })
  @IsInt()
  @Min(1)
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

  @ApiProperty({ description: '总条数' })
  total: number;

  @ApiProperty({ description: '当前页码' })
  pageNum: number;

  @ApiProperty({ description: '每页数量' })
  pageSize: number;

  static of<T>(list: T[], total: number, query: PageQueryDto): PageResult<T> {
    const result = new PageResult<T>();
    result.list = list;
    result.total = total;
    result.pageNum = query.pageNum ?? 1;
    result.pageSize = query.pageSize ?? 10;
    return result;
  }
}
