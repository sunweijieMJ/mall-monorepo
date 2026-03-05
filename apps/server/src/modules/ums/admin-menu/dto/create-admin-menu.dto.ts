import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

/** 创建后台菜单 DTO */
export class CreateAdminMenuDto {
  @ApiProperty({ description: '父级ID', example: 0 })
  @IsInt()
  parentId: number;

  @ApiProperty({ description: '菜单名称', example: '商品' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: '前端名称' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: '菜单图标' })
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiPropertyOptional({
    description: '前端隐藏：0->不隐藏；1->隐藏',
    example: '0',
  })
  @IsString()
  @IsOptional()
  hidden?: string;

  @ApiPropertyOptional({ description: '是否缓存' })
  @IsString()
  @IsOptional()
  keepAlive?: string;

  @ApiPropertyOptional({ description: '前端组件路径' })
  @IsString()
  @IsOptional()
  component?: string;

  @ApiPropertyOptional({ description: '前端路由路径' })
  @IsString()
  @IsOptional()
  path?: string;

  @ApiPropertyOptional({ description: '排序', example: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  sort?: number;
}
