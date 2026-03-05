import { HttpStatus, ValidationPipeOptions } from '@nestjs/common';

const validationOptions: ValidationPipeOptions = {
  transform: true,
  whitelist: true,
  errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
  transformOptions: {
    enableImplicitConversion: true,
  },
};

export default validationOptions;
