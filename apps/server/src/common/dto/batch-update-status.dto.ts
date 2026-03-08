import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsInt, IsOptional, IsString } from 'class-validator';

/** 通用批量状态更新 */
export class BatchUpdateStatusDto {
  @ApiProperty({
    description: 'ID 数组',
    type: 'array',
    items: { type: 'integer' },
  })
  @IsArray()
  @IsInt({ each: true })
  ids: number[];

  @ApiProperty({ type: 'integer', description: '状态值' })
  @IsInt()
  status: number;
}

/** 商品审核状态（多一个 detail 字段） */
export class BatchUpdateVerifyStatusDto {
  @ApiProperty({
    description: 'ID 数组',
    type: 'array',
    items: { type: 'integer' },
  })
  @IsArray()
  @IsInt({ each: true })
  ids: number[];

  @ApiProperty({ type: 'integer', description: '审核状态' })
  @IsInt()
  verifyStatus: number;

  @ApiPropertyOptional({ description: '审核详情' })
  @IsOptional()
  @IsString()
  detail?: string;
}

/** 角色分配菜单（roleId 通过路径参数传递） */
export class AllocMenuDto {
  @ApiProperty({
    description: '菜单 ID 数组',
    type: 'array',
    items: { type: 'integer' },
  })
  @IsArray()
  @IsInt({ each: true })
  menuIds: number[];
}

/** 角色分配资源（roleId 通过路径参数传递） */
export class AllocResourceDto {
  @ApiProperty({
    description: '资源 ID 数组',
    type: 'array',
    items: { type: 'integer' },
  })
  @IsArray()
  @IsInt({ each: true })
  resourceIds: number[];
}

/** 用户分配角色 */
export class AssignRolesDto {
  @ApiProperty({
    description: '角色 ID 数组',
    type: 'array',
    items: { type: 'integer' },
  })
  @IsArray()
  @IsInt({ each: true })
  roleIds: number[];
}

/** 单条状态更新 */
export class UpdateSingleStatusDto {
  @ApiProperty({ type: 'integer', description: '状态值' })
  @IsInt()
  status: number;
}

/** 排序更新 */
export class UpdateSortDto {
  @ApiProperty({ type: 'integer', description: '排序值' })
  @IsInt()
  sort: number;
}

/** 菜单显示状态更新 */
export class UpdateHiddenDto {
  @ApiProperty({ type: 'integer', description: '隐藏状态' })
  @IsInt()
  hidden: number;
}

/** 购物车数量更新 */
export class UpdateCartQuantityDto {
  @ApiProperty({ description: '购物车项 ID', type: 'integer' })
  @IsInt()
  id: number;

  @ApiProperty({ type: 'integer', description: '数量' })
  @IsInt()
  quantity: number;
}
