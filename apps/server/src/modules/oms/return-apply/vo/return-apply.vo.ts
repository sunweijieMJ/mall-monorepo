import { OmitType } from '@nestjs/swagger';
import { ReturnApplyEntity } from '../infrastructure/persistence/relational/entities/return-apply.entity';

export class ReturnApplyVo extends OmitType(ReturnApplyEntity, [] as const) {}
