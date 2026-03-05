/**
 * Mall 用户权限相关类型定义
 */

// 登录请求
export interface LoginRequest {
  username: string;
  password: string;
}

// 登录响应
export interface LoginResponse {
  token: string;
  tokenHead: string;
}

// 用户信息
export interface UserInfo {
  id: number;
  username: string;
  password: string;
  icon: string | null;
  email: string | null;
  nickName: string | null;
  note: string | null;
  createTime: string;
  loginTime: string | null;
  status: number; // 帐号启用状态：0->禁用；1->启用
  roles: string[]; // 角色列表
  menus: MenuItem[]; // 菜单列表
}

// 管理员
export interface Admin {
  id: number;
  username: string;
  password: string;
  icon: string | null;
  email: string | null;
  nickName: string | null;
  note: string | null;
  createTime: string;
  loginTime: string | null;
  status: number;
}

// 角色
export interface Role {
  id: number;
  name: string;
  description: string | null;
  adminCount: number;
  createTime: string;
  status: number;
  sort: number;
}

// 菜单
export interface MenuItem {
  id: number;
  parentId: number;
  createTime: string;
  title: string;
  level: number;
  sort: number;
  name: string;
  icon: string | null;
  hidden: number; // 前端隐藏：0->显示；1->隐藏
  children?: MenuItem[]; // 子菜单列表
}

// 资源分类
export interface ResourceCategory {
  id: number;
  createTime: string;
  name: string;
  sort: number;
}

// 资源
export interface Resource {
  id: number;
  categoryId: number;
  createTime: string;
  name: string;
  url: string;
  description: string | null;
}

// 会员等级
export interface MemberLevel {
  id: number;
  name: string;
  growthPoint: number;
  defaultStatus: number;
  freeFreightPoint: number;
  commentGrowthPoint: number;
  priviledgeFreeFreight: number;
  priviledgeSignIn: number;
  priviledgeComment: number;
  priviledgePromotion: number;
  priviledgeMemberPrice: number;
  priviledgeBirthday: number;
  note: string | null;
}

// 优选区域
export interface PreferenceArea {
  id: number;
  name: string;
  subTitle: string | null;
  pic: string | null;
  sort: number;
  showStatus: number;
}

// 专题分类
export interface SubjectCategory {
  id: number;
  name: string;
  icon: string | null;
  subjectCount: number;
  showStatus: number;
  sort: number;
}
