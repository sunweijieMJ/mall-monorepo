import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReturnApplyEntity } from './infrastructure/persistence/relational/entities/return-apply.entity';
import { OrderEntity } from '../order/infrastructure/persistence/relational/entities/order.entity';
import { OrderItemEntity } from '../order/infrastructure/persistence/relational/entities/order-item.entity';
import { MemberEntity } from '@/modules/portal/member/infrastructure/persistence/relational/entities/member.entity';
import { ReturnApplyService } from './return-apply.service';
import {
  ReturnApplyController,
  PortalReturnApplyController,
} from './return-apply.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ReturnApplyEntity,
      OrderEntity,
      OrderItemEntity,
      MemberEntity,
    ]),
  ],
  controllers: [ReturnApplyController, PortalReturnApplyController],
  providers: [ReturnApplyService],
  exports: [ReturnApplyService],
})
export class ReturnApplyModule {}
