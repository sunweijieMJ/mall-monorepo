import { OmitType } from '@nestjs/swagger';
import { MemberAddressEntity } from '../infrastructure/persistence/relational/entities/member.entity';

/** 会员收货地址 VO */
export class MemberAddressVo extends OmitType(
  MemberAddressEntity,
  [] as const,
) {}
