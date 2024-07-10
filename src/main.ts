import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './nest-modules/app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { ResponseDataWrapperInterceptor } from './nest-modules/shared/interceptors/response-data-wrapper.interceptor';
import { NotFoundErrorFilter } from './nest-modules/shared/filters/not-found-error.filter';
import { EntityValidationErrorFilter } from './nest-modules/shared/filters/entity-validation-error.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      errorHttpStatusCode: 400,
    }),
  );

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalInterceptors(new ResponseDataWrapperInterceptor());

  app.useGlobalFilters(
    new NotFoundErrorFilter(),
    new EntityValidationErrorFilter(),
  );

  await app.listen(3000);
}

bootstrap();
