import { Category, CategoryId } from '@core/category/domain/category.aggregate';
import { ICategoryRepository } from '../../../../category/domain/category.repository';
import { IUseCase } from '../../../../shared/application/use-case.interface';
import { IUnitOfWork } from '../../../../shared/domain/repository/unit-of-work.interface';
import { EntityValidationError } from '../../../../shared/domain/validators/validation.error';
import { Genre } from '../../../domain/genre.aggregate';
import { IGenreRepository } from '../../../domain/genre.repository';
import { GenreOutput, GenreOutputMapper } from '../../common/genre.output';
import { CreateGenreInput } from './create-genre.input';
import { NotFoundError } from '@core/shared/domain/errors/not-found.error';

export type CreateGenreOutput = GenreOutput;

export class CreateGenreUseCase
  implements IUseCase<CreateGenreInput, CreateGenreOutput>
{
  constructor(
    private uow: IUnitOfWork,
    private genreRepo: IGenreRepository,
    private categoryRepo: ICategoryRepository,
  ) {}

  async execute(input: CreateGenreInput): Promise<CreateGenreOutput> {
    const categoryIds = input.categoryIds.map((v) => new CategoryId(v));
    const { exists: existingIds, notExists: notExistingIds } =
      await this.categoryRepo.existsById(categoryIds);

    const entity = Genre.create({
      name: input.name,
      categoryIds: notExistingIds.length ? [] : existingIds,
      isActive: input.isActive,
    });

    if (notExistingIds.length) {
      entity.notification.setError(
        notExistingIds
          .map((it) => new NotFoundError(it.id, Category))
          .map((e) => e.message),
        'categoryIds',
      );
    }

    if (entity.notification.hasErrors()) {
      throw new EntityValidationError(entity.notification.toJSON());
    }

    await this.uow.do(async () => {
      return this.genreRepo.insert(entity);
    });

    const categories = await this.categoryRepo.findByIds(
      Array.from(entity.categoryIds.values()),
    );

    return GenreOutputMapper.toOutput(entity, categories);
  }
}
