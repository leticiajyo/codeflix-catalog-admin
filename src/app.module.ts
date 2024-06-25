import { Module } from '@nestjs/common';
import { CategoriesModule } from './categories/categories.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [DatabaseModule, CategoriesModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
