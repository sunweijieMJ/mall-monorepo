import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { MemberLevelEntity } from './infrastructure/persistence/relational/entities/member-level.entity';

@Injectable()
export class MemberLevelService {
  constructor(
    @InjectRepository(MemberLevelEntity)
    private readonly memberLevelRepo: Repository<MemberLevelEntity>,
  ) {}

  /**
   * 查询会员等级列表
   * @param defaultStatus 默认等级过滤（0-非默认，1-默认），不传则查全部
   */
  async list(defaultStatus?: number): Promise<MemberLevelEntity[]> {
    if (defaultStatus != null) {
      return this.memberLevelRepo.find({ where: { defaultStatus } });
    }
    return this.memberLevelRepo.find();
  }

  /**
   * 查询单条会员等级
   * @param id 会员等级 ID
   */
  async getItem(id: number): Promise<MemberLevelEntity> {
    const entity = await this.memberLevelRepo.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`会员等级 ${id} 不存在`);
    }
    return entity;
  }

  /**
   * 创建会员等级
   * @param dto 会员等级数据
   */
  async create(dto: Partial<MemberLevelEntity>): Promise<MemberLevelEntity> {
    const entity = this.memberLevelRepo.create(dto);
    return this.memberLevelRepo.save(entity);
  }

  /**
   * 更新会员等级
   * @param id 会员等级 ID
   * @param dto 更新字段
   */
  async update(
    id: number,
    dto: Partial<MemberLevelEntity>,
  ): Promise<MemberLevelEntity> {
    // 先确认记录存在
    await this.getItem(id);
    await this.memberLevelRepo.update(id, dto);
    return this.getItem(id);
  }

  /**
   * 批量删除会员等级
   * @param ids 会员等级 ID 列表
   */
  async delete(ids: number[]): Promise<void> {
    await this.memberLevelRepo.delete({ id: In(ids) });
  }
}
