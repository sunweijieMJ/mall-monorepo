import http from '../instance';
import type {
  ApiResponse,
  PaginationParams,
  PaginationResult,
  BrandAttentionParams,
  CreateBrandAttentionData,
  BrandAttention,
} from '@/interface';

const Dict = {
  createBrandAttention: `/member/attention/add`,
  deleteBrandAttention: `/member/attention/delete`,
  fetchBrandAttentionList: `/member/attention/list`,
  brandAttentionDetail: `/member/attention/detail`,
  clearBrandAttention: `/member/attention/clear`,
} as const;

/**
 * 品牌关注接口服务
 */
const MemberBrandAttentionService = {
  /**
   * 创建品牌关注
   * @param data
   * @returns
   */
  createBrandAttention(data: CreateBrandAttentionData) {
    return http.post<BrandAttention>(Dict.createBrandAttention, data);
  },

  /**
   * 删除品牌关注
   * @param params
   * @returns
   */
  deleteBrandAttention(params: { brandId: number }) {
    return http.post<ApiResponse>(Dict.deleteBrandAttention, null, { params });
  },

  /**
   * 获取品牌关注列表
   * @param params
   * @returns
   */
  fetchBrandAttentionList(params: PaginationParams) {
    return http.get<PaginationResult<BrandAttention>>(
      Dict.fetchBrandAttentionList,
      { params },
    );
  },

  /**
   * 获取品牌关注详情
   * @param params
   * @returns
   */
  brandAttentionDetail(params: BrandAttentionParams) {
    return http.get<BrandAttention>(Dict.brandAttentionDetail, { params });
  },

  /**
   * 清空品牌关注
   * @returns
   */
  clearBrandAttention() {
    return http.post<ApiResponse>(Dict.clearBrandAttention);
  },
};

export default MemberBrandAttentionService;
