import http from '../instance';
import type {
  Product,
  ProductCategory,
  PaginationResult,
  ProductDetailResponse,
  SearchProductParams,
} from '@/interface';

const Dict = {
  searchProductList: `/product/search`,
  fetchCategoryTreeList: `/product/categoryTreeList`,
  fetchProductDetail: `/product/detail`,
} as const;

/**
 * 商品接口服务
 */
const ProductService = {
  /**
   * 搜索商品列表
   * @param params
   * @returns
   */
  searchProductList(params: SearchProductParams) {
    return http.get<PaginationResult<Product>>(Dict.searchProductList, {
      params,
    });
  },

  /**
   * 获取商品分类树列表
   * @returns
   */
  fetchCategoryTreeList() {
    return http.get<ProductCategory[]>(Dict.fetchCategoryTreeList);
  },

  /**
   * 获取商品详情
   * @param id
   * @returns
   */
  fetchProductDetail(id: number) {
    return http.get<ProductDetailResponse>(`${Dict.fetchProductDetail}/${id}`);
  },
};

export default ProductService;
