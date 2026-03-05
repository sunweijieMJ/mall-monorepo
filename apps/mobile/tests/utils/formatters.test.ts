import { describe, it, expect } from 'vitest';
import { formatProductAttr, formatDateTime } from '@/utils/formatters';

describe('formatProductAttr', () => {
  it('空字符串返回空', () => {
    expect(formatProductAttr('')).toBe('');
  });

  it('正常属性 JSON 格式化', () => {
    const input = JSON.stringify([
      { key: '颜色', value: '红色' },
      { key: '尺码', value: 'L' },
    ]);
    expect(formatProductAttr(input)).toBe('颜色:红色;尺码:L');
  });

  it('非法 JSON 返回空', () => {
    expect(formatProductAttr('not-json')).toBe('');
  });

  it('非数组 JSON 返回空', () => {
    expect(formatProductAttr('{"key":"value"}')).toBe('');
  });
});

describe('formatDateTime', () => {
  const fixedDate = new Date('2024-03-15T10:30:45');

  it('默认格式 YYYY-MM-DD HH:mm:ss', () => {
    expect(formatDateTime(fixedDate)).toBe('2024-03-15 10:30:45');
  });

  it('预设 date 格式', () => {
    expect(formatDateTime(fixedDate, 'date')).toBe('2024-03-15');
  });

  it('预设 time 格式', () => {
    expect(formatDateTime(fixedDate, 'time')).toBe('10:30:45');
  });

  it('空值返回空', () => {
    expect(formatDateTime('')).toBe('');
  });

  it('非法日期返回空', () => {
    expect(formatDateTime('invalid-date')).toBe('');
  });

  it('支持时间戳输入', () => {
    expect(formatDateTime(fixedDate.getTime(), 'date')).toBe('2024-03-15');
  });
});
