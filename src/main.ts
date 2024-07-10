import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './nest-modules/app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { ResponseDataWrapperInterceptor } from './nest-modules/shared/interceptors/response-data-wrapper.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      errorHttpStatusCode: 400,
    }),
  );

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalInterceptors(new ResponseDataWrapperInterceptor());

  await app.listen(3000);
}

bootstrap();
