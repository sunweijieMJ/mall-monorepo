import { OmitType } from '@nestjs/swagger';
import { ReturnReasonEntity } from '../infrastructure/persistence/relational/entities/return-reason.entity';

export class ReturnReasonVo extends OmitType(ReturnReasonEntity, [] as const) {}
