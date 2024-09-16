import { IUseCase } from '@core/shared/application/use-case.interface';
import { IUnitOfWork } from '@core/shared/domain/repository/unit-of-work.interface';
import { EntityValidationError } from '@core/shared/domain/validators/validation.error';
import { Video } from '@core/video/domain/video.aggregate';
import { IVideoRepository } from '@core/video/domain/video.repository';
import { CreateVideoInput } from './create-video.input';
import { IGenreRepository } from '@core/genre/domain/genre.repository';
import { ICastMemberRepository } from '@core/cast-member/domain/cast-member.repository';
import { ICategoryRepository } from '@core/category/domain/category.repository';
import { Category, CategoryId } from '@core/category/domain/category.aggregate';
import {
  CastMember,
  CastMemberId,
} from '@core/cast-member/domain/cast-member.aggregate';
import { Genre, GenreId } from '@core/genre/domain/genre.aggregate';
import { NotFoundError } from '@core/shared/domain/errors/not-found.error';

export type CreateVideoOutput = { id: string };

export class CreateVideoUseCase
  implements IUseCase<CreateVideoInput, CreateVideoOutput>
{
  constructor(
    private uow: IUnitOfWork,
    private videoRepo: IVideoRepository,
    private categoryRepo: ICategoryRepository,
    private genreRepo: IGenreRepository,
    private castMemberRepo: ICastMemberRepository,
  ) {}

  async execute(input: CreateVideoInput): Promise<CreateVideoOutput> {
    const [
      { exists: categoryExistingIds, notExists: categoryNotExistingIds },
      { exists: genreExistingIds, notExists: genreNotExistingIds },
      { exists: castMemberExistingIds, notExists: castMemberNotExistingIds },
    ] = await Promise.all([
      await this.categoryRepo.existsById(
        input.categoryIds.map((v) => new CategoryId(v)),
      ),
      await this.genreRepo.existsById(
        input.genreIds.map((v) => new GenreId(v)),
      ),
      await await this.castMemberRepo.existsById(
        input.castMemberIds.map((v) => new CastMemberId(v)),
      ),
    ]);

    const entity = Video.create({
      ...input,
      categoryIds: categoryNotExistingIds.length ? [] : categoryExistingIds,
      genreIds: genreNotExistingIds.length ? [] : genreExistingIds,
      castMemberIds: castMemberNotExistingIds.length
        ? []
        : castMemberExistingIds,
    });

    if (categoryNotExistingIds.length) {
      entity.notification.setError(
        categoryNotExistingIds
          .map((it) => new NotFoundError(it.id, Category))
          .map((e) => e.message),
        'categoryIds',
      );
    }

    if (genreNotExistingIds.length) {
      entity.notification.setError(
        genreNotExistingIds
          .map((it) => new NotFoundError(it.id, Genre))
          .map((e) => e.message),
        'genreIds',
      );
    }

    if (castMemberNotExistingIds.length) {
      entity.notification.setError(
        castMemberNotExistingIds
          .map((it) => new NotFoundError(it.id, CastMember))
          .map((e) => e.message),
        'castMemberIds',
      );
    }

    if (entity.notification.hasErrors()) {
      throw new EntityValidationError(entity.notification.toJSON());
    }

    await this.uow.do(async () => {
      return this.videoRepo.insert(entity);
    });

    return { id: entity.videoId.id };
  }
}
