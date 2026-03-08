import { OmitType } from '@nestjs/swagger';
import { MemberEntity } from '../infrastructure/persistence/relational/entities/member.entity';

/** 会员信息 VO（排除密码字段） */
export class MemberVo extends OmitType(MemberEntity, ['password'] as const) {}
