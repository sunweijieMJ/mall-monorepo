import { plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';

export default function validateConfig<T extends object>(
  config: Record<string, unknown>,
  envVariablesClass: new () => T,
) {
  const validatedConfig = plainToClass(envVariablesClass, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig as object, {
    skipMissingProperties: false,
  });
  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
