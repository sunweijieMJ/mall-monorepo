import { OmitType } from '@nestjs/swagger';
import { SubjectEntity } from '../infrastructure/persistence/relational/entities/subject.entity';

export class SubjectVo extends OmitType(SubjectEntity, [] as const) {}
