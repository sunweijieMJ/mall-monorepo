import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  MemberEntity,
  MemberAddressEntity,
  MemberProductCollectionEntity,
  MemberBrandAttentionEntity,
  MemberReadHistoryEntity,
} from './infrastructure/persistence/relational/entities/member.entity';
import { MemberService } from './member.service';
import {
  MemberInfoController,
  MemberAddressController,
  MemberProductCollectionController,
  MemberBrandAttentionController,
  MemberReadHistoryController,
} from './member.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MemberEntity,
      MemberAddressEntity,
      MemberProductCollectionEntity,
      MemberBrandAttentionEntity,
      MemberReadHistoryEntity,
    ]),
  ],
  controllers: [
    MemberInfoController,
    MemberAddressController,
    MemberProductCollectionController,
    MemberBrandAttentionController,
    MemberReadHistoryController,
  ],
  providers: [MemberService],
  exports: [MemberService],
})
export class PortalMemberModule {}
