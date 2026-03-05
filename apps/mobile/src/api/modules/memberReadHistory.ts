import http from '../instance';
import type {
  ApiResponse,
  PaginationParams,
  PaginationResult,
  CreateReadHistoryData,
  ReadHistory,
} from '@/interface';

const Dict = {
  createReadHistory: `/member/readHistory/create`,
  fetchReadHistoryList: `/member/readHistory/list`,
  clearReadHistory: `/member/readHistory/clear`,
} as const;

/**
 * 阅读历史接口服务
 */
const MemberReadHistoryService = {
  /**
   * 创建阅读历史
   * @param data
   * @returns
   */
  createReadHistory(data: CreateReadHistoryData) {
    return http.post<ReadHistory>(Dict.createReadHistory, data);
  },

  /**
   * 获取阅读历史列表
   * @param params
   * @returns
   */
  fetchReadHistoryList(params: PaginationParams) {
    return http.get<PaginationResult<ReadHistory>>(Dict.fetchReadHistoryList, {
      params,
    });
  },

  /**
   * 清空阅读历史
   * @returns
   */
  clearReadHistory() {
    return http.post<ApiResponse>(Dict.clearReadHistory);
  },
};

export default MemberReadHistoryService;
