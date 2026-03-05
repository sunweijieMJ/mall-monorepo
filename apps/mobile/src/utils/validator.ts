/**
 * 表单验证工具
 */

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

/**
 * 验证单个字段
 */
export const validateField = (
  value: any,
  rules: ValidationRule[],
): ValidationResult => {
  for (const rule of rules) {
    // 必填验证
    if (rule.required && (!value || value.toString().trim() === '')) {
      return { isValid: false, message: rule.message };
    }

    // 如果字段为空且不是必填，跳过其他验证
    if (!value && !rule.required) {
      continue;
    }

    // 最小长度验证
    if (rule.minLength && value.toString().length < rule.minLength) {
      return { isValid: false, message: rule.message };
    }

    // 最大长度验证
    if (rule.maxLength && value.toString().length > rule.maxLength) {
      return { isValid: false, message: rule.message };
    }

    // 正则验证
    if (rule.pattern && !rule.pattern.test(value.toString())) {
      return { isValid: false, message: rule.message };
    }

    // 自定义验证
    if (rule.custom && !rule.custom(value)) {
      return { isValid: false, message: rule.message };
    }
  }

  return { isValid: true };
};

/**
 * 验证整个表单
 */
export const validateForm = (
  formData: Record<string, any>,
  validationSchema: Record<string, ValidationRule[]>,
): ValidationResult => {
  for (const [field, rules] of Object.entries(validationSchema)) {
    const result = validateField(formData[field], rules);
    if (!result.isValid) {
      return result;
    }
  }

  return { isValid: true };
};

// 登录表单验证规则
const LoginRules = {
  username: [
    { required: true, message: '请输入用户名' },
    { minLength: 3, message: '用户名至少3位' },
    { maxLength: 20, message: '用户名最多20位' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线' },
  ],
  password: [
    { required: true, message: '请输入密码' },
    { minLength: 6, message: '密码至少6位' },
    { maxLength: 20, message: '密码最多20位' },
  ],
};

/**
 * 快速验证登录表单
 */
export const validateLoginForm = (
  username: string,
  password: string,
): ValidationResult => {
  return validateForm({ username, password }, LoginRules);
};
