import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { MemberEntity } from '@/modules/portal/member/infrastructure/persistence/relational/entities/member.entity';

@Injectable()
export class MemberSeedService {
  private readonly logger = new Logger(MemberSeedService.name);

  constructor(
    @InjectRepository(MemberEntity)
    private readonly memberRepo: Repository<MemberEntity>,
  ) {}

  async run(): Promise<void> {
    const count = await this.memberRepo.count();
    if (count > 0) {
      this.logger.log('会员数据已存在，跳过');
      return;
    }

    // 创建默认会员，密码使用 bcrypt 加密
    const hashedPassword = await bcrypt.hash('User@123', 10);
    await this.memberRepo.save(
      this.memberRepo.create({
        username: '13800138000',
        password: hashedPassword,
        phone: '13800138000',
        nickname: '测试用户',
        status: 1,
        integration: 5000,
        growth: 1000,
      }),
    );

    this.logger.log('已创建默认会员: 13800138000 / User@123');
  }
}
