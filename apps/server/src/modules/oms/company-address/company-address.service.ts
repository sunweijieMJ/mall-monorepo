import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompanyAddressEntity } from './infrastructure/persistence/relational/entities/company-address.entity';

@Injectable()
export class CompanyAddressService {
  constructor(
    @InjectRepository(CompanyAddressEntity)
    private readonly repo: Repository<CompanyAddressEntity>,
  ) {}

  async list(): Promise<CompanyAddressEntity[]> {
    return this.repo.find();
  }

  async getItem(id: number): Promise<CompanyAddressEntity | null> {
    return this.repo.findOneBy({ id });
  }

  async create(
    dto: Partial<CompanyAddressEntity>,
  ): Promise<CompanyAddressEntity> {
    const entity = this.repo.create(dto);
    return this.repo.save(entity);
  }

  async update(id: number, dto: Partial<CompanyAddressEntity>): Promise<void> {
    await this.repo.update(id, dto);
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
