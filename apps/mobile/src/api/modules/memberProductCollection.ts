import http from '../instance';
import type {
  ApiResponse,
  PaginationParams,
  PaginationResult,
  ProductCollection,
  CreateProductCollectionData,
  ProductCollectionParams,
} from '@/interface';

const Dict = {
  createProductCollection: `/member/productCollection/add`,
  deleteProductCollection: `/member/productCollection/delete`,
  fetchProductCollectionList: `/member/productCollection/list`,
  productCollectionDetail: `/member/productCollection/detail`,
  clearProductCollection: `/member/productCollection/clear`,
} as const;

/**
 * 商品收藏接口服务
 */
const MemberProductCollectionService = {
  /**
   * 创建商品收藏
   * @param data
   * @returns
   */
  createProductCollection(data: CreateProductCollectionData) {
    return http.post<ProductCollection>(Dict.createProductCollection, data);
  },

  /**
   * 删除商品收藏
   * @param params
   * @returns
   */
  deleteProductCollection(params: { productId: number }) {
    return http.post<ApiResponse>(Dict.deleteProductCollection, null, {
      params,
    });
  },

  /**
   * 获取商品收藏列表
   * @param params
   * @returns
   */
  fetchProductCollectionList(params: PaginationParams) {
    return http.get<PaginationResult<ProductCollection>>(
      Dict.fetchProductCollectionList,
      { params },
    );
  },

  /**
   * 获取商品收藏详情
   * @param params
   * @returns
   */
  productCollectionDetail(params: ProductCollectionParams) {
    return http.get<ProductCollection>(Dict.productCollectionDetail, {
      params,
    });
  },

  /**
   * 清空商品收藏
   * @returns
   */
  clearProductCollection() {
    return http.post<ApiResponse>(Dict.clearProductCollection);
  },
};

export default MemberProductCollectionService;
