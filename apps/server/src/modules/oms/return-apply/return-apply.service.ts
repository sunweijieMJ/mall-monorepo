import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReturnApplyEntity } from './infrastructure/persistence/relational/entities/return-apply.entity';
import {
  OrderEntity,
  OrderStatus,
} from '../order/infrastructure/persistence/relational/entities/order.entity';
import { OrderItemEntity } from '../order/infrastructure/persistence/relational/entities/order-item.entity';
import { MemberEntity } from '@/modules/portal/member/infrastructure/persistence/relational/entities/member.entity';
import { PageQueryDto, PageResult } from '@/common/dto/page-result.dto';
import { paginate } from '@/common/utils/paginate.util';
import { ReturnApplyQueryDto } from './dto/return-apply-query.dto';
import { PortalCreateReturnApplyDto } from './dto/portal-create-return-apply.dto';
import { UpdateReturnStatusDto } from './dto/update-return-status.dto';

@Injectable()
export class ReturnApplyService {
  constructor(
    @InjectRepository(ReturnApplyEntity)
    private readonly repo: Repository<ReturnApplyEntity>,
    @InjectRepository(OrderEntity)
    private readonly orderRepo: Repository<OrderEntity>,
    @InjectRepository(OrderItemEntity)
    private readonly orderItemRepo: Repository<OrderItemEntity>,
    @InjectRepository(MemberEntity)
    private readonly memberRepo: Repository<MemberEntity>,
  ) {}

  /**
   * 退货申请列表
   * 支持 status / 时间范围过滤
   */
  async list(
    query: ReturnApplyQueryDto,
  ): Promise<PageResult<ReturnApplyEntity>> {
    const qb = this.repo.createQueryBuilder('ra');

    // 状态过滤
    if (query.status !== undefined) {
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

    qb.orderBy('ra.id', 'DESC');

    return paginate(qb, query);
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
  async updateStatus(
    id: number,
    dto: Omit<UpdateReturnStatusDto, 'id'>,
  ): Promise<number> {
    // 状态机校验：只允许合法的状态流转
    const allowedTransitions: Record<number, number[]> = {
      0: [1, 3], // 待处理 → 退货中 | 已拒绝
      1: [2, 3], // 退货中 → 已完成 | 已拒绝
    };

    const current = await this.repo.findOneBy({ id });
    if (!current) {
      throw new NotFoundException(`退货申请 ${id} 不存在`);
    }

    const allowed = allowedTransitions[current.status];
    if (!allowed || !allowed.includes(dto.status)) {
      throw new BadRequestException(
        `退货申请状态不允许从 ${current.status} 变更为 ${dto.status}`,
      );
    }

    const updateFields: Partial<ReturnApplyEntity> = {
      status: dto.status,
    };

    if (dto.handleNote !== undefined) updateFields.handleNote = dto.handleNote;
    if (dto.handleMan !== undefined) updateFields.handleMan = dto.handleMan;
    if (dto.receiveMan !== undefined) updateFields.receiveMan = dto.receiveMan;
    if (dto.refundAmount !== undefined)
      updateFields.returnAmount = String(dto.refundAmount);
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

    const result = await this.repo
      .createQueryBuilder()
      .update()
      .set(updateFields)
      .where('id = :id', { id })
      .execute();
    return result.affected ?? 0;
  }

  /**
   * 处理退货申请（兼容旧接口）
   * 迁移自 OmsOrderReturnApplyServiceImpl.update()
   */
  async handle(id: number, dto: any): Promise<number> {
    return this.updateStatus(id, dto);
  }

  /**
   * 确认收货（兼容旧接口）
   */
  async confirmReceive(id: number, dto: any): Promise<number> {
    return this.updateStatus(id, { status: 2, ...dto });
  }

  /**
   * 删除退货申请
   */
  async delete(ids: number[]): Promise<number> {
    const result = await this.repo.softDelete(ids);
    return result.affected ?? 0;
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

    // 仅已发货或已完成的订单可以申请退货
    const allowedStatuses = [OrderStatus.SHIPPING, OrderStatus.COMPLETED];
    if (!allowedStatuses.includes(order.status)) {
      throw new BadRequestException('当前订单状态不允许申请退货');
    }

    // 从 OrderItem 查询商品信息，防止前端伪造
    const orderItem = await this.orderItemRepo.findOne({
      where: { orderId: dto.orderId, productId: dto.productId },
    });
    if (!orderItem) {
      throw new BadRequestException('该订单中不存在此商品');
    }

    // 从数据库查询会员信息
    const member = await this.memberRepo.findOne({
      where: { id: memberId },
    });

    const entity = this.repo.create({
      memberId,
      orderId: dto.orderId,
      orderSn: order.orderSn,
      productId: dto.productId,
      returnName: dto.returnName ?? '',
      returnPhone: dto.returnPhone ?? '',
      memberUsername: member?.username ?? '',
      reason: dto.reason ?? '',
      description: dto.description,
      proofPics: dto.proofPics,
      productName: orderItem.productName ?? '',
      productPic: orderItem.productPic,
      productBrand: orderItem.productBrand,
      productAttr: orderItem.productAttr,
      productCount: orderItem.productQuantity ?? 1,
      productPrice: orderItem.productPrice,
      productRealPrice: orderItem.realAmount,
      returnAmount: String(dto.returnAmount ?? 0),
      status: 0, // 待处理
    });
    return this.repo.save(entity);
  }

  /**
   * 会员查看退货申请详情（校验归属权）
   */
  async portalDetail(id: number, memberId: number): Promise<ReturnApplyEntity> {
    const apply = await this.repo.findOne({ where: { id, memberId } });
    if (!apply) throw new NotFoundException(`退货申请 ${id} 不存在或无权查看`);
    return apply;
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
