import { SearchParams } from '@core/shared/domain/repository/search-params';
import { CastMemberId } from '../../cast-member/domain/cast-member.aggregate';
import { CategoryId } from '../../category/domain/category.aggregate';
import { GenreId } from '../../genre/domain/genre.aggregate';
import { SearchResult } from '../../shared/domain/repository/search-result';
import { Video, VideoId } from './video.aggregate';
import { ISearchableRepository } from '@core/shared/domain/repository/repository.interface';

export type VideoFilter = {
  title?: string;
  categoryIds?: CategoryId[];
  genreIds?: GenreId[];
  castMemberIds?: CastMemberId[];
};

export class VideoSearchParams extends SearchParams<VideoFilter> {}

export class VideoSearchResult extends SearchResult<Video> {}

export interface IVideoRepository
  extends ISearchableRepository<
    Video,
    VideoId,
    VideoFilter,
    VideoSearchParams,
    VideoSearchResult
  > {}
