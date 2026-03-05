import http from '../instance';
import type { UserInfo, LoginRequest, LoginResponse } from '@/interface';

const Dict = {
  memberLogin: `/sso/login`,
  memberInfo: `/sso/info`,
} as const;

/**
 * 会员接口服务
 */
const MemberService = {
  /**
   * 会员登录
   * @param data
   * @returns
   */
  memberLogin(data: LoginRequest) {
    return http.post<LoginResponse>(Dict.memberLogin, data, {
      header: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
    });
  },

  /**
   * 获取会员信息
   * @returns
   */
  memberInfo() {
    return http.get<UserInfo>(Dict.memberInfo);
  },
};

export default MemberService;
