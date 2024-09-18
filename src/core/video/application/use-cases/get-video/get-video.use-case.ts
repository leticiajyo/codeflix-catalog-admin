import { ICastMemberRepository } from '@core/cast-member/domain/cast-member.repository';
import { ICategoryRepository } from '@core/category/domain/category.repository';
import { IGenreRepository } from '@core/genre/domain/genre.repository';
import { IUseCase } from '@core/shared/application/use-case.interface';
import { VideoId, Video } from '@core/video/domain/video.aggregate';
import { IVideoRepository } from '@core/video/domain/video.repository';
import { VideoOutputMapper, VideoOutput } from '../../common/video.output';
import { NotFoundError } from '@core/shared/domain/errors/not-found.error';

export type GetVideoInput = {
  id: string;
};

export type GetVideoOutput = VideoOutput;

export class GetVideoUseCase
  implements IUseCase<GetVideoInput, GetVideoOutput>
{
  constructor(
    private videoRepo: IVideoRepository,
    private categoryRepo: ICategoryRepository,
    private genreRepo: IGenreRepository,
    private castMemberRepo: ICastMemberRepository,
  ) {}

  async execute(input: GetVideoInput): Promise<GetVideoOutput> {
    const videoId = new VideoId(input.id);
    const video = await this.videoRepo.findById(videoId);

    if (!video) {
      throw new NotFoundError(input.id, Video);
    }

    const genres = await this.genreRepo.findByIds(
      Array.from(video.genreIds.values()),
    );

    const categories = await this.categoryRepo.findByIds(
      Array.from(video.categoryIds.values()).concat(
        genres.flatMap((g) => Array.from(g.categoryIds.values())),
      ),
    );

    const castMembers = await this.castMemberRepo.findByIds(
      Array.from(video.castMemberIds.values()),
    );

    return VideoOutputMapper.toOutput({
      video,
      genres,
      castMembers: castMembers,
      allCategoriesOfVideoAndGenre: categories,
    });
  }
}
