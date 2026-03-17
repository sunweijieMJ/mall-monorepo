import dayjs from 'dayjs';

/**
 * 格式化日期时间
 */
export const formatDateTime = (time?: string | number | Date) => {
  if (!time) return 'N/A';
  return dayjs(time).format('YYYY-MM-DD HH:mm:ss');
};

/**
 * 格式化日期
 */
export const formatDate = (time: string | number | Date, format: string) => {
  return dayjs(time).format(format);
};
