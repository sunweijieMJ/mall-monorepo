import { OmitType } from '@nestjs/swagger';
import { HomeSubjectEntity } from '../infrastructure/persistence/relational/entities/home-content.entity';

export class HomeSubjectVo extends OmitType(HomeSubjectEntity, [] as const) {}
