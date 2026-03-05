/**
 * Mall 日期处理工具函数
 * 从 mall-admin-web 迁移并转换为 TypeScript
 */

/**
 * 格式化日期
 * @param date 日期对象
 * @param fmt 格式字符串，如 'yyyy-MM-dd hh:mm:ss'
 * @returns 格式化后的日期字符串
 */
export function formatDate(date: Date, fmt: string): string {
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(
      RegExp.$1,
      (date.getFullYear() + '').substr(4 - RegExp.$1.length),
    );
  }
  const o: Record<string, number> = {
    'M+': date.getMonth() + 1,
    'd+': date.getDate(),
    'h+': date.getHours(),
    'm+': date.getMinutes(),
    's+': date.getSeconds(),
  };
  for (const k in o) {
    if (new RegExp(`(${k})`).test(fmt)) {
      const str = o[k] + '';
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length === 1 ? str : padLeftZero(str),
      );
    }
  }
  return fmt;
}

/**
 * 左侧补零
 */
function padLeftZero(str: string): string {
  return ('00' + str).substr(str.length);
}

/**
 * 字符串转日期
 * @param dateStr 日期字符串，如 '2023-12-01'
 * @param separator 分隔符，默认为 '-'
 * @returns 日期对象
 */
export function str2Date(dateStr: string, separator: string = '-'): Date {
  const dateArr = dateStr.split(separator);
  const year = parseInt(dateArr[0]);
  let month: number;
  // 处理月份为04这样的情况
  if (dateArr[1].indexOf('0') === 0) {
    month = parseInt(dateArr[1].substring(1));
  } else {
    month = parseInt(dateArr[1]);
  }
  const day = parseInt(dateArr[2]);
  const date = new Date(year, month - 1, day);
  return date;
}

/**
 * 获取当前日期字符串 YYYY-MM-DD
 */
export function getCurrentDate(): string {
  const now = new Date();
  return formatDate(now, 'yyyy-MM-dd');
}

/**
 * 获取当前时间字符串 YYYY-MM-DD HH:mm:ss
 */
export function getCurrentDateTime(): string {
  const now = new Date();
  return formatDate(now, 'yyyy-MM-dd hh:mm:ss');
}

/**
 * 计算日期差（天数）
 */
export function dateDiff(date1: Date, date2: Date): number {
  const diff = Math.abs(date1.getTime() - date2.getTime());
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}
