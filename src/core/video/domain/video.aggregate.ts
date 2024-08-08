import { Uuid } from '../../shared/domain/value-objects/uuid.vo';
import { CategoryId } from '../../category/domain/category.aggregate';
import { AggregateRoot } from '../../shared/domain/aggregate-root';
import { GenreId } from '../../genre/domain/genre.aggregate';
import { CastMemberId } from '../../cast-member/domain/cast-member.aggregate';

export type VideoConstructorProps = {
  videoId: VideoId;
  title: string;
  description: string;
  yearLaunched: number;
  duration: number;
  rating: Rating;
  isOpened: boolean;
  isPublished: boolean;

  categoryIds: Map<string, CategoryId>;
  genreIds: Map<string, GenreId>;
  castMemberIds: Map<string, CastMemberId>;
  createdAt: Date;
};

export type VideoCreateCommand = {
  title: string;
  description: string;
  yearLaunched: number;
  duration: number;
  rating: Rating;

  isOpened: boolean;

  categoryIds: CategoryId[];
  genreIds: GenreId[];
  castMemberIds: CastMemberId[];
};

export class VideoId extends Uuid {}

export enum Rating {
  RL = 'L',
  R10 = '10',
  R12 = '12',
  R14 = '14',
  R16 = '16',
  R18 = '18',
}

export class Video extends AggregateRoot {
  videoId: VideoId;
  title: string;
  description: string;
  yearLaunched: number;
  duration: number;
  rating: Rating;

  isOpened: boolean;
  isPublished: boolean;

  categoryIds: Map<string, CategoryId>;
  genreIds: Map<string, GenreId>;
  castMemberIds: Map<string, CastMemberId>;

  createdAt: Date;

  constructor(props: VideoConstructorProps) {
    super();
    this.videoId = props.videoId;
    this.title = props.title;
    this.description = props.description;
    this.yearLaunched = props.yearLaunched;
    this.duration = props.duration;
    this.rating = props.rating;

    this.isOpened = props.isOpened;
    this.isPublished = props.isPublished;

    this.categoryIds = props.categoryIds;
    this.genreIds = props.genreIds;
    this.castMemberIds = props.castMemberIds;
    this.createdAt = props.createdAt;

    this.validate();
  }

  get entityId() {
    return this.videoId;
  }

  static create(command: VideoCreateCommand) {
    const props: VideoConstructorProps = {
      ...command,
      videoId: new VideoId(),
      createdAt: new Date(),
      isPublished: false,

      categoryIds: new Map(command.categoryIds.map((id) => [id.id, id])),
      genreIds: new Map(command.genreIds.map((id) => [id.id, id])),
      castMemberIds: new Map(command.castMemberIds.map((id) => [id.id, id])),
    };

    return new Video(props);
  }

  changeTitle(title: string): void {
    this.title = title;
    this.validate();
  }

  changeDescription(description: string): void {
    this.description = description;
  }

  changeYearLaunched(yearLaunched: number): void {
    this.yearLaunched = yearLaunched;
  }

  changeDuration(duration: number): void {
    this.duration = duration;
  }

  changeRating(rating: Rating): void {
    this.rating = rating;
  }

  markAsOpened(): void {
    this.isOpened = true;
  }

  markAsNotOpened(): void {
    this.isOpened = false;
  }

  addCategoryId(categoryId: CategoryId): void {
    this.categoryIds.set(categoryId.id, categoryId);
  }

  removeCategoryId(categoryId: CategoryId): void {
    this.categoryIds.delete(categoryId.id);
  }

  syncCategoryIds(categoryIds: CategoryId[]) {
    this.categoryIds = new Map(categoryIds.map((id) => [id.id, id]));
  }

  addGenreId(genreId: GenreId): void {
    this.genreIds.set(genreId.id, genreId);
  }

  removeGenreId(genreId: GenreId): void {
    this.genreIds.delete(genreId.id);
  }

  syncGenresId(genresId: GenreId[]): void {
    this.genreIds = new Map(genresId.map((id) => [id.id, id]));
  }

  addCastMemberId(castMemberId: CastMemberId): void {
    this.castMemberIds.set(castMemberId.id, castMemberId);
  }

  removeCastMemberId(castMemberId: CastMemberId): void {
    this.castMemberIds.delete(castMemberId.id);
  }

  syncCastMembersId(castMembersId: CastMemberId[]): void {
    this.castMemberIds = new Map(castMembersId.map((id) => [id.id, id]));
  }

  //   validate(fields?: string[]) {
  //     const validator = VideoValidator();
  //     return validator.validate(this.notification, this);
  //   }

  toJSON() {
    return {
      videoId: this.videoId.id,
      title: this.title,
      description: this.description,
      yearLaunched: this.yearLaunched,
      duration: this.duration,
      rating: this.rating,
      isOpened: this.isOpened,
      isPublished: this.isPublished,
      categoryIds: Array.from(this.categoryIds.values()).map((id) => id.id),
      genreIds: Array.from(this.genreIds.values()).map((id) => id.id),
      castMemberIds: Array.from(this.castMemberIds.values()).map((id) => id.id),
      createdAt: this.createdAt,
    };
  }

  // static fake() {
  //   return VideoFakeBuilder;
  // }
}
