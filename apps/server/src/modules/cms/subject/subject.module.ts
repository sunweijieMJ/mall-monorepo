import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubjectEntity } from './infrastructure/persistence/relational/entities/subject.entity';
import { SubjectProductRelationEntity } from './infrastructure/persistence/relational/entities/subject-product-relation.entity';
import { ProductEntity } from '@/modules/pms/product/infrastructure/persistence/relational/entities/product.entity';
import { SubjectService } from './subject.service';
import { SubjectController } from './subject.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SubjectEntity,
      SubjectProductRelationEntity,
      ProductEntity,
    ]),
  ],
  controllers: [SubjectController],
  providers: [SubjectService],
  exports: [SubjectService],
})
export class SubjectModule {}
