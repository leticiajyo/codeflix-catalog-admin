import { CastMemberId } from '../../../cast-member/domain/cast-member.aggregate';
import { CategoryId } from '../../../category/domain/category.aggregate';
import { GenreId } from '../../../genre/domain/genre.aggregate';
import { IDomainEvent } from '../../../shared/domain/events/event.interface';
import { Banner } from '../banner.vo';
import { ThumbnailHalf } from '../thumbnail-half.vo';
import { Thumbnail } from '../thumbnail.vo';
import { Trailer } from '../trailer.vo';
import { VideoMedia } from '../video-media.vo';
import { Rating, VideoId } from '../video.aggregate';

export type VideoCreatedEventProps = {
  videoId: VideoId;
  title: string;
  description: string;
  yearLaunched: number;
  duration: number;
  rating: Rating;
  isOpened: boolean;
  isPublished: boolean;
  banner: Banner | null;
  thumbnail: Thumbnail | null;
  thumbnailHalf: ThumbnailHalf | null;
  trailer: Trailer | null;
  video: VideoMedia | null;
  categoryIds: CategoryId[];
  genreIds: GenreId[];
  castMemberIds: CastMemberId[];
  createdAt: Date;
};

export class VideoCreatedEvent implements IDomainEvent {
  readonly aggregateId: VideoId;
  readonly occurredOn: Date;
  readonly eventVersion: number;

  readonly title: string;
  readonly description: string;
  readonly yearLaunched: number;
  readonly duration: number;
  readonly rating: Rating;
  readonly isOpened: boolean;
  readonly isPublished: boolean;
  readonly banner: Banner | null;
  readonly thumbnail: Thumbnail | null;
  readonly thumbnailHalf: ThumbnailHalf | null;
  readonly trailer: Trailer | null;
  readonly video: VideoMedia | null;
  readonly categoryIds: CategoryId[];
  readonly genreIds: GenreId[];
  readonly castMemberIds: CastMemberId[];
  readonly createdAt: Date;

  constructor(props: VideoCreatedEventProps) {
    this.aggregateId = props.videoId;
    this.title = props.title;
    this.description = props.description;
    this.yearLaunched = props.yearLaunched;
    this.duration = props.duration;
    this.rating = props.rating;
    this.isOpened = props.isOpened;
    this.isPublished = props.isPublished;
    this.banner = props.banner;
    this.thumbnail = props.thumbnail;
    this.thumbnailHalf = props.thumbnailHalf;
    this.trailer = props.trailer;
    this.video = props.video;
    this.categoryIds = props.categoryIds;
    this.genreIds = props.genreIds;
    this.castMemberIds = props.castMemberIds;
    this.createdAt = props.createdAt;
    this.occurredOn = new Date();
    this.eventVersion = 1;
  }
}
