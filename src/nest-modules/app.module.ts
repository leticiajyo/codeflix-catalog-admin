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
import { RabbitmqModule } from './rabbitmq/rabbitmq.module';

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
    RabbitmqModule.forRoot(),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
