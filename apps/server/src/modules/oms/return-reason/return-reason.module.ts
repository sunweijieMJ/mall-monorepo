import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReturnReasonEntity } from './infrastructure/persistence/relational/entities/return-reason.entity';
import { ReturnReasonService } from './return-reason.service';
import { ReturnReasonController } from './return-reason.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ReturnReasonEntity])],
  controllers: [ReturnReasonController],
  providers: [ReturnReasonService],
  exports: [ReturnReasonService],
})
export class ReturnReasonModule {}
