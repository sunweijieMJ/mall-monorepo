import { Injectable } from '@nestjs/common';

@Injectable()
export class MemberService {
  /**
   * 获取会员信息
   * TODO: 迁移自 UmsMemberServiceImpl.getCurrentMember()
   *   - 从 JWT token 中获取 memberId，查询 ums_member
   */
  async getCurrentMember(
    memberId: number,
  ): Promise<Record<string, unknown> | null> {
    // TODO: implement
    return null;
  }

  /**
   * 更新会员信息
   * TODO: 迁移自 UmsMemberServiceImpl.updateInfo()
   *   - UPDATE ums_member SET ... WHERE id = memberId
   */
  async updateInfo(
    memberId: number,
    data: Record<string, unknown>,
  ): Promise<void> {
    // TODO: implement
  }

  // ========== 收货地址 ==========

  /**
   * 获取会员收货地址列表
   * TODO: 迁移自 UmsMemberReceiveAddressServiceImpl.list()
   *   - SELECT * FROM ums_member_receive_address WHERE member_id = memberId
   */
  async listAddress(memberId: number): Promise<unknown[]> {
    // TODO: implement
    return [];
  }

  /**
   * 获取收货地址详情
   * TODO: 迁移自 UmsMemberReceiveAddressServiceImpl.getItem()
   *   - SELECT * FROM ums_member_receive_address WHERE id = id AND member_id = memberId
   */
  async getAddress(
    id: number,
    memberId: number,
  ): Promise<Record<string, unknown> | null> {
    // TODO: implement
    return null;
  }

  /**
   * 添加收货地址
   * TODO: 迁移自 UmsMemberReceiveAddressServiceImpl.add()
   *   - 如果 defaultStatus=1，先将该会员其他地址 defaultStatus 置为 0
   *   - INSERT INTO ums_member_receive_address
   */
  async addAddress(
    memberId: number,
    data: Record<string, unknown>,
  ): Promise<void> {
    // TODO: implement
  }

  /**
   * 更新收货地址
   * TODO: 迁移自 UmsMemberReceiveAddressServiceImpl.update()
   *   - 如果 defaultStatus=1，先将该会员其他地址 defaultStatus 置为 0
   *   - UPDATE ums_member_receive_address SET ... WHERE id = id AND member_id = memberId
   */
  async updateAddress(
    id: number,
    memberId: number,
    data: Record<string, unknown>,
  ): Promise<void> {
    // TODO: implement
  }

  /**
   * 删除收货地址
   * TODO: 迁移自 UmsMemberReceiveAddressServiceImpl.delete()
   *   - DELETE FROM ums_member_receive_address WHERE id = id AND member_id = memberId
   */
  async deleteAddress(id: number, memberId: number): Promise<void> {
    // TODO: implement
  }

  // ========== 商品收藏 ==========

  /**
   * 添加商品收藏
   * TODO: 迁移自 UmsMemberCollectionServiceImpl.addProduct()
   *   - 检查是否已收藏（查 ums_member_product_collection），未收藏则插入
   *   - 同时更新 pms_product 的 sale 字段（+1）
   */
  async addProductCollection(
    memberId: number,
    data: Record<string, unknown>,
  ): Promise<void> {
    // TODO: implement
  }

  /**
   * 删除商品收藏
   * TODO: 迁移自 UmsMemberCollectionServiceImpl.deleteProduct()
   *   - DELETE FROM ums_member_product_collection WHERE member_id = memberId AND product_id = productId
   */
  async deleteProductCollection(
    memberId: number,
    productId: number,
  ): Promise<void> {
    // TODO: implement
  }

  /**
   * 获取商品收藏列表（分页）
   * TODO: 迁移自 UmsMemberCollectionServiceImpl.listProduct()
   *   - SELECT * FROM ums_member_product_collection WHERE member_id = memberId
   */
  async listProductCollection(
    memberId: number,
    pageNum: number,
    pageSize: number,
  ): Promise<unknown> {
    // TODO: implement
    return { list: [], total: 0 };
  }

  /**
   * 获取商品收藏详情
   * TODO: 迁移自 UmsMemberCollectionServiceImpl.getProduct()
   *   - SELECT * FROM ums_member_product_collection WHERE member_id = memberId AND product_id = productId
   */
  async getProductCollectionDetail(
    memberId: number,
    productId: number,
  ): Promise<unknown> {
    // TODO: implement
    return null;
  }

  /**
   * 清空商品收藏
   * TODO: 迁移自 UmsMemberCollectionServiceImpl.clearProduct()
   *   - DELETE FROM ums_member_product_collection WHERE member_id = memberId
   */
  async clearProductCollection(memberId: number): Promise<void> {
    // TODO: implement
  }

  // ========== 品牌关注 ==========

  /**
   * 添加品牌关注
   * TODO: 迁移自 UmsMemberCollectionServiceImpl.addBrand()
   *   - 检查是否已关注，未关注则插入 ums_member_brand_attention
   */
  async addBrandAttention(
    memberId: number,
    data: Record<string, unknown>,
  ): Promise<void> {
    // TODO: implement
  }

  /**
   * 删除品牌关注
   * TODO: 迁移自 UmsMemberCollectionServiceImpl.deleteBrand()
   *   - DELETE FROM ums_member_brand_attention WHERE member_id = memberId AND brand_id = brandId
   */
  async deleteBrandAttention(memberId: number, brandId: number): Promise<void> {
    // TODO: implement
  }

  /**
   * 获取品牌关注列表（分页）
   * TODO: 迁移自 UmsMemberCollectionServiceImpl.listBrand()
   */
  async listBrandAttention(
    memberId: number,
    pageNum: number,
    pageSize: number,
  ): Promise<unknown> {
    // TODO: implement
    return { list: [], total: 0 };
  }

  /**
   * 获取品牌关注详情
   * TODO: 迁移自 UmsMemberCollectionServiceImpl.getBrand()
   */
  async getBrandAttentionDetail(
    memberId: number,
    brandId: number,
  ): Promise<unknown> {
    // TODO: implement
    return null;
  }

  /**
   * 清空品牌关注
   * TODO: 迁移自 UmsMemberCollectionServiceImpl.clearBrand()
   */
  async clearBrandAttention(memberId: number): Promise<void> {
    // TODO: implement
  }

  // ========== 浏览历史 ==========

  /**
   * 创建浏览记录
   * TODO: 迁移自 UmsMemberReadHistoryServiceImpl.save()
   *   - 先删除旧记录（同一会员+商品），再插入新记录
   */
  async createReadHistory(
    memberId: number,
    data: Record<string, unknown>,
  ): Promise<void> {
    // TODO: implement
  }

  /**
   * 获取浏览历史列表（分页）
   * TODO: 迁移自 UmsMemberReadHistoryServiceImpl.list()
   *   - SELECT * FROM ums_member_product_history WHERE member_id = memberId ORDER BY create_time DESC
   */
  async listReadHistory(
    memberId: number,
    pageNum: number,
    pageSize: number,
  ): Promise<unknown> {
    // TODO: implement
    return { list: [], total: 0 };
  }

  /**
   * 清空浏览历史
   * TODO: 迁移自 UmsMemberReadHistoryServiceImpl.clear()
   *   - DELETE FROM ums_member_product_history WHERE member_id = memberId
   */
  async clearReadHistory(memberId: number): Promise<void> {
    // TODO: implement
  }
}
