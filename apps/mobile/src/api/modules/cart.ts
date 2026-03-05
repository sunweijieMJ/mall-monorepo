import http from '../instance';
import type {
  CartItem,
  ApiResponse,
  AddCartItemParams,
  UpdateQuantityParams,
  DeleteCartItemParams,
} from '@/interface';

const Dict = {
  addCartItem: `/cart/add`,
  fetchCartList: `/cart/list`,
  deleteCartItem: `/cart/delete`,
  updateQuantity: `/cart/update/quantity`,
  clearCartList: `/cart/clear`,
} as const;

/**
 * 购物车接口服务
 */
const CartService = {
  /**
   * 添加购物车商品
   * @param data
   * @returns
   */
  addCartItem(data: AddCartItemParams) {
    return http.post<CartItem>(Dict.addCartItem, data);
  },

  /**
   * 获取购物车列表
   * @returns
   */
  fetchCartList() {
    return http.get<CartItem[]>(Dict.fetchCartList);
  },

  /**
   * 删除购物车商品
   * @param params
   * @returns
   */
  deleteCartItem(params: DeleteCartItemParams) {
    return http.post<ApiResponse>(Dict.deleteCartItem, null, { params });
  },

  /**
   * 更新商品数量
   * @param params
   * @returns
   */
  updateQuantity(params: UpdateQuantityParams) {
    return http.get<ApiResponse>(Dict.updateQuantity, { params });
  },

  /**
   * 清空购物车
   * @returns
   */
  clearCartList() {
    return http.post<ApiResponse>(Dict.clearCartList);
  },
};

export default CartService;
