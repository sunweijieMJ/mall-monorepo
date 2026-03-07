import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CompanyAddressService } from '@/modules/oms/company-address/company-address.service';
import { CompanyAddressEntity } from '@/modules/oms/company-address/infrastructure/persistence/relational/entities/company-address.entity';
import { createMockRepository } from '../../../../helpers/mock.factory';

const addressFixture = {
  id: 1,
  addressName: '总部仓库',
  sendStatus: 1,
  receiveStatus: 1,
  name: '张三',
  phone: '13800138000',
  province: '北京',
  city: '北京市',
  region: '朝阳区',
  detailAddress: '建国路88号',
} as CompanyAddressEntity;

describe('CompanyAddressService', () => {
  let service: CompanyAddressService;
  const mockRepo = createMockRepository();

  beforeEach(async () => {
    vi.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        CompanyAddressService,
        {
          provide: getRepositoryToken(CompanyAddressEntity),
          useValue: mockRepo,
        },
      ],
    }).compile();
    service = module.get(CompanyAddressService);
  });

  describe('list', () => {
    it('查询所有公司地址', async () => {
      mockRepo.find.mockResolvedValue([addressFixture]);

      const result = await service.list();

      expect(result).toHaveLength(1);
      expect(mockRepo.find).toHaveBeenCalled();
    });
  });

  describe('getItem', () => {
    it('存在 -> 返回地址', async () => {
      mockRepo.findOneBy.mockResolvedValue(addressFixture);

      const result = await service.getItem(1);

      expect(result).toEqual(addressFixture);
      expect(mockRepo.findOneBy).toHaveBeenCalledWith({ id: 1 });
    });

    it('不存在 -> 返回 null', async () => {
      mockRepo.findOneBy.mockResolvedValue(null);

      const result = await service.getItem(999);

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('创建公司地址', async () => {
      mockRepo.save.mockResolvedValue(addressFixture);

      const result = await service.create({
        addressName: '总部仓库',
        name: '张三',
      });

      expect(result).toEqual(addressFixture);
      expect(mockRepo.create).toHaveBeenCalled();
      expect(mockRepo.save).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('更新公司地址', async () => {
      mockRepo.update.mockResolvedValue({ affected: 1 });

      await service.update(1, { name: '李四' });

      expect(mockRepo.update).toHaveBeenCalledWith(1, { name: '李四' });
    });
  });

  describe('delete', () => {
    it('删除公司地址', async () => {
      mockRepo.delete.mockResolvedValue({ affected: 1 });

      await service.delete(1);

      expect(mockRepo.delete).toHaveBeenCalledWith(1);
    });
  });
});
