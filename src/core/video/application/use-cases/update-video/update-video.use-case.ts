import { IUseCase } from '@core/shared/application/use-case.interface';
import { IUnitOfWork } from '@core/shared/domain/repository/unit-of-work.interface';
import { EntityValidationError } from '@core/shared/domain/validators/validation.error';
import { VideoId, Video } from '@core/video/domain/video.aggregate';
import { IVideoRepository } from '@core/video/domain/video.repository';
import { UpdateVideoInput } from './update-video.input';
import { NotFoundError } from '@core/shared/domain/errors/not-found.error';
import { ICastMemberRepository } from '@core/cast-member/domain/cast-member.repository';
import { ICategoryRepository } from '@core/category/domain/category.repository';
import { IGenreRepository } from '@core/genre/domain/genre.repository';
import { Category, CategoryId } from '@core/category/domain/category.aggregate';
import { Genre, GenreId } from '@core/genre/domain/genre.aggregate';
import {
  CastMemberId,
  CastMember,
} from '@core/cast-member/domain/cast-member.aggregate';

export type UpdateVideoOutput = { id: string };

export class UpdateVideoUseCase
  implements IUseCase<UpdateVideoInput, UpdateVideoOutput>
{
  constructor(
    private uow: IUnitOfWork,
    private videoRepo: IVideoRepository,
    private categoryRepo: ICategoryRepository,
    private genreRepo: IGenreRepository,
    private castMemberRepo: ICastMemberRepository,
  ) {}

  async execute(input: UpdateVideoInput): Promise<UpdateVideoOutput> {
    const videoId = new VideoId(input.id);
    const video = await this.videoRepo.findById(videoId);

    if (!video) {
      throw new NotFoundError(input.id, Video);
    }

    input.title && video.changeTitle(input.title);
    input.description && video.changeDescription(input.description);
    input.yearLaunched && video.changeYearLaunched(input.yearLaunched);
    input.duration && video.changeDuration(input.duration);
    input.rating && video.changeRating(input.rating);

    if (input.isOpened === true) {
      video.markAsOpened();
    }

    if (input.isOpened === false) {
      video.markAsNotOpened();
    }

    if (input.categoryIds) {
      const { exists: categoryExistingIds, notExists: categoryNotExistingIds } =
        await this.categoryRepo.existsById(
          input.categoryIds.map((v) => new CategoryId(v)),
        );

      categoryExistingIds && video.syncCategoryIds(categoryExistingIds);

      categoryNotExistingIds.length &&
        video.notification.setError(
          categoryNotExistingIds
            .map((it) => new NotFoundError(it.id, Category))
            .map((e) => e.message),
          'categoryIds',
        );
    }

    if (input.genreIds) {
      const { exists: genreExistingIds, notExists: genreNotExistingIds } =
        await this.genreRepo.existsById(
          input.genreIds.map((v) => new GenreId(v)),
        );

      genreExistingIds && video.syncGenreIds(genreExistingIds);

      genreNotExistingIds.length &&
        video.notification.setError(
          genreNotExistingIds
            .map((it) => new NotFoundError(it.id, Genre))
            .map((e) => e.message),
          'genreIds',
        );
    }

    if (input.castMemberIds) {
      const {
        exists: castMemberExistingIds,
        notExists: castMemberNotExistingIds,
      } = await this.castMemberRepo.existsById(
        input.castMemberIds.map((v) => new CastMemberId(v)),
      );

      castMemberExistingIds && video.syncCastMemberIds(castMemberExistingIds);

      castMemberNotExistingIds.length &&
        video.notification.setError(
          castMemberNotExistingIds
            .map((it) => new NotFoundError(it.id, CastMember))
            .map((e) => e.message),
          'castMemberIds',
        );
    }

    if (video.notification.hasErrors()) {
      throw new EntityValidationError(video.notification.toJSON());
    }

    await this.uow.do(async () => {
      return this.videoRepo.update(video);
    });

    return { id: video.videoId.id };
  }
}
