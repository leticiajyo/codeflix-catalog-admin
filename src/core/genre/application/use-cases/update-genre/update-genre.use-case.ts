import { Category, CategoryId } from '@core/category/domain/category.aggregate';
import { ICategoryRepository } from '../../../../category/domain/category.repository';
import { IUseCase } from '../../../../shared/application/use-case.interface';
import { NotFoundError } from '../../../../shared/domain/errors/not-found.error';
import { IUnitOfWork } from '../../../../shared/domain/repository/unit-of-work.interface';
import { EntityValidationError } from '../../../../shared/domain/validators/validation.error';
import { Genre, GenreId } from '../../../domain/genre.aggregate';
import { IGenreRepository } from '../../../domain/genre.repository';
import { GenreOutput, GenreOutputMapper } from '../../common/genre.output';
import { UpdateGenreInput } from './update-genre.input';

export type UpdateGenreOutput = GenreOutput;

export class UpdateGenreUseCase
  implements IUseCase<UpdateGenreInput, UpdateGenreOutput>
{
  constructor(
    private uow: IUnitOfWork,
    private genreRepo: IGenreRepository,
    private categoryRepo: ICategoryRepository,
  ) {}

  async execute(input: UpdateGenreInput): Promise<UpdateGenreOutput> {
    const genreId = new GenreId(input.id);
    const genre = await this.genreRepo.findById(genreId);

    if (!genre) {
      throw new NotFoundError(input.id, Genre);
    }

    input.name && genre.changeName(input.name);

    if (input.isActive === true) {
      genre.activate();
    }

    if (input.isActive === false) {
      genre.deactivate();
    }

    if (input.categoryIds) {
      const categoryIds = input.categoryIds.map((v) => new CategoryId(v));
      const { exists: existingIds, notExists: notExistingIds } =
        await this.categoryRepo.existsById(categoryIds);

      if (notExistingIds.length) {
        genre.notification.setError(
          notExistingIds
            .map((it) => new NotFoundError(it.id, Category))
            .map((e) => e.message),
          'categoryIds',
        );
      }

      existingIds && genre.syncCategoryIds(existingIds);
    }

    if (genre.notification.hasErrors()) {
      throw new EntityValidationError(genre.notification.toJSON());
    }

    await this.uow.do(async () => {
      return this.genreRepo.update(genre);
    });

    const categories = await this.categoryRepo.findByIds(
      Array.from(genre.categoryIds.values()),
    );

    return GenreOutputMapper.toOutput(genre, categories);
  }
}
