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
      if (!parent) {
        throw new NotFoundException(`父菜单 ${dto.parentId} 不存在`);
      }
      dto.level = parent.level + 1;
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
      if (!parent) {
        throw new NotFoundException(`父菜单 ${dto.parentId} 不存在`);
      }
      dto.level = parent.level + 1;
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

  /** 删除菜单（级联删除所有子菜单） */
  async delete(id: number): Promise<number> {
    // 递归收集所有后代菜单 ID
    const idsToDelete = await this.collectDescendantIds(id);
    idsToDelete.push(id);
    await this.menuRepo.delete(idsToDelete);
    return idsToDelete.length;
  }

  /** 收集所有后代菜单 ID（一次查询全部菜单，内存递归，避免 N+1） */
  private async collectDescendantIds(parentId: number): Promise<number[]> {
    const allMenus = await this.menuRepo.find({ select: ['id', 'parentId'] });
    // 构建 parentId -> children 映射
    const childrenMap = new Map<number, number[]>();
    for (const menu of allMenus) {
      const list = childrenMap.get(menu.parentId) ?? [];
      list.push(menu.id);
      childrenMap.set(menu.parentId, list);
    }
    // BFS 收集所有后代
    const result: number[] = [];
    const queue = childrenMap.get(parentId) ?? [];
    while (queue.length > 0) {
      const id = queue.shift()!;
      result.push(id);
      const children = childrenMap.get(id);
      if (children) queue.push(...children);
    }
    return result;
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
