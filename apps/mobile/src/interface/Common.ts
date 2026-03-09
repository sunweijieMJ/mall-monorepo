/**
 * 通用接口类型定义
 */

/**
 * 基础实体接口
 * 包含所有实体的通用属性
 */
export interface BaseEntity {
  /** 唯一标识符 */
  id: number;
  /** 创建时间 */
  createTime?: string;
  /** 更新时间 */
  updateTime?: string;
}
