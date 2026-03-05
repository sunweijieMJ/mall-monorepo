import { plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export default function validateConfig<T extends object>(
  config: Record<string, unknown>,
  envVariablesClass: Function,
) {
  const validatedConfig = plainToClass(
    envVariablesClass as new () => T,
    config,
    {
      enableImplicitConversion: true,
    },
  );
  const errors = validateSync(validatedConfig as object, {
    skipMissingProperties: false,
  });
  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
