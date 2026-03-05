import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderSettingEntity } from './infrastructure/persistence/relational/entities/order-setting.entity';

@Injectable()
export class OrderSettingService {
  constructor(
    @InjectRepository(OrderSettingEntity)
    private readonly repo: Repository<OrderSettingEntity>,
  ) {}

  async getItem(id: number): Promise<OrderSettingEntity | null> {
    return this.repo.findOneBy({ id });
  }

  async update(id: number, dto: Partial<OrderSettingEntity>): Promise<void> {
    await this.repo.update(id, dto);
  }
}
