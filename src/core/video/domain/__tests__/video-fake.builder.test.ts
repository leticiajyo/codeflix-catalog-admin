import { CategoryId } from '@core/category/domain/category.aggregate';
import { VideoFakeBuilder } from '../video-fake.builder';
import { Rating, VideoId } from '../video.aggregate';
import { CastMemberId } from '@core/cast-member/domain/cast-member.aggregate';
import { GenreId } from '@core/genre/domain/genre.aggregate';
import { Banner } from '../banner.vo';
import { ThumbnailHalf } from '../thumbnail-half.vo';
import { Thumbnail } from '../thumbnail.vo';
import { Trailer } from '../trailer.vo';
import { VideoMedia } from '../video-media.vo';
import { AudioVideoMediaStatus } from '@core/shared/domain/value-objects/audio-video-media.vo';

describe('Video Faker Builder', () => {
  describe('oneVideoWithoutMedias', () => {
    it('should create video with random values and no medias', () => {
      const faker = VideoFakeBuilder.oneVideoWithoutMedias();

      const video = faker.build();

      expect(video.videoId).toBeInstanceOf(VideoId);
      expect(typeof video.title === 'string').toBeTruthy();
      expect(typeof video.description === 'string').toBeTruthy();
      expect(typeof video.yearLaunched === 'number').toBeTruthy();
      expect(typeof video.duration === 'number').toBeTruthy();
      expect(video.rating).toEqual(Rating.R10);
      expect(video.isOpened).toBeTruthy();
      expect(video.isPublished).toBeFalsy();
      expect(video.createdAt).toBeInstanceOf(Date);
      expect(video.banner).toBeNull();
      expect(video.thumbnail).toBeNull();
      expect(video.thumbnailHalf).toBeNull();
      expect(video.trailer).toBeNull();
      expect(video.video).toBeNull();
      expect(video.categoryIds.size).toBe(1);
      expect([...video.categoryIds.values()][0]).toBeInstanceOf(CategoryId);
      expect(video.genreIds.size).toBe(1);
      expect([...video.genreIds.values()][0]).toBeInstanceOf(GenreId);
      expect(video.castMemberIds.size).toBe(1);
      expect([...video.castMemberIds.values()][0]).toBeInstanceOf(CastMemberId);
    });
  });

  describe('oneVideoWithAllMedias', () => {
    it('should create video with random values and all medias', () => {
      const faker = VideoFakeBuilder.oneVideoWithAllMedias();

      const video = faker.build();

      expect(video.videoId).toBeInstanceOf(VideoId);
      expect(typeof video.title === 'string').toBeTruthy();
      expect(typeof video.description === 'string').toBeTruthy();
      expect(typeof video.yearLaunched === 'number').toBeTruthy();
      expect(typeof video.duration === 'number').toBeTruthy();
      expect(video.rating).toEqual(Rating.R10);
      expect(video.isOpened).toBeTruthy();
      expect(video.isPublished).toBeFalsy();
      expect(video.createdAt).toBeInstanceOf(Date);
      expect(video.banner).toBeInstanceOf(Banner);
      expect(video.thumbnail).toBeInstanceOf(Thumbnail);
      expect(video.thumbnailHalf).toBeInstanceOf(ThumbnailHalf);
      expect(video.trailer).toBeInstanceOf(Trailer);
      expect(video.video).toBeInstanceOf(VideoMedia);
      expect(video.categoryIds.size).toBe(1);
      expect([...video.categoryIds.values()][0]).toBeInstanceOf(CategoryId);
      expect(video.genreIds.size).toBe(1);
      expect([...video.genreIds.values()][0]).toBeInstanceOf(GenreId);
      expect(video.castMemberIds.size).toBe(1);
      expect([...video.castMemberIds.values()][0]).toBeInstanceOf(CastMemberId);
    });

    it('should create video with complete medias', () => {
      const faker = VideoFakeBuilder.oneVideoWithAllMedias()
        .withTrailerComplete()
        .withVideoComplete();

      const video = faker.build();

      expect(video.trailer).toBeInstanceOf(Trailer);
      expect(video.trailer.encodedLocation).toBeDefined();
      expect(video.trailer.status).toBe(AudioVideoMediaStatus.COMPLETED);
      expect(video.video).toBeInstanceOf(VideoMedia);
      expect(video.video.encodedLocation).toBeDefined();
      expect(video.video.status).toBe(AudioVideoMediaStatus.COMPLETED);
    });

    it('should create video with given values', () => {
      const videoId = new VideoId();
      const createdAt = new Date();
      const categoryId1 = new CategoryId();
      const categoryId2 = new CategoryId();
      const genreId1 = new GenreId();
      const genreId2 = new GenreId();
      const castMemberId1 = new CastMemberId();
      const castMemberId2 = new CastMemberId();
      const banner = new Banner({
        location: 'location',
        name: 'name',
      });
      const thumbnail = new Thumbnail({
        location: 'location',
        name: 'name',
      });
      const thumbnailHalf = new ThumbnailHalf({
        location: 'location',
        name: 'name',
      });
      const trailer = Trailer.create({
        rawLocation: 'raw_location',
        name: 'name',
      });
      const videoMedia = VideoMedia.create({
        rawLocation: 'raw_location',
        name: 'name',
      });
      const video = VideoFakeBuilder.oneVideoWithAllMedias()
        .withVideoId(videoId)
        .withTitle('name test')
        .withDescription('description test')
        .withYearLaunched(2020)
        .withDuration(90)
        .withRating(Rating.R12)
        .withMarkAsNotOpened()
        .addCategoryId(categoryId1)
        .addCategoryId(categoryId2)
        .addGenreId(genreId1)
        .addGenreId(genreId2)
        .addCastMemberId(castMemberId1)
        .addCastMemberId(castMemberId2)
        .withBanner(banner)
        .withThumbnail(thumbnail)
        .withThumbnailHalf(thumbnailHalf)
        .withTrailer(trailer)
        .withVideo(videoMedia)
        .withCreatedAt(createdAt)
        .build();

      expect(video.videoId.id).toBe(videoId.id);
      expect(video.title).toBe('name test');
      expect(video.description).toBe('description test');
      expect(video.yearLaunched).toBe(2020);
      expect(video.duration).toBe(90);
      expect(video.rating).toEqual(Rating.R12);
      expect(video.isOpened).toBeFalsy();
      expect(video.isPublished).toBeFalsy();
      expect(video.createdAt).toEqual(createdAt);
      expect(video.banner).toBe(banner);
      expect(video.thumbnail).toBe(thumbnail);
      expect(video.thumbnailHalf).toBe(thumbnailHalf);
      expect(video.trailer).toBe(trailer);
      expect(video.video).toBe(videoMedia);
      expect(video.categoryIds).toBeInstanceOf(Map);
      expect(video.categoryIds.get(categoryId1.id)).toBe(categoryId1);
      expect(video.categoryIds.get(categoryId2.id)).toBe(categoryId2);
      expect(video.genreIds).toBeInstanceOf(Map);
      expect(video.genreIds.get(genreId1.id)).toBe(genreId1);
      expect(video.genreIds.get(genreId2.id)).toBe(genreId2);
      expect(video.castMemberIds).toBeInstanceOf(Map);
      expect(video.castMemberIds.get(castMemberId1.id)).toBe(castMemberId1);
      expect(video.castMemberIds.get(castMemberId2.id)).toBe(castMemberId2);
    });
  });

  describe('manyVideosWithoutMedias', () => {
    it('should create videos with random values and no medias', () => {
      const faker = VideoFakeBuilder.manyVideosWithoutMedias(2);

      const videos = faker.build();

      videos.forEach((video) => {
        expect(video.videoId).toBeInstanceOf(VideoId);
        expect(typeof video.title === 'string').toBeTruthy();
        expect(typeof video.description === 'string').toBeTruthy();
        expect(typeof video.yearLaunched === 'number').toBeTruthy();
        expect(typeof video.duration === 'number').toBeTruthy();
        expect(video.rating).toEqual(Rating.R10);
        expect(video.isOpened).toBeTruthy();
        expect(video.isPublished).toBeFalsy();
        expect(video.createdAt).toBeInstanceOf(Date);
        expect(video.banner).toBeNull();
        expect(video.thumbnail).toBeNull();
        expect(video.thumbnailHalf).toBeNull();
        expect(video.trailer).toBeNull();
        expect(video.video).toBeNull();
        expect(video.categoryIds.size).toBe(1);
        expect([...video.categoryIds.values()][0]).toBeInstanceOf(CategoryId);
        expect(video.genreIds.size).toBe(1);
        expect([...video.genreIds.values()][0]).toBeInstanceOf(GenreId);
        expect(video.castMemberIds.size).toBe(1);
        expect([...video.castMemberIds.values()][0]).toBeInstanceOf(
          CastMemberId,
        );
      });
    });
  });

  describe('manyVideosWithAllMedias', () => {
    it('should create video with random values and all medias', () => {
      const faker = VideoFakeBuilder.manyVideosWithAllMedias(2);

      const videos = faker.build();

      videos.forEach((video) => {
        expect(video.videoId).toBeInstanceOf(VideoId);
        expect(typeof video.title === 'string').toBeTruthy();
        expect(typeof video.description === 'string').toBeTruthy();
        expect(typeof video.yearLaunched === 'number').toBeTruthy();
        expect(typeof video.duration === 'number').toBeTruthy();
        expect(video.rating).toEqual(Rating.R10);
        expect(video.isOpened).toBeTruthy();
        expect(video.isPublished).toBeFalsy();
        expect(video.createdAt).toBeInstanceOf(Date);
        expect(video.banner).toBeInstanceOf(Banner);
        expect(video.thumbnail).toBeInstanceOf(Thumbnail);
        expect(video.thumbnailHalf).toBeInstanceOf(ThumbnailHalf);
        expect(video.trailer).toBeInstanceOf(Trailer);
        expect(video.video).toBeInstanceOf(VideoMedia);
        expect(video.categoryIds.size).toBe(1);
        expect([...video.categoryIds.values()][0]).toBeInstanceOf(CategoryId);
        expect(video.genreIds.size).toBe(1);
        expect([...video.genreIds.values()][0]).toBeInstanceOf(GenreId);
        expect(video.castMemberIds.size).toBe(1);
        expect([...video.castMemberIds.values()][0]).toBeInstanceOf(
          CastMemberId,
        );
      });
    });

    it('should create videos with given factories', () => {
      const count = 2;
      const faker = VideoFakeBuilder.manyVideosWithAllMedias(count);

      const videoId = new VideoId();
      const createdAt = new Date();
      const banner = new Banner({
        location: 'location',
        name: 'name',
      });
      const thumbnail = new Thumbnail({
        location: 'location',
        name: 'name',
      });
      const thumbnailHalf = new ThumbnailHalf({
        location: 'location',
        name: 'name',
      });
      const trailer = Trailer.create({
        rawLocation: 'raw_location',
        name: 'name',
      });
      const videoMedia = VideoMedia.create({
        rawLocation: 'raw_location',
        name: 'name',
      });

      const mockVideoIdFactory = jest.fn(() => videoId);
      const mockCreatedAtFactory = jest.fn(() => createdAt);
      const mockBannerFactory = jest.fn(() => banner);
      const mockThumbnailFactory = jest.fn(() => thumbnail);
      const mockThumbnailHalfFactory = jest.fn(() => thumbnailHalf);
      const mockTrailerFactory = jest.fn(() => trailer);
      const mockVideoMediaFactory = jest.fn(() => videoMedia);

      const videos = faker
        .withVideoId(mockVideoIdFactory)
        .withCreatedAt(mockCreatedAtFactory)
        .withBanner(mockBannerFactory)
        .withThumbnail(mockThumbnailFactory)
        .withThumbnailHalf(mockThumbnailHalfFactory)
        .withTrailer(mockTrailerFactory)
        .withVideo(mockVideoMediaFactory)
        .build();

      expect(mockVideoIdFactory).toHaveBeenCalledTimes(count);
      expect(mockCreatedAtFactory).toHaveBeenCalledTimes(count);
      expect(mockBannerFactory).toHaveBeenCalledTimes(count);
      expect(mockThumbnailFactory).toHaveBeenCalledTimes(count);
      expect(mockThumbnailHalfFactory).toHaveBeenCalledTimes(count);
      expect(mockTrailerFactory).toHaveBeenCalledTimes(count);
      expect(mockVideoMediaFactory).toHaveBeenCalledTimes(count);

      videos.forEach((video) => {
        expect(video.videoId.id).toBe(videoId.id);
        expect(video.createdAt).toEqual(createdAt);
        expect(video.banner).toBe(banner);
        expect(video.thumbnail).toBe(thumbnail);
        expect(video.thumbnailHalf).toBe(thumbnailHalf);
        expect(video.trailer).toBe(trailer);
        expect(video.video).toBe(videoMedia);
      });
    });
  });
});
