import { OmitType } from '@nestjs/swagger';
import { HomeNewProductEntity } from '../infrastructure/persistence/relational/entities/home-content.entity';

export class HomeNewProductVo extends OmitType(
  HomeNewProductEntity,
  [] as const,
) {}
