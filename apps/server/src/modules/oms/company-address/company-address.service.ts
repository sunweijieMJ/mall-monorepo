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

  async update(
    id: number,
    dto: Partial<CompanyAddressEntity>,
  ): Promise<number> {
    const result = await this.repo.update(id, dto);
    return result.affected ?? 0;
  }

  async delete(id: number): Promise<number> {
    const result = await this.repo.softDelete(id);
    return result.affected ?? 0;
  }
}
