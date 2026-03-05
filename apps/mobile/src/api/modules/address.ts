import http from '../instance';
import type { Address, ApiResponse } from '@/interface';

const Dict = {
  fetchAddressList: `/member/address/list`,
  fetchAddressDetail: `/member/address`,
  addAddress: `/member/address/add`,
  updateAddress: `/member/address/update`,
  deleteAddress: `/member/address/delete`,
} as const;

/**
 * 地址接口服务
 */
const AddressService = {
  /**
   * 获取地址列表
   * @returns
   */
  fetchAddressList() {
    return http.get<Address[]>(Dict.fetchAddressList);
  },

  /**
   * 获取地址详情
   * @param id
   * @returns
   */
  fetchAddressDetail(id: number) {
    return http.get<Address>(`${Dict.fetchAddressDetail}/${id}`);
  },

  /**
   * 添加地址
   * @param data
   * @returns
   */
  addAddress(data: Omit<Address, 'id'>) {
    return http.post<Address>(Dict.addAddress, data);
  },

  /**
   * 更新地址
   * @param data
   * @returns
   */
  updateAddress(data: Address) {
    return http.post<Address>(`${Dict.updateAddress}/${data.id}`, data);
  },

  /**
   * 删除地址
   * @param id
   * @returns
   */
  deleteAddress(id: number) {
    return http.post<ApiResponse>(`${Dict.deleteAddress}/${id}`);
  },
};

export default AddressService;
