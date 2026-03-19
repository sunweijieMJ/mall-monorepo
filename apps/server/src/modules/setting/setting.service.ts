import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SettingEntity } from './infrastructure/persistence/relational/entities/setting.entity';

@Injectable()
export class SettingService {
  constructor(
    @InjectRepository(SettingEntity)
    private readonly repo: Repository<SettingEntity>,
  ) {}

  async findByPath(path: string): Promise<SettingEntity | null> {
    return this.repo.findOneBy({ path });
  }

  async upsert(
    path: string,
    value: Record<string, any>,
  ): Promise<SettingEntity> {
    const existing = await this.repo.findOneBy({ path });
    if (existing) {
      existing.value = value;
      return this.repo.save(existing);
    }
    return this.repo.save(this.repo.create({ path, value }));
  }
}
