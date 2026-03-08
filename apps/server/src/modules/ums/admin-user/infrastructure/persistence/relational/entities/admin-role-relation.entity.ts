import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('ums_admin_role_relation')
@Unique(['adminId', 'roleId'])
export class AdminRoleRelationEntity {
  @ApiProperty({ description: '主键ID', type: 'integer' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '管理员ID', type: 'integer' })
  @Column({ name: 'admin_id', nullable: false })
  adminId: number;

  @ApiProperty({ description: '角色ID', type: 'integer' })
  @Column({ name: 'role_id', nullable: false })
  roleId: number;
}
