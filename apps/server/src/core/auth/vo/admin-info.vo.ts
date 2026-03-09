import { ApiProperty } from '@nestjs/swagger';
import { AdminMenuTreeNodeVo } from '@/modules/ums/admin-menu/vo/admin-menu-tree-node.vo';

/** 管理员信息聚合 VO */
export class AdminInfoVo {
  @ApiProperty({ description: '用户名' })
  username: string;

  @ApiProperty({ description: '头像', required: false })
  icon?: string;

  @ApiProperty({ description: '角色名列表', type: [String] })
  roles: string[];

  @ApiProperty({ description: '菜单树', type: () => [AdminMenuTreeNodeVo] })
  menus: AdminMenuTreeNodeVo[];
}
