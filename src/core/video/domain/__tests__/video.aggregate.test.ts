import { Video, VideoCreateCommand, VideoId, Rating } from '../video.aggregate';
import { VideoCreatedEvent } from '../events/video-created.event';
import { CastMemberId } from '@core/cast-member/domain/cast-member.aggregate';
import { CategoryId } from '@core/category/domain/category.aggregate';
import { GenreId } from '@core/genre/domain/genre.aggregate';
import { Banner } from '../banner.vo';
import { ThumbnailHalf } from '../thumbnail-half.vo';
import { Thumbnail } from '../thumbnail.vo';
import { Trailer } from '../trailer.vo';
import { VideoMedia } from '../video-media.vo';
import { AudioVideoMediaReplaced } from '../events/video-audio-media-replaced.event';

describe('Video Aggregate', () => {
  let validateSpy: jest.SpyInstance;
  let emitEventSpy: jest.SpyInstance;
  let tryMarkAsPublishedSpy: jest.SpyInstance;

  beforeEach(() => {
    validateSpy = jest.spyOn(Video.prototype as any, 'validate');
    emitEventSpy = jest.spyOn(Video.prototype as any, 'emitEvent');
    tryMarkAsPublishedSpy = jest.spyOn(
      Video.prototype as any,
      'tryMarkAsPublished',
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should validate entity', () => {
      Video.create({
        title: 'Test Title',
        description: 'Test Description',
        yearLaunched: 2024,
        duration: 120,
        rating: Rating.R14,
        isOpened: true,
        categoryIds: [new CategoryId()],
        genreIds: [new GenreId()],
        castMemberIds: [new CastMemberId()],
      });

      expect(validateSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('create', () => {
    it('should create a video with default parameters', () => {
      const command: VideoCreateCommand = {
        title: 'Test Title',
        description: 'Test Description',
        yearLaunched: 2024,
        duration: 120,
        rating: Rating.R14,
        isOpened: true,
      };

      const video = Video.create(command);

      expect(video.videoId).toBeInstanceOf(VideoId);
      expect(video.isPublished).toBe(false);
      expect(video.createdAt).toBeInstanceOf(Date);
      expect(video.banner).toBeNull();
      expect(video.thumbnail).toBeNull();
      expect(video.thumbnailHalf).toBeNull();
      expect(video.trailer).toBeNull();
      expect(video.video).toBeNull();
      expect(video.categoryIds).toEqual(new Map());
      expect(video.genreIds).toEqual(new Map());
      expect(video.castMemberIds).toEqual(new Map());

      expect(validateSpy).toHaveBeenCalledTimes(1);
      expect(emitEventSpy).toHaveBeenCalledWith(expect.any(VideoCreatedEvent));
      expect(tryMarkAsPublishedSpy).toHaveBeenCalledTimes(1);
    });

    it('should create a video with given params', () => {
      const banner = new Banner({
        name: 'test name banner',
        location: 'test location banner',
      });
      const thumbnail = new Thumbnail({
        name: 'test name thumbnail',
        location: 'test location thumbnail',
      });
      const thumbnailHalf = new ThumbnailHalf({
        name: 'test name thumbnail half',
        location: 'test location thumbnail half',
      });
      const trailer = Trailer.create({
        name: 'test name trailer',
        rawLocation: 'test raw location trailer',
      });
      const videoMedia = VideoMedia.create({
        name: 'test name video',
        rawLocation: 'test raw location video',
      });

      const categoryId = new CategoryId();
      const genreId = new GenreId();
      const castMemberId = new CastMemberId();

      const command: VideoCreateCommand = {
        title: 'Test Title',
        description: 'Test Description',
        yearLaunched: 2024,
        duration: 120,
        rating: Rating.R14,
        isOpened: true,
        banner,
        thumbnail,
        thumbnailHalf,
        trailer,
        video: videoMedia,
        categoryIds: [categoryId],
        genreIds: [genreId],
        castMemberIds: [castMemberId],
      };

      const video = Video.create(command);

      expect(video.title).toBe(command.title);
      expect(video.description).toBe(command.description);
      expect(video.yearLaunched).toBe(command.yearLaunched);
      expect(video.duration).toBe(command.duration);
      expect(video.rating).toBe(command.rating);
      expect(video.isOpened).toBe(command.isOpened);
      expect(video.banner).toEqual(banner);
      expect(video.thumbnail).toEqual(thumbnail);
      expect(video.thumbnailHalf).toEqual(thumbnailHalf);
      expect(video.trailer).toEqual(trailer);
      expect(video.video).toEqual(videoMedia);
      expect(video.categoryIds).toEqual(new Map([[categoryId.id, categoryId]]));
      expect(video.genreIds).toEqual(new Map([[genreId.id, genreId]]));
      expect(video.castMemberIds).toEqual(
        new Map([[castMemberId.id, castMemberId]]),
      );

      expect(validateSpy).toHaveBeenCalledTimes(1);
      expect(emitEventSpy).toHaveBeenCalledWith(expect.any(VideoCreatedEvent));
      expect(tryMarkAsPublishedSpy).toHaveBeenCalledTimes(1);
    });

    it('should create and publish a video', () => {
      const trailer = Trailer.create({
        name: 'test name trailer',
        rawLocation: 'test raw location trailer',
      }).complete('test encoded_location trailer');
      const videoMedia = VideoMedia.create({
        name: 'test name video',
        rawLocation: 'test raw location video',
      }).complete('test encoded_location video');

      const command: VideoCreateCommand = {
        title: 'Test Title',
        description: 'Test Description',
        yearLaunched: 2024,
        duration: 120,
        rating: Rating.R14,
        isOpened: true,
        trailer,
        video: videoMedia,
      };

      const video = Video.create(command);

      expect(video.isPublished).toBeTruthy();

      expect(validateSpy).toHaveBeenCalledTimes(1);
      expect(emitEventSpy).toHaveBeenCalledWith(expect.any(VideoCreatedEvent));
      expect(tryMarkAsPublishedSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('changeTitle', () => {
    it('should change video title', () => {
      const video = Video.fake().oneVideoWithoutMedias().build();

      const newTitle = 'New Title';
      video.changeTitle(newTitle);

      expect(video.title).toBe(newTitle);
      expect(validateSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('changeDescription', () => {
    it('should change video description', () => {
      const video = Video.fake().oneVideoWithoutMedias().build();

      const newDescription = 'New Description';
      video.changeDescription(newDescription);

      expect(video.description).toBe(newDescription);
      expect(validateSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('changeYearLaunched', () => {
    it('should change video yearLaunched', () => {
      const video = Video.fake().oneVideoWithoutMedias().build();

      const newYearLaunched = 2014;
      video.changeYearLaunched(newYearLaunched);

      expect(video.yearLaunched).toBe(newYearLaunched);
      expect(validateSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('changeDuration', () => {
    it('should change video duration', () => {
      const video = Video.fake().oneVideoWithoutMedias().build();

      const newDuration = 2014;
      video.changeDuration(newDuration);

      expect(video.duration).toBe(newDuration);
      expect(validateSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('changeRating', () => {
    it('should change video rating', () => {
      const video = Video.fake().oneVideoWithoutMedias().build();

      const newRating = Rating.R14;
      video.changeRating(newRating);

      expect(video.rating).toBe(newRating);
      expect(validateSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('markAsOpened and markAsNotOpened', () => {
    it('should mark video as opened', () => {
      const video = Video.fake()
        .oneVideoWithoutMedias()
        .withMarkAsNotOpened()
        .build();

      video.markAsOpened();

      expect(video.isOpened).toBe(true);
    });

    it('should mark video as not opened', () => {
      const video = Video.fake()
        .oneVideoWithoutMedias()
        .withMarkAsOpened()
        .build();

      video.markAsNotOpened();

      expect(video.isOpened).toBe(false);
    });
  });

  describe('replaceBanner, replaceThumbnail, replaceThumbnailHalf', () => {
    it('should replace the banner', () => {
      const video = Video.fake().oneVideoWithoutMedias().build();

      const newBanner = new Banner({
        name: 'test name banner',
        location: 'test location banner',
      });

      video.replaceBanner(newBanner);

      expect(video.banner).toEqual(newBanner);
    });

    it('should replace the thumbnail', () => {
      const video = Video.fake().oneVideoWithoutMedias().build();

      const newThumbnail = new Thumbnail({
        name: 'test name thumbnail',
        location: 'test location thumbnail',
      });
      video.replaceThumbnail(newThumbnail);

      expect(video.thumbnail).toEqual(newThumbnail);
    });

    it('should replace the thumbnail half', () => {
      const video = Video.fake().oneVideoWithoutMedias().build();

      const newThumbnailHalf = new ThumbnailHalf({
        name: 'test name thumbnail half',
        location: 'test location thumbnail half',
      });
      video.replaceThumbnailHalf(newThumbnailHalf);

      expect(video.thumbnailHalf).toEqual(newThumbnailHalf);
    });
  });

  describe('replaceTrailer and replaceVideo', () => {
    it('should replace the trailer and emit event', () => {
      const video = Video.fake().oneVideoWithoutMedias().build();

      const newTrailer = Trailer.create({
        name: 'test name trailer',
        rawLocation: 'test raw location trailer',
      });
      video.replaceTrailer(newTrailer);

      expect(video.trailer).toEqual(newTrailer);
      expect(emitEventSpy).toHaveBeenCalledWith(
        expect.any(AudioVideoMediaReplaced),
      );
      expect(tryMarkAsPublishedSpy).toHaveBeenCalledTimes(1);
    });

    it('should replace the video and emit event', () => {
      const video = Video.fake().oneVideoWithoutMedias().build();

      const newVideoMedia = VideoMedia.create({
        name: 'test name video',
        rawLocation: 'test raw location video',
      });

      video.replaceVideo(newVideoMedia);

      expect(video.video).toEqual(newVideoMedia);
      expect(emitEventSpy).toHaveBeenCalledWith(
        expect.any(AudioVideoMediaReplaced),
      );
      expect(tryMarkAsPublishedSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('addCategoryId, removeCategoryId, syncCategoryIds', () => {
    it('should add category id', () => {
      const video = Video.create({
        title: 'Test Title',
        description: 'Test Description',
        yearLaunched: 2024,
        duration: 120,
        rating: Rating.R14,
        isOpened: true,
        categoryIds: [],
        genreIds: [],
        castMemberIds: [],
      });
      const categoryId = new CategoryId();

      video.addCategoryId(categoryId);

      expect(video.categoryIds).toEqual(new Map([[categoryId.id, categoryId]]));

      expect(validateSpy).toHaveBeenCalledTimes(1);
    });

    it('should remove category id', () => {
      const video = Video.create({
        title: 'Test Title',
        description: 'Test Description',
        yearLaunched: 2024,
        duration: 120,
        rating: Rating.R14,
        isOpened: true,
        categoryIds: [],
        genreIds: [],
        castMemberIds: [],
      });
      const categoryId = new CategoryId();

      video.removeCategoryId(categoryId);

      expect(video.categoryIds).toEqual(new Map());

      expect(validateSpy).toHaveBeenCalledTimes(1);
    });

    it('should sync category ids', () => {
      const video = Video.create({
        title: 'Test Title',
        description: 'Test Description',
        yearLaunched: 2024,
        duration: 120,
        rating: Rating.R14,
        isOpened: true,
        categoryIds: [],
        genreIds: [],
        castMemberIds: [],
      });
      const newCategoryId = new CategoryId();

      video.syncCategoryIds([newCategoryId]);

      expect(video.categoryIds).toEqual(
        new Map([[newCategoryId.id, newCategoryId]]),
      );

      expect(validateSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('addGenreId, removeGenreId, syncGenreIds', () => {
    it('should add genre id', () => {
      const video = Video.create({
        title: 'Test Title',
        description: 'Test Description',
        yearLaunched: 2024,
        duration: 120,
        rating: Rating.R14,
        isOpened: true,
        categoryIds: [],
        genreIds: [],
        castMemberIds: [],
      });
      const genreId = new GenreId();

      video.addGenreId(genreId);

      expect(video.genreIds).toEqual(new Map([[genreId.id, genreId]]));

      expect(validateSpy).toHaveBeenCalledTimes(1);
    });

    it('should remove genre id', () => {
      const video = Video.create({
        title: 'Test Title',
        description: 'Test Description',
        yearLaunched: 2024,
        duration: 120,
        rating: Rating.R14,
        isOpened: true,
        categoryIds: [],
        genreIds: [],
        castMemberIds: [],
      });
      const genreId = new GenreId();

      video.removeGenreId(genreId);

      expect(video.genreIds).toEqual(new Map());

      expect(validateSpy).toHaveBeenCalledTimes(1);
    });

    it('should sync genre ids', () => {
      const video = Video.create({
        title: 'Test Title',
        description: 'Test Description',
        yearLaunched: 2024,
        duration: 120,
        rating: Rating.R14,
        isOpened: true,
        categoryIds: [],
        genreIds: [],
        castMemberIds: [],
      });
      const newGenreId = new GenreId();

      video.syncGenreIds([newGenreId]);

      expect(video.genreIds).toEqual(new Map([[newGenreId.id, newGenreId]]));

      expect(validateSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('addCastMemberId, removeCastMemberId, syncCastMemberIds', () => {
    it('should add castMember id', () => {
      const video = Video.create({
        title: 'Test Title',
        description: 'Test Description',
        yearLaunched: 2024,
        duration: 120,
        rating: Rating.R14,
        isOpened: true,
        categoryIds: [],
        genreIds: [],
        castMemberIds: [],
      });
      const castMemberId = new CastMemberId();

      video.addCastMemberId(castMemberId);

      expect(video.castMemberIds).toEqual(
        new Map([[castMemberId.id, castMemberId]]),
      );

      expect(validateSpy).toHaveBeenCalledTimes(1);
    });

    it('should remove castMember id', () => {
      const video = Video.create({
        title: 'Test Title',
        description: 'Test Description',
        yearLaunched: 2024,
        duration: 120,
        rating: Rating.R14,
        isOpened: true,
        categoryIds: [],
        genreIds: [],
        castMemberIds: [],
      });
      const castMemberId = new CastMemberId();

      video.removeCastMemberId(castMemberId);

      expect(video.castMemberIds).toEqual(new Map());

      expect(validateSpy).toHaveBeenCalledTimes(1);
    });

    it('should sync castMember ids', () => {
      const video = Video.create({
        title: 'Test Title',
        description: 'Test Description',
        yearLaunched: 2024,
        duration: 120,
        rating: Rating.R14,
        isOpened: true,
        categoryIds: [],
        genreIds: [],
        castMemberIds: [],
      });
      const newCastMemberId = new CastMemberId();

      video.syncCastMemberIds([newCastMemberId]);

      expect(video.castMemberIds).toEqual(
        new Map([[newCastMemberId.id, newCastMemberId]]),
      );

      expect(validateSpy).toHaveBeenCalledTimes(1);
    });
  });
});
