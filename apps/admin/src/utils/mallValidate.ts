/**
 * Mall 验证相关工具函数
 * 从 mall-admin-web 迁移并转换为 TypeScript
 */

/**
 * 验证用户名（至少3个字符）
 */
export function isvalidUsername(str: string): boolean {
  return str.trim().length >= 3;
}

/**
 * 验证URL格式
 */
export function validateURL(textval: string): boolean {
  const urlregex =
    /^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/;
  return urlregex.test(textval);
}

/**
 * 验证小写字母
 */
export function validateLowerCase(str: string): boolean {
  const reg = /^[a-z]+$/;
  return reg.test(str);
}

/**
 * 验证大写字母
 */
export function validateUpperCase(str: string): boolean {
  const reg = /^[A-Z]+$/;
  return reg.test(str);
}

/**
 * 验证字母（大小写）
 */
export function validatAlphabets(str: string): boolean {
  const reg = /^[A-Za-z]+$/;
  return reg.test(str);
}

/**
 * 验证邮箱
 */
export function validateEmail(email: string): boolean {
  const reg = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
  return reg.test(email);
}

/**
 * 验证手机号
 */
export function validatePhone(phone: string): boolean {
  const reg = /^1[3-9]\d{9}$/;
  return reg.test(phone);
}

/**
 * 验证正整数
 */
export function validatePositiveInteger(val: string | number): boolean {
  const reg = /^[1-9]\d*$/;
  return reg.test(String(val));
}

/**
 * 验证非负整数（包含0）
 */
export function validateNonNegativeInteger(val: string | number): boolean {
  const reg = /^(0|[1-9]\d*)$/;
  return reg.test(String(val));
}

/**
 * 验证价格（两位小数）
 */
export function validatePrice(val: string | number): boolean {
  const reg = /^(0|[1-9]\d*)(\.\d{1,2})?$/;
  return reg.test(String(val));
}
