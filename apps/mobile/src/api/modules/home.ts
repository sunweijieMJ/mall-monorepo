import http from '../instance';
import type {
  Product,
  ProductCategory,
  PaginationParams,
  PaginationResult,
  HomeContent,
} from '@/interface';

const Dict = {
  fetchContent: `/home/content`,
  fetchRecommendProductList: `/home/recommendProductList`,
  fetchProductCateList: `/home/productCateList`,
  fetchNewProductList: `/home/newProductList`,
  fetchHotProductList: `/home/hotProductList`,
} as const;

/**
 * 首页接口服务
 */
const HomeService = {
  /**
   * 获取首页内容
   * @returns
   */
  fetchContent() {
    return http.get<HomeContent>(Dict.fetchContent);
  },

  /**
   * 获取推荐商品列表
   * @param params
   * @returns
   */
  fetchRecommendProductList(params: PaginationParams) {
    return http.get<Product[]>(Dict.fetchRecommendProductList, { params });
  },

  /**
   * 获取商品分类列表
   * @param parentId
   * @returns
   */
  fetchProductCateList(parentId: number) {
    return http.get<ProductCategory[]>(
      `${Dict.fetchProductCateList}/${parentId}`,
    );
  },

  /**
   * 获取新品推荐
   * @param params
   * @returns
   */
  fetchNewProductList(params: PaginationParams) {
    return http.get<PaginationResult<Product>>(Dict.fetchNewProductList, {
      params,
    });
  },

  /**
   * 获取热门商品推荐
   * @param params
   * @returns
   */
  fetchHotProductList(params: PaginationParams) {
    return http.get<PaginationResult<Product>>(Dict.fetchHotProductList, {
      params,
    });
  },
};

export default HomeService;
