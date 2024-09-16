import {
  CastMemberType,
  CastMember,
} from '@core/cast-member/domain/cast-member.aggregate';
import { Category } from '@core/category/domain/category.aggregate';
import { GenreCategoryOutput } from '@core/genre/application/common/genre.output';
import { Genre } from '@core/genre/domain/genre.aggregate';
import { Rating, Video } from '@core/video/domain/video.aggregate';

export type VideoCategoryOutput = {
  id: string;
  name: string;
  createdAt: Date;
};

export type VideoGenreOutput = {
  id: string;
  name: string;
  isActive: boolean;
  categoryIds: string[];
  categories: GenreCategoryOutput[];
  createdAt: Date;
};

export type VideoCastMemberOutput = {
  id: string;
  name: string;
  type: CastMemberType;
  createdAt: Date;
};

export type VideoOutput = {
  id: string;
  title: string;
  description: string;
  yearLaunched: number;
  duration: number;
  rating: Rating;
  isOpened: boolean;
  isPublished: boolean;
  categoryIds: string[];
  categories: VideoCategoryOutput[];
  genreIds: string[];
  genres: VideoGenreOutput[];
  castMemberIds: string[];
  castMembers: VideoCastMemberOutput[];
  createdAt: Date;
};

export type VideoOutputParams = {
  video: Video;
  allCategoriesOfVideoAndGenre: Category[];
  genres: Genre[];
  castMembers: CastMember[];
};

export class VideoOutputMapper {
  static toOutput({
    video,
    allCategoriesOfVideoAndGenre,
    genres,
    castMembers,
  }: VideoOutputParams): VideoOutput {
    return {
      id: video.videoId.id,
      title: video.title,
      description: video.description,
      yearLaunched: video.yearLaunched,
      duration: video.duration,
      rating: video.rating,
      isOpened: video.isOpened,
      isPublished: video.isPublished,
      categoryIds: Array.from(video.categoryIds.values()).map((c) => c.id),
      categories: allCategoriesOfVideoAndGenre
        .filter((c) => video.categoryIds.has(c.categoryId.id))
        .map((c) => ({
          id: c.categoryId.id,
          name: c.name,
          createdAt: c.createdAt,
        })),
      genreIds: Array.from(video.genreIds.values()).map((g) => g.id),
      genres: VideoOutputMapper.toGenreVideoOutput(
        video,
        genres,
        allCategoriesOfVideoAndGenre,
      ),
      castMemberIds: Array.from(video.castMemberIds.values()).map((c) => c.id),
      castMembers: castMembers
        .filter((c) => video.castMemberIds.has(c.castMemberId.id))
        .map((c) => ({
          id: c.castMemberId.id,
          name: c.name,
          type: c.type,
          createdAt: c.createdAt,
        })),
      createdAt: video.createdAt,
    };
  }

  private static toGenreVideoOutput(
    video: Video,
    genres: Genre[],
    categories: Category[],
  ) {
    return genres
      .filter((g) => video.genreIds.has(g.genreId.id))
      .map((g) => ({
        id: g.genreId.id,
        name: g.name,
        isActive: g.isActive,
        categoryIds: Array.from(g.categoryIds.values()).map((c) => c.id),
        categories: categories
          .filter((c) => g.categoryIds.has(c.categoryId.id))
          .map((c) => ({
            id: c.categoryId.id,
            name: c.name,
            createdAt: c.createdAt,
          })),
        createdAt: g.createdAt,
      }));
  }
}
