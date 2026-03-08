import { OmitType } from '@nestjs/swagger';
import { OrderSettingEntity } from '../infrastructure/persistence/relational/entities/order-setting.entity';

export class OrderSettingVo extends OmitType(OrderSettingEntity, [] as const) {}
