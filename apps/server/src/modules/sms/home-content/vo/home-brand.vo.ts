import { OmitType } from '@nestjs/swagger';
import { HomeBrandEntity } from '../infrastructure/persistence/relational/entities/home-content.entity';

export class HomeBrandVo extends OmitType(HomeBrandEntity, [] as const) {}
