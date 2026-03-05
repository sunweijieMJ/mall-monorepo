import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReturnApplyEntity } from './infrastructure/persistence/relational/entities/return-apply.entity';
import { ReturnApplyService } from './return-apply.service';
import { ReturnApplyController } from './return-apply.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ReturnApplyEntity])],
  controllers: [ReturnApplyController],
  providers: [ReturnApplyService],
  exports: [ReturnApplyService],
})
export class ReturnApplyModule {}
