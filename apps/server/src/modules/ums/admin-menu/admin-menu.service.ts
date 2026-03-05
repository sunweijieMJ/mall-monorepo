import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminMenuEntity } from './infrastructure/persistence/relational/entities/admin-menu.entity';
import { PageQueryDto, PageResult } from '@/common/dto/page-result.dto';

@Injectable()
export class AdminMenuService {
  constructor(
    @InjectRepository(AdminMenuEntity)
    private readonly menuRepo: Repository<AdminMenuEntity>,
  ) {}

  /** 树形菜单（按 parentId） - TODO: 迁移自 UmsMenuServiceImpl.list() */
  async list(
    parentId: number,
    query: PageQueryDto,
  ): Promise<PageResult<AdminMenuEntity>> {
    const [list, total] = await this.menuRepo.findAndCount({
      where: { parentId },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      order: { sort: 'ASC' },
    });
    return PageResult.of(list, total, query);
  }

  /** 获取当前管理员的菜单权限 - TODO */
  async listMenuByAdmin(adminId: number): Promise<any[]> {
    // TODO: 根据管理员 → 角色 → 菜单的关联查询
    return [];
  }

  async create(dto: any): Promise<AdminMenuEntity> {
    return this.menuRepo.save(dto);
  }
  async update(id: number, dto: any): Promise<void> {
    await this.menuRepo.update(id, dto);
  }
  async delete(id: number): Promise<void> {
    await this.menuRepo.delete(id);
  }
}
