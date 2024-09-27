import { CastMemberType } from '@core/cast-member/domain/cast-member.aggregate';
import {
  VideoCastMemberOutput,
  VideoCategoryOutput,
  VideoGenreOutput,
  VideoOutput,
} from '@core/video/application/common/video.output';
import { Rating } from '@core/video/domain/video.aggregate';
import { Transform, Type } from 'class-transformer';

export class VideoCategoryPresenter {
  id: string;
  name: string;
  @Transform(({ value }: { value: Date }) => {
    return value.toISOString();
  })
  createdAt: Date;

  constructor(output: VideoCategoryOutput) {
    this.id = output.id;
    this.name = output.name;
    this.createdAt = output.createdAt;
  }
}

export class VideoGenrePresenter {
  id: string;
  name: string;
  isActive: boolean;
  categoryIds: string[];
  @Type(() => VideoCategoryPresenter)
  categories: VideoCategoryPresenter[];
  @Transform(({ value }: { value: Date }) => {
    return value.toISOString();
  })
  createdAt: Date;

  constructor(output: VideoGenreOutput) {
    this.id = output.id;
    this.name = output.name;
    this.categoryIds = output.categoryIds;
    this.categories = output.categories.map((item) => {
      return new VideoCategoryPresenter(item);
    });
    this.isActive = output.isActive;
    this.createdAt = output.createdAt;
  }
}

export class VideoCastMemberPresenter {
  id: string;
  name: string;
  type: CastMemberType;
  @Transform(({ value }: { value: Date }) => {
    return value.toISOString();
  })
  createdAt: Date;

  constructor(output: VideoCastMemberOutput) {
    this.id = output.id;
    this.name = output.name;
    this.type = output.type;
    this.createdAt = output.createdAt;
  }
}

export class VideoPresenter {
  id: string;
  title: string;
  description: string;
  yearLaunched: number;
  duration: number;
  rating: Rating;
  isOpened: boolean;
  isPublished: boolean;
  categoryIds: string[];
  @Type(() => VideoCategoryPresenter)
  categories: VideoCategoryPresenter[];
  genreIds: string[];
  @Type(() => VideoGenrePresenter)
  genres: VideoGenrePresenter[];
  castMemberIds: string[];
  @Type(() => VideoCastMemberPresenter)
  castMembers: VideoCastMemberPresenter[];
  @Transform(({ value }: { value: Date }) => {
    return value.toISOString();
  })
  createdAt: Date;

  constructor(output: VideoOutput) {
    this.id = output.id;
    this.title = output.title;
    this.description = output.description;
    this.yearLaunched = output.yearLaunched;
    this.duration = output.duration;
    this.rating = output.rating;
    this.isOpened = output.isOpened;
    this.isPublished = output.isPublished;
    this.categoryIds = output.categoryIds;
    this.categories = output.categories.map((item) => {
      return new VideoCategoryPresenter(item);
    });
    this.genreIds = output.genreIds;
    this.genres = output.genres.map((item) => {
      return new VideoGenrePresenter(item);
    });
    this.castMemberIds = output.castMemberIds;
    this.castMembers = output.castMembers.map((item) => {
      return new VideoCastMemberPresenter(item);
    });
    this.createdAt = output.createdAt;
  }
}
