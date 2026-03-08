import { OmitType } from '@nestjs/swagger';
import { AdminUserEntity } from '../infrastructure/persistence/relational/entities/admin-user.entity';

export class AdminUserVo extends OmitType(AdminUserEntity, [
  'password',
] as const) {}
