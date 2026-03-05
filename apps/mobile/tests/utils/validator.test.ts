import { describe, it, expect } from 'vitest';
import { validateField } from '@/utils/validator';

describe('validateField', () => {
  it('必填校验：空值不通过', () => {
    const result = validateField('', [{ required: true, message: '不能为空' }]);
    expect(result.isValid).toBe(false);
    expect(result.message).toBe('不能为空');
  });

  it('必填校验：有值通过', () => {
    const result = validateField('hello', [
      { required: true, message: '不能为空' },
    ]);
    expect(result.isValid).toBe(true);
  });

  it('最小长度校验', () => {
    const result = validateField('ab', [{ minLength: 6, message: '最少6位' }]);
    expect(result.isValid).toBe(false);
    expect(result.message).toBe('最少6位');
  });

  it('最大长度校验', () => {
    const result = validateField('hello world', [
      { maxLength: 5, message: '最多5位' },
    ]);
    expect(result.isValid).toBe(false);
  });

  it('正则校验：手机号', () => {
    const phoneRule = { pattern: /^1[3-9]\d{9}$/, message: '手机号格式错误' };
    expect(validateField('13800138000', [phoneRule]).isValid).toBe(true);
    expect(validateField('12345678901', [phoneRule]).isValid).toBe(false);
  });

  it('自定义校验', () => {
    const rule = { custom: (v: string) => v === 'secret', message: '密码错误' };
    expect(validateField('secret', [rule]).isValid).toBe(true);
    expect(validateField('wrong', [rule]).isValid).toBe(false);
  });

  it('非必填字段为空时跳过其他校验', () => {
    const result = validateField('', [{ minLength: 6, message: '最少6位' }]);
    expect(result.isValid).toBe(true);
  });
});
