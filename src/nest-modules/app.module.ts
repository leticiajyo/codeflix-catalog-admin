import { Module } from '@nestjs/common';
import { CategoriesModule } from './categories/categories.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from './config/config.module';
import { CastMembersModule } from './cast-members/cast-members.module';
import { GenresModule } from './genres/genres.module';
import { VideosModule } from './videos/videos.module';
import { EventModule } from './event/event.module';
import { UseCaseModule } from './use-case/use-case.module';
import { StorageModule } from './storage/storage.module';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';

@Module({
  imports: [
    ConfigModule.forRoot(),
    DatabaseModule,
    StorageModule,
    EventModule,
    UseCaseModule,
    CategoriesModule,
    CastMembersModule,
    GenresModule,
    VideosModule,
    RabbitMQModule.forRoot(RabbitMQModule, {
      uri: 'amqp://admin:admin@rabbitmq:5672',
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
