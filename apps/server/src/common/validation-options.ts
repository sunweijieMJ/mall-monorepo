import {
  HttpStatus,
  UnprocessableEntityException,
  ValidationError,
  ValidationPipeOptions,
} from '@nestjs/common';

function generateErrors(
  errors: ValidationError[],
): Record<string, string | Record<string, unknown>> {
  return errors.reduce<Record<string, string | Record<string, unknown>>>(
    (acc, err) => ({
      ...acc,
      [err.property]:
        (err.children?.length ?? 0) > 0
          ? generateErrors(err.children ?? [])
          : Object.values(err.constraints ?? {}).join(', '),
    }),
    {},
  );
}

const validationOptions: ValidationPipeOptions = {
  transform: true,
  whitelist: true,
  errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
  transformOptions: {
    enableImplicitConversion: true,
  },
  exceptionFactory: (errors: ValidationError[]) =>
    new UnprocessableEntityException({
      status: HttpStatus.UNPROCESSABLE_ENTITY,
      errors: generateErrors(errors),
    }),
};

export default validationOptions;
