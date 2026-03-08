import { OmitType } from '@nestjs/swagger';
import { HomeAdvertiseEntity } from '../infrastructure/persistence/relational/entities/home-content.entity';

export class HomeAdvertiseVo extends OmitType(
  HomeAdvertiseEntity,
  [] as const,
) {}
