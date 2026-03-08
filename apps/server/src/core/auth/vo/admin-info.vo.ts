import { ApiProperty } from '@nestjs/swagger';
import { AdminMenuEntity } from '@/modules/ums/admin-menu/infrastructure/persistence/relational/entities/admin-menu.entity';

/** 管理员菜单树节点 */
export class AdminMenuNodeVo extends AdminMenuEntity {
  @ApiProperty({ type: () => [AdminMenuNodeVo], description: '子菜单' })
  children?: AdminMenuNodeVo[];
}

/** 管理员信息聚合 VO */
export class AdminInfoVo {
  @ApiProperty({ description: '用户名' })
  username: string;

  @ApiProperty({ description: '头像', required: false })
  icon?: string;

  @ApiProperty({ description: '角色名列表', type: [String] })
  roles: string[];

  @ApiProperty({ description: '菜单树', type: () => [AdminMenuNodeVo] })
  menus: AdminMenuNodeVo[];
}
