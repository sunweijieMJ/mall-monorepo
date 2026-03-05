import { registerDecorator, ValidationOptions } from 'class-validator';

/**
 * 密码强度校验：至少 8 位，包含大写、小写、数字
 *
 * @example
 * ```typescript
 * @IsStrongPassword()
 * password: string;
 * ```
 */
export function IsStrongPassword(
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return function (object: object, propertyName: string | symbol) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName.toString(),
      options: validationOptions,
      validator: {
        validate(value: unknown): boolean {
          if (!value || typeof value !== 'string') return false;
          return (
            value.length >= 8 &&
            /[A-Z]/.test(value) &&
            /[a-z]/.test(value) &&
            /\d/.test(value)
          );
        },
        defaultMessage(): string {
          return '密码至少 8 位，且必须包含大写字母、小写字母和数字';
        },
      },
    });
  };
}
