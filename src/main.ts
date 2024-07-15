import { NestFactory } from '@nestjs/core';
import { AppModule } from './nest-modules/app.module';
import { applyGlobalConfig } from './nest-modules/global-config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  applyGlobalConfig(app);

  await app.listen(3000);
}

bootstrap();
