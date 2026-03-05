import { Injectable, NotFoundException } from '@nestjs/common';
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

  /** 创建菜单 */
  async create(dto: Partial<AdminMenuEntity>): Promise<AdminMenuEntity> {
    // 计算 level
    if (dto.parentId !== 0 && dto.parentId != null) {
      const parent = await this.menuRepo.findOneBy({ id: dto.parentId });
      if (parent) {
        dto.level = parent.level + 1;
      } else {
        dto.level = 0;
      }
    } else {
      dto.level = 0;
    }
    return this.menuRepo.save(dto);
  }

  /** 更新菜单 */
  async update(id: number, dto: Partial<AdminMenuEntity>): Promise<number> {
    // 计算 level
    if (dto.parentId === 0 || dto.parentId == null) {
      dto.level = 0;
    } else {
      const parent = await this.menuRepo.findOneBy({ id: dto.parentId });
      dto.level = parent ? parent.level + 1 : 0;
    }
    await this.menuRepo.update(id, dto);
    return 1;
  }

  /** 获取单个菜单 */
  async getItem(id: number): Promise<AdminMenuEntity> {
    const menu = await this.menuRepo.findOneBy({ id });
    if (!menu) throw new NotFoundException('菜单不存在');
    return menu;
  }

  /** 删除菜单 */
  async delete(id: number): Promise<number> {
    await this.menuRepo.delete(id);
    return 1;
  }

  /** 分页查询菜单（按 parentId） */
  async list(
    parentId: number,
    query: PageQueryDto,
  ): Promise<PageResult<AdminMenuEntity>> {
    const [list, total] = await this.menuRepo.findAndCount({
      where: { parentId },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      order: { sort: 'DESC' },
    });
    return PageResult.of(list, total, query);
  }

  /** 树形菜单 */
  async treeList(): Promise<any[]> {
    const menuList = await this.menuRepo.find();
    return this.buildTree(menuList, 0);
  }

  /** 更新隐藏状态 */
  async updateHidden(id: number, hidden: number): Promise<number> {
    await this.menuRepo.update(id, { hidden: String(hidden) });
    return 1;
  }

  private buildTree(
    menus: AdminMenuEntity[],
    parentId: number,
  ): (AdminMenuEntity & { children: any[] })[] {
    return menus
      .filter((m) => m.parentId === parentId)
      .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
      .map((menu) => ({
        ...menu,
        children: this.buildTree(menus, menu.id),
      }));
  }
}
