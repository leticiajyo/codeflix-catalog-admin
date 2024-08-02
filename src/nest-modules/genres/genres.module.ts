import { Module } from '@nestjs/common';

import {
  GenreCategoryModel,
  GenreModel,
} from '../../core/genre/infra/db/sequelize/genre-model';
import { SequelizeModule } from '@nestjs/sequelize';
import { CategoriesModule } from '../categories/categories.module';
import { GENRES_PROVIDERS } from './genres.providers';
import { GenresController } from './genres.controller';

@Module({
  imports: [
    SequelizeModule.forFeature([GenreModel, GenreCategoryModel]),
    CategoriesModule,
  ],
  controllers: [GenresController],
  providers: [
    ...Object.values(GENRES_PROVIDERS.REPOSITORIES),
    ...Object.values(GENRES_PROVIDERS.USE_CASES),
  ],
  exports: [GENRES_PROVIDERS.REPOSITORIES.GENRE_REPOSITORY.provide],
})
export class GenresModule {}
