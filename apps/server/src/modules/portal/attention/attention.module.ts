import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemberBrandAttentionNewEntity } from './infrastructure/persistence/relational/entities/member-brand-attention.entity';
import { AttentionService } from './attention.service';
import { AttentionController } from './attention.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MemberBrandAttentionNewEntity])],
  controllers: [AttentionController],
  providers: [AttentionService],
  exports: [AttentionService],
})
export class AttentionModule {}
