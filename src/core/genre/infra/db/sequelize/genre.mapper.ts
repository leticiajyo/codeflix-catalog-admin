import { CategoryId } from '../../../../category/domain/category.aggregate';
import { LoadEntityError } from '../../../../shared/domain/validators/validation.error';
import { Genre, GenreId } from '../../../domain/genre.aggregate';
import { GenreCategoryModel, GenreModel } from './genre.model';

export class GenreModelMapper {
  static toModelProps(entity: Genre) {
    const { categoryIds, ...otherData } = entity.toJSON();

    return {
      ...otherData,
      categoryIds: categoryIds.map(
        (categoryId) =>
          new GenreCategoryModel({
            genreId: entity.genreId.id,
            categoryId: categoryId,
          }),
      ),
    };
  }

  static toEntity(model: GenreModel) {
    const { genreId: id, categoryIds = [], ...otherData } = model.toJSON();

    const genre = new Genre({
      ...otherData,
      genreId: new GenreId(id),
      categoryIds: new Map(
        categoryIds.map((it) => [it.categoryId, new CategoryId(it.categoryId)]),
      ),
    });

    if (genre.notification.hasErrors()) {
      throw new LoadEntityError(genre.notification.toJSON());
    }

    return genre;
  }
}
