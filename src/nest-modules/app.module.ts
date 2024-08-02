import { Module } from '@nestjs/common';
import { CategoriesModule } from './categories/categories.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from './config/config.module';
import { SharedModule } from './shared/shared.module';
import { CastMembersModule } from './cast-members/cast-members.module';
import { GenresModule } from './genres/genres.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    DatabaseModule,
    SharedModule,
    CategoriesModule,
    CastMembersModule,
    GenresModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
