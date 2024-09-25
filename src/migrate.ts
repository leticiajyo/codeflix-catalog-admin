import { NestFactory } from '@nestjs/core';
import { getConnectionToken } from '@nestjs/sequelize';
import { migrator } from './core/shared/infra/db/sequelize/migrator';
import { MigrationsModule } from './nest-modules/database/migrations.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(MigrationsModule, {
    logger: ['error'],
  });

  const sequelize = app.get(getConnectionToken());

  try {
    await migrator(sequelize).runAsCLI();
  } catch (error) {
    console.error('Migration failed', error);
  } finally {
    await app.close();
  }
}

bootstrap();
