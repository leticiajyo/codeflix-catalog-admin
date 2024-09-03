import { SequelizeOptions } from 'sequelize-typescript';
import { setupSequelize } from '@core/shared/infra/testing/sequelize.helper';
import { ImageMediaModel } from '../image-media.model';
import {
  VideoCastMemberModel,
  VideoCategoryModel,
  VideoGenreModel,
  VideoModel,
} from '../video.model';
import { AudioVideoMediaModel } from '../audio-video-media.model';
import { CastMemberModel } from '@core/cast-member/infra/db/sequelize/cast-member.model';
import { CategoryModel } from '../../../../../category/infra/db/sequelize/category.model';
import {
  GenreCategoryModel,
  GenreModel,
} from '../../../../../genre/infra/db/sequelize/genre.model';
import { CastMember } from '@core/cast-member/domain/cast-member.aggregate';
import { Category } from '@core/category/domain/category.aggregate';
import { Genre } from '@core/genre/domain/genre.aggregate';
import { CategorySequelizeRepository } from '@core/category/infra/db/sequelize/category-sequelize.repository';
import { CastMemberSequelizeRepository } from '@core/cast-member/infra/db/sequelize/cast-member-sequelize.repository';
import { GenreSequelizeRepository } from '@core/genre/infra/db/sequelize/genre-sequelize.repository';

export function setupSequelizeForVideo(options: SequelizeOptions = {}) {
  return setupSequelize({
    models: [
      ImageMediaModel,
      VideoModel,
      AudioVideoMediaModel,
      VideoCategoryModel,
      CategoryModel,
      VideoGenreModel,
      GenreModel,
      GenreCategoryModel,
      VideoCastMemberModel,
      CastMemberModel,
    ],
    ...options,
  });
}

export async function createVideoRelations(
  categoryRepo: CategorySequelizeRepository,
  genreRepo: GenreSequelizeRepository,
  castMemberRepo: CastMemberSequelizeRepository,
) {
  const category = Category.fake().oneCategory().build();
  await categoryRepo.insert(category);

  const genre = Genre.fake()
    .oneGenre()
    .addCategoryId(category.categoryId)
    .build();
  await genreRepo.insert(genre);

  const castMember = CastMember.fake().oneActor().build();
  await castMemberRepo.insert(castMember);

  return { category, genre, castMember };
}
