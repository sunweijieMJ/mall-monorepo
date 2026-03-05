import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReturnApplyEntity } from './infrastructure/persistence/relational/entities/return-apply.entity';
import { OrderEntity } from '../order/infrastructure/persistence/relational/entities/order.entity';
import { PageQueryDto, PageResult } from '@/common/dto/page-result.dto';

/** 会员提交退货申请 DTO */
export interface PortalCreateReturnApplyDto {
  /** 订单 ID */
  orderId: number;
  /** 订单编号 */
  orderSn: string;
  /** 商品 ID */
  productId: number;
  /** 退货原因（文字描述） */
  returnReason?: string;
  /** 退货说明 */
  description?: string;
  /** 凭证图片，逗号分隔 */
  proofPics?: string;
  /** 商品名称 */
  productName?: string;
  /** 商品图片 */
  productPic?: string;
  /** 商品品牌 */
  productBrand?: string;
  /** 商品属性 */
  productAttr?: string;
  /** 商品数量 */
  productCount?: number;
  /** 商品单价 */
  productPrice?: number;
  /** 商品实际支付价格 */
  productRealPrice?: number;
  /** 退款金额 */
  returnAmount?: number;
  /** 退货人姓名 */
  returnName?: string;
  /** 退货人电话 */
  returnPhone?: string;
  /** 会员用户名 */
  memberUsername?: string;
}

/** 更新退货状态 DTO */
export interface UpdateReturnStatusDto {
  /** 申请状态：0->待处理；1->退货中；2->已完成；3->已拒绝 */
  status: number;
  /** 处理备注 */
  handleNote?: string;
  /** 处理人 */
  handleMan?: string;
  /** 收货人 */
  receiveMan?: string;
  /** 退款金额 */
  refundAmount?: number;
  /** 公司收货地址 ID */
  companyAddressId?: number;
  /** 收货备注 */
  receiveNote?: string;
}

@Injectable()
export class ReturnApplyService {
  constructor(
    @InjectRepository(ReturnApplyEntity)
    private readonly repo: Repository<ReturnApplyEntity>,
    @InjectRepository(OrderEntity)
    private readonly orderRepo: Repository<OrderEntity>,
  ) {}

  /**
   * 退货申请列表
   * 支持 status / 时间范围过滤
   */
  async list(
    query: PageQueryDto & Record<string, any>,
  ): Promise<PageResult<ReturnApplyEntity>> {
    const qb = this.repo.createQueryBuilder('ra');

    // 状态过滤
    if (query.status !== undefined && query.status !== '') {
      qb.andWhere('ra.status = :status', { status: Number(query.status) });
    }

    // 创建时间范围过滤
    if (query.startTime) {
      qb.andWhere('ra.createdAt >= :startTime', {
        startTime: new Date(query.startTime),
      });
    }
    if (query.endTime) {
      qb.andWhere('ra.createdAt <= :endTime', {
        endTime: new Date(query.endTime),
      });
    }

    qb.orderBy('ra.id', 'DESC')
      .skip((query.page - 1) * query.limit)
      .take(query.limit);

    const [list, total] = await qb.getManyAndCount();
    return PageResult.of(list, total, query);
  }

  /**
   * 获取退货申请详情
   */
  async detail(id: number): Promise<ReturnApplyEntity> {
    return this.repo.findOneByOrFail({ id });
  }

  /**
   * 更新退货申请状态
   * 包含处理备注、处理人、收货人、退款金额等信息更新
   */
  async updateStatus(id: number, dto: UpdateReturnStatusDto): Promise<void> {
    const updateFields: Partial<ReturnApplyEntity> = {
      status: dto.status,
    };

    if (dto.handleNote !== undefined) updateFields.handleNote = dto.handleNote;
    if (dto.handleMan !== undefined) updateFields.handleMan = dto.handleMan;
    if (dto.receiveMan !== undefined) updateFields.receiveMan = dto.receiveMan;
    if (dto.refundAmount !== undefined)
      updateFields.returnAmount = dto.refundAmount;
    if (dto.companyAddressId !== undefined)
      updateFields.companyAddressId = dto.companyAddressId;
    if (dto.receiveNote !== undefined)
      updateFields.receiveNote = dto.receiveNote;

    // 处理时间：状态变更时记录
    updateFields.handleTime = new Date();

    // 确认收货时记录收货时间
    if (dto.status === 2 && dto.receiveMan) {
      updateFields.receiveTime = new Date();
    }

    await this.repo
      .createQueryBuilder()
      .update()
      .set(updateFields)
      .where('id = :id', { id })
      .execute();
  }

  /**
   * 处理退货申请（兼容旧接口）
   * 迁移自 OmsOrderReturnApplyServiceImpl.update()
   */
  async handle(id: number, dto: any): Promise<void> {
    return this.updateStatus(id, dto);
  }

  /**
   * 确认收货（兼容旧接口）
   */
  async confirmReceive(id: number, dto: any): Promise<void> {
    return this.updateStatus(id, { status: 2, ...dto });
  }

  /**
   * 删除退货申请
   */
  async delete(ids: number[]): Promise<void> {
    await this.repo.delete(ids);
  }

  // ========== 移动端（Portal）接口 ==========

  /**
   * 会员提交退货申请
   * status 初始为 0（待处理）
   */
  async portalCreate(
    memberId: number,
    dto: PortalCreateReturnApplyDto,
  ): Promise<ReturnApplyEntity> {
    // 校验订单归属权：只能对自己的订单申请退货
    const order = await this.orderRepo.findOne({
      where: { id: dto.orderId, memberId },
    });
    if (!order) {
      throw new BadRequestException('订单不存在或无权操作');
    }

    const entity = this.repo.create({
      memberId,
      orderId: dto.orderId,
      orderSn: dto.orderSn ?? '',
      productId: dto.productId,
      returnName: dto.returnName ?? '',
      returnPhone: dto.returnPhone ?? '',
      memberUsername: dto.memberUsername ?? '',
      reason: dto.returnReason ?? '',
      description: dto.description,
      proofPics: dto.proofPics,
      productName: dto.productName ?? '',
      productPic: dto.productPic,
      productBrand: dto.productBrand,
      productAttr: dto.productAttr,
      productCount: dto.productCount ?? 1,
      productPrice: dto.productPrice,
      productRealPrice: dto.productRealPrice,
      returnAmount: dto.returnAmount ?? 0,
      status: 0, // 待处理
    });
    return this.repo.save(entity);
  }

  /**
   * 会员查看自己的退货申请列表（分页）
   * 按创建时间倒序排列
   */
  async portalList(
    memberId: number,
    query: PageQueryDto,
  ): Promise<PageResult<ReturnApplyEntity>> {
    const [list, total] = await this.repo.findAndCount({
      where: { memberId },
      order: { createdAt: 'DESC' },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    });
    return PageResult.of(list, total, query);
  }
}
