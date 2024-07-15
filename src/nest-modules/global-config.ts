import {
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { EntityValidationErrorFilter } from './shared/filters/entity-validation-error.filter';
import { NotFoundErrorFilter } from './shared/filters/not-found-error.filter';
import { ResponseDataWrapperInterceptor } from './shared/interceptors/response-data-wrapper.interceptor';

export function applyGlobalConfig(app: INestApplication) {
  app.useGlobalPipes(
    new ValidationPipe({
      errorHttpStatusCode: 400,
      transform: true,
    }),
  );

  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector)),
    new ResponseDataWrapperInterceptor(),
  );
  app.useGlobalInterceptors();

  app.useGlobalFilters(
    new NotFoundErrorFilter(),
    new EntityValidationErrorFilter(),
  );
}
