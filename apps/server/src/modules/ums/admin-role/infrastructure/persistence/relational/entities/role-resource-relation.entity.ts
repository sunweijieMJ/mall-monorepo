import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('ums_role_resource_relation')
@Unique(['roleId', 'resourceId'])
export class RoleResourceRelationEntity {
  @ApiProperty({ description: '主键ID', type: 'integer' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '角色ID', type: 'integer' })
  @Column({ name: 'role_id', nullable: false, comment: '角色ID' })
  roleId: number;

  @ApiProperty({ description: '资源ID', type: 'integer' })
  @Column({ name: 'resource_id', nullable: false, comment: '资源ID' })
  resourceId: number;
}
