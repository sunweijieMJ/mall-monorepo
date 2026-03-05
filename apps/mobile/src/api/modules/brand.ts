import http from '../instance';
import type {
  Brand,
  Product,
  PaginationParams,
  PaginationResult,
} from '@/interface';

const Dict = {
  getBrandDetail: `/brand/detail`,
  fetchBrandProductList: `/brand/productList`,
  fetchBrandRecommendList: `/brand/recommendList`,
} as const;

/**
 * 品牌接口服务
 */
const BrandService = {
  /**
   * 获取品牌详情
   * @param id
   * @returns
   */
  getBrandDetail(id: number) {
    return http.get<Brand>(`${Dict.getBrandDetail}/${id}`);
  },

  /**
   * 获取品牌产品列表
   * @param params
   * @returns
   */
  fetchBrandProductList(params: PaginationParams & { brandId: number }) {
    return http.get<PaginationResult<Product>>(Dict.fetchBrandProductList, {
      params,
    });
  },

  /**
   * 获取推荐品牌列表
   * @param params
   * @returns
   */
  fetchBrandRecommendList(params: PaginationParams) {
    return http.get<PaginationResult<Brand>>(Dict.fetchBrandRecommendList, {
      params,
    });
  },
};

export default BrandService;
