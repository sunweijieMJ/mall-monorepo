import { OmitType } from '@nestjs/swagger';
import { CompanyAddressEntity } from '../infrastructure/persistence/relational/entities/company-address.entity';

export class CompanyAddressVo extends OmitType(
  CompanyAddressEntity,
  [] as const,
) {}
