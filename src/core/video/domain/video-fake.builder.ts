import { Chance } from 'chance';
import { Rating, Video, VideoId } from './video.aggregate';
import { CategoryId } from '../../category/domain/category.aggregate';
import { ImageMedia } from '../../shared/domain/value-objects/image-media.vo';
import { GenreId } from '../../genre/domain/genre.aggregate';
import { CastMemberId } from '../../cast-member/domain/cast-member.aggregate';
import { Banner } from './banner.vo';
import { Thumbnail } from './thumbnail.vo';
import { ThumbnailHalf } from './thumbnail-half.vo';
import { Trailer } from './trailer.vo';
import { VideoMedia } from './video-media.vo';

type PropOrFactory<T> = T | ((index: number) => T);

export class VideoFakeBuilder<T> {
  private _videoId: PropOrFactory<VideoId> = () => new VideoId();
  private _title: PropOrFactory<string> = () => this.chance.word();
  private _description: PropOrFactory<string> = () => this.chance.word();
  private _yearLaunched: PropOrFactory<number> = () => +this.chance.year();
  private _duration: PropOrFactory<number> = () =>
    this.chance.integer({ min: 1, max: 100 });
  private _rating: PropOrFactory<Rating> = () => Rating.R10;
  private _isOpened: PropOrFactory<boolean> = () => true;
  private _isPublished: PropOrFactory<boolean> = () => false;
  private _createdAt: PropOrFactory<Date> = () => new Date();

  private _banner: PropOrFactory<Banner | null> = () =>
    new Banner({
      name: 'test-name-banner.png',
      location: 'test path banner',
    });
  private _thumbnail: PropOrFactory<Thumbnail | null> = () =>
    new Thumbnail({
      name: 'test-name-thumbnail.png',
      location: 'test path thumbnail',
    });
  private _thumbnailHalf: PropOrFactory<ThumbnailHalf | null> = () =>
    new ThumbnailHalf({
      name: 'test-name-thumbnail-half.png',
      location: 'test path thumbnail half',
    });
  private _trailer: PropOrFactory<Trailer | null> = () =>
    Trailer.create({
      name: 'test-name-trailer.mp4',
      rawLocation: 'test path trailer',
    });
  private _video: PropOrFactory<VideoMedia | null> = () =>
    VideoMedia.create({
      name: 'test-name-video.mp4',
      rawLocation: 'test path video',
    });

  private _categoryIds: PropOrFactory<CategoryId>[] = [];
  private _genreIds: PropOrFactory<GenreId>[] = [];
  private _castMemberIds: PropOrFactory<CastMemberId>[] = [];

  private count;

  static oneVideoWithoutMedias() {
    return new VideoFakeBuilder<Video>()
      .withoutBanner()
      .withoutThumbnail()
      .withoutThumbnailHalf()
      .withoutTrailer()
      .withoutVideo();
  }

  static oneVideoWithAllMedias() {
    return new VideoFakeBuilder<Video>();
  }

  static manyVideosWithoutMedias(count: number) {
    return new VideoFakeBuilder<Video[]>(count)
      .withoutBanner()
      .withoutThumbnail()
      .withoutThumbnailHalf()
      .withoutTrailer()
      .withoutVideo();
  }

  static manyVideosWithAllMedias(count: number) {
    return new VideoFakeBuilder<Video[]>(count);
  }

  private chance: Chance.Chance;

  private constructor(count: number = 1) {
    this.count = count;
    this.chance = Chance();
  }

  withVideoId(valueOrFactory: PropOrFactory<VideoId>) {
    this._videoId = valueOrFactory;
    return this;
  }

  withTitle(valueOrFactory: PropOrFactory<string>) {
    this._title = valueOrFactory;
    return this;
  }

  withDescription(valueOrFactory: PropOrFactory<string>) {
    this._description = valueOrFactory;
    return this;
  }

  withYearLaunched(valueOrFactory: PropOrFactory<number>) {
    this._yearLaunched = valueOrFactory;
    return this;
  }

  withDuration(valueOrFactory: PropOrFactory<number>) {
    this._duration = valueOrFactory;
    return this;
  }

  withRating(valueOrFactory: PropOrFactory<Rating>) {
    this._rating = valueOrFactory;
    return this;
  }

  withMarkAsOpened() {
    this._isOpened = true;
    return this;
  }

  withMarkAsNotOpened() {
    this._isOpened = false;
    return this;
  }

  withCreatedAt(valueOrFactory: PropOrFactory<Date>) {
    this._createdAt = valueOrFactory;
    return this;
  }

  withBanner(valueOrFactory: PropOrFactory<ImageMedia | null>) {
    this._banner = valueOrFactory;
    return this;
  }

  withoutBanner() {
    this._banner = null;
    return this;
  }

  withThumbnail(valueOrFactory: PropOrFactory<ImageMedia | null>) {
    this._thumbnail = valueOrFactory;
    return this;
  }

  withoutThumbnail() {
    this._thumbnail = null;
    return this;
  }

  withThumbnailHalf(valueOrFactory: PropOrFactory<ImageMedia | null>) {
    this._thumbnailHalf = valueOrFactory;
    return this;
  }

  withoutThumbnailHalf() {
    this._thumbnailHalf = null;
    return this;
  }

  withTrailer(valueOrFactory: PropOrFactory<Trailer | null>) {
    this._trailer = valueOrFactory;
    return this;
  }

  withTrailerComplete() {
    this._trailer = Trailer.create({
      name: 'test name trailer',
      rawLocation: 'test path trailer',
    }).complete('test encoded location trailer');
    return this;
  }

  withoutTrailer() {
    this._trailer = null;
    return this;
  }

  withVideo(valueOrFactory: PropOrFactory<VideoMedia | null>) {
    this._video = valueOrFactory;
    return this;
  }

  withVideoComplete() {
    this._video = VideoMedia.create({
      name: 'test name video',
      rawLocation: 'test path video',
    }).complete('test encoded location video');
    return this;
  }

  withoutVideo() {
    this._video = null;
    return this;
  }

  addCategoryId(valueOrFactory: PropOrFactory<CategoryId>) {
    this._categoryIds.push(valueOrFactory);
    return this;
  }

  addGenreId(valueOrFactory: PropOrFactory<GenreId>) {
    this._genreIds.push(valueOrFactory);
    return this;
  }

  addCastMemberId(valueOrFactory: PropOrFactory<CastMemberId>) {
    this._castMemberIds.push(valueOrFactory);
    return this;
  }

  build(): T {
    const videos = new Array(this.count).fill(undefined).map((_, index) => {
      const categoryIds = this._categoryIds.length
        ? this.callFactory(this._categoryIds, index)
        : [new CategoryId()];

      const genreIds = this._genreIds.length
        ? this.callFactory(this._genreIds, index)
        : [new GenreId()];

      const castMemberIds = this._castMemberIds.length
        ? this.callFactory(this._castMemberIds, index)
        : [new CastMemberId()];

      return new Video({
        videoId: this.callFactory(this._videoId, index),
        title: this.callFactory(this._title, index),
        description: this.callFactory(this._description, index),
        yearLaunched: this.callFactory(this._yearLaunched, index),
        duration: this.callFactory(this._duration, index),
        rating: this.callFactory(this._rating, index),
        isOpened: this.callFactory(this._isOpened, index),
        isPublished: this.callFactory(this._isPublished, index),
        createdAt: this.callFactory(this._createdAt, index),
        banner: this.callFactory(this._banner, index),
        thumbnail: this.callFactory(this._thumbnail, index),
        thumbnailHalf: this.callFactory(this._thumbnailHalf, index),
        trailer: this.callFactory(this._trailer, index),
        video: this.callFactory(this._video, index),
        categoryIds: new Map(categoryIds.map((id) => [id.id, id])),
        genreIds: new Map(genreIds.map((id) => [id.id, id])),
        castMemberIds: new Map(castMemberIds.map((id) => [id.id, id])),
      });
    });
    return this.count === 1 ? (videos[0] as any) : videos;
  }

  private callFactory(factoryOrValue: PropOrFactory<any>, index: number) {
    if (typeof factoryOrValue === 'function') {
      return factoryOrValue(index);
    }

    if (factoryOrValue instanceof Array) {
      return factoryOrValue.map((value) => this.callFactory(value, index));
    }

    return factoryOrValue;
  }
}
