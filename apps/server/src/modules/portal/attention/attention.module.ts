import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemberBrandAttentionNewEntity } from './infrastructure/persistence/relational/entities/member-brand-attention.entity';
import { BrandEntity } from '@/modules/pms/brand/infrastructure/persistence/relational/entities/brand.entity';
import { MemberEntity } from '@/modules/portal/member/infrastructure/persistence/relational/entities/member.entity';
import { AttentionService } from './attention.service';
import { AttentionController } from './attention.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MemberBrandAttentionNewEntity,
      BrandEntity,
      MemberEntity,
    ]),
  ],
  controllers: [AttentionController],
  providers: [AttentionService],
  exports: [AttentionService],
})
export class AttentionModule {}
