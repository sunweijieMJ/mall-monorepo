import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemberReadHistoryNewEntity } from './infrastructure/persistence/relational/entities/member-read-history.entity';
import { ProductEntity } from '@/modules/pms/product/infrastructure/persistence/relational/entities/product.entity';
import { ReadHistoryService } from './read-history.service';
import { ReadHistoryController } from './read-history.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([MemberReadHistoryNewEntity, ProductEntity]),
  ],
  controllers: [ReadHistoryController],
  providers: [ReadHistoryService],
  exports: [ReadHistoryService],
})
export class ReadHistoryModule {}
