import { NestFactory } from '@nestjs/core';
import { AppModule } from './nest-modules/app.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  await app.init();
}

bootstrap();
