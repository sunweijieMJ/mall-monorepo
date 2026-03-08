import { ApiProperty } from '@nestjs/swagger';
import { AdminMenuEntity } from '../infrastructure/persistence/relational/entities/admin-menu.entity';

/** 菜单树形节点（包含 children） */
export class AdminMenuTreeNodeVo extends AdminMenuEntity {
  @ApiProperty({ type: () => [AdminMenuTreeNodeVo], description: '子菜单列表' })
  children: AdminMenuTreeNodeVo[];
}
