/**
 * 格式化工具函数
 */

/**
 * 格式化商品属性JSON字符串
 * @param productAttr - 商品属性JSON字符串
 * @returns 格式化后的属性文本
 */
export const formatProductAttr = (productAttr: string): string => {
  if (!productAttr) return '';

  try {
    const attrs = JSON.parse(productAttr);
    if (!Array.isArray(attrs)) return '';

    return attrs.map((attr) => `${attr.key}:${attr.value}`).join(';');
  } catch {
    return '';
  }
};

/**
 * 格式化日期时间
 * @param date - 日期时间字符串、时间戳或Date对象
 * @param format - 格式字符串，支持YYYY-MM-DD、YYYY-MM-DD HH:mm:ss等，或预设的'date'、'datetime'、'time'
 * @returns 格式化后的日期时间字符串
 */
export function formatDateTime(
  date: Date | string | number,
  format: string = 'YYYY-MM-DD HH:mm:ss',
): string {
  if (!date) return '';

  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  // 处理预设的格式类型
  switch (format) {
    case 'date':
      return `${year}-${month}-${day}`;
    case 'time':
      return `${hours}:${minutes}:${seconds}`;
    case 'datetime':
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    default:
      // 处理自定义格式字符串
      return format
        .replace('YYYY', String(year))
        .replace('MM', month)
        .replace('DD', day)
        .replace('HH', hours)
        .replace('mm', minutes)
        .replace('ss', seconds);
  }
}

/**
 * 将日期字符串转换为Date对象
 * @param dateStr - 日期字符串，如 "2024-01-01"
 * @param separator - 分隔符，默认为 "-"
 * @returns Date对象
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
