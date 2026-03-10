import { describe, it, expect } from 'vitest';
import { formatDate } from '@/utils/date';

describe('formatDate', () => {
  // 固定一个日期：2024-03-09 08:05:02
  const d = new Date(2024, 2, 9, 8, 5, 2);

  it('yyyy-MM-dd 格式', () => {
    expect(formatDate(d, 'yyyy-MM-dd')).toBe('2024-03-09');
  });

  it('yyyy-MM-dd hh:mm:ss 格式', () => {
    expect(formatDate(d, 'yyyy-MM-dd hh:mm:ss')).toBe('2024-03-09 08:05:02');
  });

  it('yyyy 仅年份', () => {
    expect(formatDate(d, 'yyyy')).toBe('2024');
  });

  it('yy 两位年份', () => {
    expect(formatDate(d, 'yy')).toBe('24');
  });

  it('MM/dd 月日不补零格式（单占位）', () => {
    // 单占位 M/d 不补零
    expect(formatDate(d, 'M/d')).toBe('3/9');
  });

  it('MM/dd 双占位月日补零', () => {
    expect(formatDate(d, 'MM/dd')).toBe('03/09');
  });

  it('hh:mm:ss 时分秒补零', () => {
    expect(formatDate(d, 'hh:mm:ss')).toBe('08:05:02');
  });

  it('月份 >= 10 不补零', () => {
    const nov = new Date(2024, 10, 1, 0, 0, 0); // 11月
    expect(formatDate(nov, 'yyyy-MM-dd')).toBe('2024-11-01');
  });
});
