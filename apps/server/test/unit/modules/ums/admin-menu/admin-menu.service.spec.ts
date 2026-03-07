import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { AdminMenuService } from '@/modules/ums/admin-menu/admin-menu.service';
import { AdminMenuEntity } from '@/modules/ums/admin-menu/infrastructure/persistence/relational/entities/admin-menu.entity';
import { createMockRepository } from '../../../../helpers/mock.factory';

describe('AdminMenuService', () => {
  let service: AdminMenuService;
  const mockMenuRepo = createMockRepository();

  beforeEach(async () => {
    vi.clearAllMocks();

    const module = await Test.createTestingModule({
      providers: [
        AdminMenuService,
        {
          provide: getRepositoryToken(AdminMenuEntity),
          useValue: mockMenuRepo,
        },
      ],
    }).compile();

    service = module.get(AdminMenuService);
  });

  describe('create', () => {
    it('parentId=0 → level=0', async () => {
      mockMenuRepo.save.mockResolvedValue({ id: 1, parentId: 0, level: 0 });

      const result = await service.create({
        parentId: 0,
        title: '系统管理',
      } as any);

      expect(result.level).toBe(0);
      expect(mockMenuRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ level: 0 }),
      );
    });

    it('有效 parentId → level = parent.level + 1', async () => {
      mockMenuRepo.findOneBy.mockResolvedValue({ id: 1, level: 0 });
      mockMenuRepo.save.mockResolvedValue({ id: 2, parentId: 1, level: 1 });

      const result = await service.create({
        parentId: 1,
        title: '子菜单',
      } as any);

      expect(result.level).toBe(1);
    });

    it('无效 parentId → 抛出 NotFoundException', async () => {
      mockMenuRepo.findOneBy.mockResolvedValue(null);

      await expect(service.create({ parentId: 999 } as any)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('parentId=0 → level=0', async () => {
      mockMenuRepo.update.mockResolvedValue({ affected: 1 });

      const result = await service.update(1, { parentId: 0 } as any);

      expect(result).toBe(1);
      expect(mockMenuRepo.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ level: 0 }),
      );
    });

    it('有效 parentId → level = parent.level + 1', async () => {
      mockMenuRepo.findOneBy.mockResolvedValue({ id: 5, level: 1 });
      mockMenuRepo.update.mockResolvedValue({ affected: 1 });

      await service.update(10, { parentId: 5 } as any);

      expect(mockMenuRepo.update).toHaveBeenCalledWith(
        10,
        expect.objectContaining({ level: 2 }),
      );
    });

    it('无效 parentId → 抛出 NotFoundException', async () => {
      mockMenuRepo.findOneBy.mockResolvedValue(null);

      await expect(service.update(1, { parentId: 999 } as any)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getItem', () => {
    it('存在 → 返回菜单', async () => {
      const menu = { id: 1, title: '系统管理' };
      mockMenuRepo.findOneBy.mockResolvedValue(menu);

      const result = await service.getItem(1);

      expect(result).toBe(menu);
    });

    it('不存在 → 抛出 NotFoundException', async () => {
      mockMenuRepo.findOneBy.mockResolvedValue(null);

      await expect(service.getItem(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('叶子节点 → 仅删除自身', async () => {
      // 全部菜单中无子菜单
      mockMenuRepo.find.mockResolvedValue([
        { id: 1, parentId: 0 },
        { id: 2, parentId: 0 },
      ]);
      mockMenuRepo.delete.mockResolvedValue({ affected: 1 });

      const count = await service.delete(1);

      // 只删除自身（无后代）
      expect(count).toBe(1);
      expect(mockMenuRepo.delete).toHaveBeenCalledWith([1]);
    });

    it('有子菜单 → 级联删除所有后代（BFS）', async () => {
      // 树结构：1 -> [2, 3]，2 -> [4]
      mockMenuRepo.find.mockResolvedValue([
        { id: 1, parentId: 0 },
        { id: 2, parentId: 1 },
        { id: 3, parentId: 1 },
        { id: 4, parentId: 2 },
      ]);
      mockMenuRepo.delete.mockResolvedValue({ affected: 4 });

      const count = await service.delete(1);

      // 删除 2, 3, 4（后代）+ 1（自身）= 4
      expect(count).toBe(4);
      expect(mockMenuRepo.delete).toHaveBeenCalledWith(
        expect.arrayContaining([1, 2, 3, 4]),
      );
    });
  });

  describe('list', () => {
    it('按 parentId 分页查询', async () => {
      mockMenuRepo.findAndCount.mockResolvedValue([
        [{ id: 2, parentId: 1 }],
        1,
      ]);

      const query = { page: 1, limit: 10 } as any;
      const result = await service.list(1, query);

      expect(result.list).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });

  describe('treeList', () => {
    it('构建树形结构', async () => {
      mockMenuRepo.find.mockResolvedValue([
        { id: 1, parentId: 0, sort: 1 },
        { id: 2, parentId: 1, sort: 1 },
        { id: 3, parentId: 0, sort: 2 },
      ]);

      const result = await service.treeList();

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(1);
      expect(result[0].children).toHaveLength(1);
      expect(result[0].children[0].id).toBe(2);
      expect(result[1].id).toBe(3);
      expect(result[1].children).toHaveLength(0);
    });

    it('空列表 → 返回空数组', async () => {
      mockMenuRepo.find.mockResolvedValue([]);

      const result = await service.treeList();

      expect(result).toEqual([]);
    });
  });

  describe('updateHidden', () => {
    it('更新隐藏状态', async () => {
      mockMenuRepo.update.mockResolvedValue({ affected: 1 });

      const result = await service.updateHidden(1, 1);

      expect(result).toBe(1);
      expect(mockMenuRepo.update).toHaveBeenCalledWith(1, { hidden: '1' });
    });
  });
});
