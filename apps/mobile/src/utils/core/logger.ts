/**
 * @fileoverview 统一日志管理工具
 * 提供统一的日志输出、存储和管理功能，支持不同环境的日志控制
 * @author Mall App Team
 * @since 1.0.0
 */

import { ConfigUtils } from '@/constants';

/**
 * 日志级别枚举
 * 定义不同的日志级别，级别越高越重要
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4,
}

/**
 * 日志器配置接口
 * 定义日志器的各项配置参数
 */
interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableStorage: boolean;
  maxStorageSize: number;
}

/**
 * 日志器类
 * 提供统一的日志记录和管理功能
 */
class Logger {
  private config: LoggerConfig;
  private logs: Array<{ level: string; message: string; timestamp: number }> =
    [];

  /**
   * 创建日志器实例
   *
   * @param {Partial<LoggerConfig>} config - 日志器配置参数
   */
  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: LogLevel.INFO,
      enableConsole: true,
      enableStorage: false,
      maxStorageSize: 100,
      ...config,
    };

    // 根据环境设置日志级别
    if (process.env.NODE_ENV === 'production') {
      this.config.level = LogLevel.ERROR;
      this.config.enableConsole = false;
    } else if (process.env.NODE_ENV === 'test') {
      this.config.level = LogLevel.NONE;
      this.config.enableConsole = false;
    }
  }

  /**
   * 判断是否应该记录指定级别的日志
   *
   * @param {LogLevel} level - 日志级别
   * @returns {boolean} 是否应该记录
   */
  private shouldLog(level: LogLevel): boolean {
    return level >= this.config.level;
  }

  /**
   * 格式化日志消息
   *
   * @param {string} level - 日志级别名称
   * @param {any} message - 主要消息
   * @param {...any[]} args - 附加参数
   * @returns {string} 格式化后的日志消息
   */
  private formatMessage(level: string, message: any, ...args: any[]): string {
    const timestamp = new Date().toISOString();
    const formattedMessage =
      typeof message === 'string' ? message : JSON.stringify(message);

    let result = `[${timestamp}] [${level}] ${formattedMessage}`;

    if (args.length > 0) {
      result += ` ${args.map((arg) => (typeof arg === 'string' ? arg : JSON.stringify(arg))).join(' ')}`;
    }

    return result;
  }

  /**
   * 内部日志记录方法
   *
   * @param {LogLevel} level - 日志级别
   * @param {string} levelName - 日志级别名称
   * @param {any} message - 主要消息
   * @param {...any[]} args - 附加参数
   */
  private log(
    level: LogLevel,
    levelName: string,
    message: any,
    ...args: any[]
  ): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const formattedMessage = this.formatMessage(levelName, message, ...args);

    // 控制台输出
    if (this.config.enableConsole) {
      switch (level) {
        case LogLevel.DEBUG:
          console.debug(formattedMessage);
          break;
        case LogLevel.INFO:
          console.info(formattedMessage);
          break;
        case LogLevel.WARN:
          console.warn(formattedMessage);
          break;
        case LogLevel.ERROR:
          console.error(formattedMessage);
          break;
      }
    }

    // 存储日志
    if (this.config.enableStorage) {
      this.logs.push({
        level: levelName,
        message: formattedMessage,
        timestamp: Date.now(),
      });

      // 限制存储大小
      if (this.logs.length > this.config.maxStorageSize) {
        this.logs.shift();
      }
    }
  }

  /**
   * 记录调试日志
   *
   * @param {any} message - 日志消息
   * @param {...any[]} args - 附加参数
   */
  debug(message: any, ...args: any[]): void {
    this.log(LogLevel.DEBUG, 'DEBUG', message, ...args);
  }

  /**
   * 记录信息日志
   *
   * @param {any} message - 日志消息
   * @param {...any[]} args - 附加参数
   */
  info(message: any, ...args: any[]): void {
    this.log(LogLevel.INFO, 'INFO', message, ...args);
  }

  /**
   * 记录警告日志
   *
   * @param {any} message - 日志消息
   * @param {...any[]} args - 附加参数
   */
  warn(message: any, ...args: any[]): void {
    this.log(LogLevel.WARN, 'WARN', message, ...args);
  }

  /**
   * 记录错误日志
   *
   * @param {any} message - 日志消息
   * @param {...any[]} args - 附加参数
   */
  error(message: any, ...args: any[]): void {
    this.log(LogLevel.ERROR, 'ERROR', message, ...args);
  }

  /**
   * 获取存储的日志
   *
   * @returns {Array<Object>} 日志数组
   * @returns {string} returns[].level - 日志级别
   * @returns {string} returns[].message - 日志消息
   * @returns {number} returns[].timestamp - 时间戳
   */
  getLogs(): Array<{ level: string; message: string; timestamp: number }> {
    return [...this.logs];
  }

  /**
   * 清除存储的日志
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * 导出日志为JSON字符串
   *
   * @returns {string} JSON格式的日志数据
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * 获取日志统计信息
   *
   * @returns {Object} 日志统计对象
   * @returns {number} returns.DEBUG - DEBUG级别日志数量
   * @returns {number} returns.INFO - INFO级别日志数量
   * @returns {number} returns.WARN - WARN级别日志数量
   * @returns {number} returns.ERROR - ERROR级别日志数量
   */
  getLogStats(): { [key: string]: number } {
    const stats = { DEBUG: 0, INFO: 0, WARN: 0, ERROR: 0 };
    this.logs.forEach((log) => {
      stats[log.level as keyof typeof stats]++;
    });
    return stats;
  }
}

// 创建全局日志实例
export const logger = new Logger({
  level: ConfigUtils.getLogLevel(),
  enableConsole: ConfigUtils.getCurrentLoggerConfig().ENABLED,
  enableStorage: ConfigUtils.getCurrentLoggerConfig().STORAGE,
  maxStorageSize: ConfigUtils.getCurrentLoggerConfig().MAX_SIZE,
});

// 便捷方法
export const log = {
  debug: (message: any, ...args: any[]) => logger.debug(message, ...args),
  info: (message: any, ...args: any[]) => logger.info(message, ...args),
  warn: (message: any, ...args: any[]) => logger.warn(message, ...args),
  error: (message: any, ...args: any[]) => logger.error(message, ...args),
};

// 开发环境下的调试工具
if (process.env.NODE_ENV === 'development') {
  // 将logger挂载到window对象，方便调试
  if (typeof window !== 'undefined') {
    (window as any).logger = logger;
    (window as any).logStats = () => logger.getLogStats();
    (window as any).exportLogs = () => {
      const logs = logger.exportLogs();
      console.info('Exported logs:', logs);
      return logs;
    };
  }
}

export default logger;
