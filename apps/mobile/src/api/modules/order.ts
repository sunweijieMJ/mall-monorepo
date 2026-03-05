import http from '../instance';
import type {
  Order,
  ApiResponse,
  PaginationResult,
  ConfirmOrderData,
  ConfirmOrderResponse,
  GenerateOrderData,
  OrderListParams,
  PayOrderData,
  CancelOrderData,
  ConfirmReceiveOrderData,
  DeleteOrderData,
  AlipayStatusParams,
} from '@/interface';

const Dict = {
  generateConfirmOrder: `/order/generateConfirmOrder`,
  generateOrder: `/order/generateOrder`,
  fetchOrderList: `/order/list`,
  payOrderSuccess: `/order/paySuccess`,
  fetchOrderDetail: `/order/detail`,
  cancelUserOrder: `/order/cancelUserOrder`,
  confirmReceiveOrder: `/order/confirmReceiveOrder`,
  deleteUserOrder: `/order/deleteOrder`,
  fetchAlipayStatus: `/alipay/query`,
} as const;

/**
 * 订单接口服务
 */
const OrderService = {
  /**
   * 生成确认单信息
   * @param data
   * @returns
   */
  generateConfirmOrder(data: ConfirmOrderData) {
    return http.post<ConfirmOrderResponse>(Dict.generateConfirmOrder, data);
  },

  /**
   * 根据购物车信息生成订单
   * @param data
   * @returns
   */
  generateOrder(data: GenerateOrderData) {
    return http.post<Order>(Dict.generateOrder, data);
  },

  /**
   * 获取订单列表
   * @param params
   * @returns
   */
  fetchOrderList(params: OrderListParams) {
    return http.get<PaginationResult<Order>>(Dict.fetchOrderList, { params });
  },

  /**
   * 支付成功回调
   * @param data
   * @returns
   */
  payOrderSuccess(data: PayOrderData) {
    return http.post<ApiResponse>(Dict.payOrderSuccess, data, {
      header: {
        'content-type': 'application/x-www-form-urlencoded;charset=utf-8',
      },
    });
  },

  /**
   * 获取订单详情
   * @param orderId
   * @returns
   */
  fetchOrderDetail(orderId: number) {
    return http.get<Order>(`${Dict.fetchOrderDetail}/${orderId}`);
  },

  /**
   * 用户取消订单
   * @param data
   * @returns
   */
  cancelUserOrder(data: CancelOrderData) {
    return http.post<ApiResponse>(Dict.cancelUserOrder, data, {
      header: {
        'content-type': 'application/x-www-form-urlencoded;charset=utf-8',
      },
    });
  },

  /**
   * 确认收货
   * @param data
   * @returns
   */
  confirmReceiveOrder(data: ConfirmReceiveOrderData) {
    return http.post<ApiResponse>(Dict.confirmReceiveOrder, data, {
      header: {
        'content-type': 'application/x-www-form-urlencoded;charset=utf-8',
      },
    });
  },

  /**
   * 删除订单
   * @param data
   * @returns
   */
  deleteUserOrder(data: DeleteOrderData) {
    return http.post<ApiResponse>(Dict.deleteUserOrder, data, {
      header: {
        'content-type': 'application/x-www-form-urlencoded;charset=utf-8',
      },
    });
  },

  /**
   * 查询支付宝支付状态
   * @param params
   * @returns
   */
  fetchAlipayStatus(params: AlipayStatusParams) {
    return http.get<string>(Dict.fetchAlipayStatus, { params });
  },
};

export default OrderService;
