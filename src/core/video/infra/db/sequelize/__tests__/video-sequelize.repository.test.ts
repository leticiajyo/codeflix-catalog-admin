import { CastMemberSequelizeRepository } from '@core/cast-member/infra/db/sequelize/cast-member-sequelize.repository';
import { CastMemberModel } from '@core/cast-member/infra/db/sequelize/cast-member.model';
import { CategorySequelizeRepository } from '@core/category/infra/db/sequelize/category-sequelize.repository';
import { CategoryModel } from '@core/category/infra/db/sequelize/category.model';
import { GenreSequelizeRepository } from '@core/genre/infra/db/sequelize/genre-sequelize.repository';
import { GenreModel } from '@core/genre/infra/db/sequelize/genre.model';
import { UnitOfWorkSequelize } from '@core/shared/infra/db/sequelize/unit-of-work-sequelize';
import { Video, VideoId } from '@core/video/domain/video.aggregate';
import {
  createVideoRelations,
  setupSequelizeForVideo,
} from '../testing/video-sequelize.helper';
import { VideoSequelizeRepository } from '../video-sequelize.repository';
import {
  VideoCastMemberModel,
  VideoCategoryModel,
  VideoGenreModel,
  VideoModel,
} from '../video.model';
import {
  CastMember,
  CastMemberId,
} from '@core/cast-member/domain/cast-member.aggregate';
import { Category, CategoryId } from '@core/category/domain/category.aggregate';
import { Genre, GenreId } from '@core/genre/domain/genre.aggregate';
import { AudioVideoMediaModel } from '../audio-video-media.model';
import { ImageMediaModel } from '../image-media.model';
import { NotFoundError } from '@core/shared/domain/errors/not-found.error';
import { VideoSearchParams } from '@core/video/domain/video.repository';
import { SortDirection } from '@core/shared/domain/repository/search-params';

describe('VideoSequelizeRepository Integration Tests', () => {
  let videoRepo: VideoSequelizeRepository;
  let categoryRepo: CategorySequelizeRepository;
  let genreRepo: GenreSequelizeRepository;
  let castMemberRepo: CastMemberSequelizeRepository;
  let uow: UnitOfWorkSequelize;

  const sequelizeHelper = setupSequelizeForVideo();

  beforeEach(async () => {
    uow = new UnitOfWorkSequelize(sequelizeHelper.sequelize);
    videoRepo = new VideoSequelizeRepository(VideoModel, uow);
    categoryRepo = new CategorySequelizeRepository(CategoryModel);
    genreRepo = new GenreSequelizeRepository(GenreModel, uow);
    castMemberRepo = new CastMemberSequelizeRepository(CastMemberModel);
  });

  describe('insert', () => {
    it('should insert a new entity', async () => {
      const { category, genre, castMember } = await createVideoRelations(
        categoryRepo,
        genreRepo,
        castMemberRepo,
      );

      const video = Video.fake()
        .oneVideoWithAllMedias()
        .addCategoryId(category.categoryId)
        .addGenreId(genre.genreId)
        .addCastMemberId(castMember.castMemberId)
        .build();
      await videoRepo.insert(video);

      const entity = await videoRepo.findById(video.videoId);

      expect(entity!.toJSON()).toStrictEqual(video.toJSON());
      await expect(ImageMediaModel.count()).resolves.toBe(3);
      await expect(AudioVideoMediaModel.count()).resolves.toBe(2);
      await expect(VideoCategoryModel.count()).resolves.toBe(1);
      await expect(VideoGenreModel.count()).resolves.toBe(1);
      await expect(VideoCastMemberModel.count()).resolves.toBe(1);
    });
  });

  describe('bulkInsert', () => {
    it('should insert new entities', async () => {
      const { category, genre, castMember } = await createVideoRelations(
        categoryRepo,
        genreRepo,
        castMemberRepo,
      );

      const videos = Video.fake()
        .manyVideosWithoutMedias(2)
        .addCategoryId(category.categoryId)
        .addGenreId(genre.genreId)
        .addCastMemberId(castMember.castMemberId)
        .build();
      await videoRepo.bulkInsert(videos);

      const entities = await videoRepo.findAll();

      expect(entities.length).toBe(2);
      expect(entities[0].toJSON()).toStrictEqual(videos[0].toJSON());
      expect(entities[1].toJSON()).toStrictEqual(videos[1].toJSON());
    });
  });

  describe('findById', () => {
    it('should return null if entity is not found', async () => {
      const entity = await genreRepo.findById(new VideoId());
      expect(entity).toBeNull();
    });
  });

  describe('findByIds', () => {
    it('should return entities for the given ids', async () => {
      const { category, genre, castMember } = await createVideoRelations(
        categoryRepo,
        genreRepo,
        castMemberRepo,
      );

      const videos = Video.fake()
        .manyVideosWithoutMedias(2)
        .addCategoryId(category.categoryId)
        .addGenreId(genre.genreId)
        .addCastMemberId(castMember.castMemberId)
        .build();
      await videoRepo.bulkInsert(videos);

      const entities = await videoRepo.findByIds([
        videos[0].videoId,
        videos[1].videoId,
      ]);

      for (const entity of entities) {
        const video = videos.find(
          (video) => video.videoId.id == entity.videoId.id,
        );

        expect(entity.toJSON()).toStrictEqual(video.toJSON());
      }
    });
  });

  describe('existsById', () => {
    it('should return entities separated in existing or not existing', async () => {
      const notExistId = new VideoId();

      const { category, genre, castMember } = await createVideoRelations(
        categoryRepo,
        genreRepo,
        castMemberRepo,
      );

      const video = Video.fake()
        .oneVideoWithoutMedias()
        .addCategoryId(category.categoryId)
        .addGenreId(genre.genreId)
        .addCastMemberId(castMember.castMemberId)
        .build();
      await videoRepo.insert(video);

      const result = await videoRepo.existsById([video.videoId, notExistId]);

      expect(result).toEqual({
        exists: [video.videoId],
        notExists: [notExistId],
      });
    });
  });

  describe('update', () => {
    it('should update an entity', async () => {
      const categories = Category.fake().manyCategories(2).build();
      await categoryRepo.bulkInsert(categories);

      const genres = Genre.fake()
        .manyGenres(2)
        .addCategoryId(categories[0].categoryId)
        .build();
      await genreRepo.bulkInsert(genres);

      const castMembers = CastMember.fake().manyCastMembers(2).build();
      await castMemberRepo.bulkInsert(castMembers);

      const fakerProps = Video.fake().oneVideoWithAllMedias().build();
      const video = Video.fake()
        .oneVideoWithoutMedias()
        .addCategoryId(categories[0].categoryId)
        .addGenreId(genres[0].genreId)
        .addCastMemberId(castMembers[0].castMemberId)
        .build();
      await videoRepo.insert(video);

      video.changeTitle('another title');
      video.replaceBanner(fakerProps.banner);
      video.replaceThumbnail(fakerProps.thumbnail);
      video.replaceThumbnailHalf(fakerProps.thumbnailHalf);
      video.replaceTrailer(fakerProps.trailer);
      video.replaceVideo(fakerProps.video);

      video.syncCategoryIds([categories[1].categoryId]);
      video.syncGenreIds([genres[1].genreId]);
      video.syncCastMemberIds([castMembers[1].castMemberId]);
      await videoRepo.update(video);

      const videoUpdated = await videoRepo.findById(video.videoId);
      expect(video.toJSON()).toStrictEqual(videoUpdated!.toJSON());

      await expect(ImageMediaModel.count()).resolves.toBe(3);
      await expect(AudioVideoMediaModel.count()).resolves.toBe(2);

      await expect(VideoCategoryModel.count()).resolves.toBe(1);
      await expect(VideoGenreModel.count()).resolves.toBe(1);
      await expect(VideoCastMemberModel.count()).resolves.toBe(1);
    });

    it('should throw error when entity is not found', async () => {
      const entity = Video.fake().oneVideoWithoutMedias().build();

      await expect(videoRepo.update(entity)).rejects.toThrow(
        new NotFoundError(entity.videoId.id, Video),
      );
    });
  });

  describe('delete', () => {
    it('should delete an entity', async () => {
      const { category, genre, castMember } = await createVideoRelations(
        categoryRepo,
        genreRepo,
        castMemberRepo,
      );

      const video = Video.fake()
        .oneVideoWithAllMedias()
        .addCategoryId(category.categoryId)
        .addGenreId(genre.genreId)
        .addCastMemberId(castMember.castMemberId)
        .build();
      await videoRepo.insert(video);

      await videoRepo.delete(video.videoId);

      const entity = await videoRepo.findById(video.videoId);
      expect(entity).toBeNull();
      await expect(VideoCategoryModel.count()).resolves.toBe(0);
      await expect(VideoGenreModel.count()).resolves.toBe(0);
      await expect(VideoCastMemberModel.count()).resolves.toBe(0);
      await expect(ImageMediaModel.count()).resolves.toBe(0);
      await expect(AudioVideoMediaModel.count()).resolves.toBe(0);
    });

    it('should throw error when entity is not found', async () => {
      const entity = Video.fake().oneVideoWithoutMedias().build();

      await expect(videoRepo.delete(entity.videoId)).rejects.toThrow(
        new NotFoundError(entity.videoId.id, Video),
      );
    });
  });

  describe('search', () => {
    it('should apply default paginate when search params are null', async () => {
      const { category, genre, castMember } = await createVideoRelations(
        categoryRepo,
        genreRepo,
        castMemberRepo,
      );

      const videos = Video.fake()
        .manyVideosWithoutMedias(16)
        .addCategoryId(category.categoryId)
        .addGenreId(genre.genreId)
        .addCastMemberId(castMember.castMemberId)
        .build();
      await videoRepo.bulkInsert(videos);

      const searchOutput = await videoRepo.search(new VideoSearchParams());

      expect(searchOutput).toMatchObject({
        total: 16,
        currentPage: 1,
        lastPage: 2,
        perPage: 15,
      });
      expect(searchOutput.items).toHaveLength(15);
    });

    it('should order by createdAt DESC when search params are null', async () => {
      const { category, genre, castMember } = await createVideoRelations(
        categoryRepo,
        genreRepo,
        castMemberRepo,
      );

      const createdAt = new Date();
      const videos = Video.fake()
        .manyVideosWithoutMedias(5)
        .addCategoryId(category.categoryId)
        .addGenreId(genre.genreId)
        .addCastMemberId(castMember.castMemberId)
        .withTitle((index) => `Title ${index}`)
        .withCreatedAt((index) => new Date(createdAt.getTime() + index))
        .build();
      await videoRepo.bulkInsert(videos);

      const searchOutput = await videoRepo.search(new VideoSearchParams());

      searchOutput.items.reverse().forEach((_, index) => {
        expect(`Title ${index}`).toBe(`${videos[index].title}`);
      });
    });

    it('should apply filter', async () => {
      const categories = Category.fake().manyCategories(2).build();
      await categoryRepo.bulkInsert(categories);

      const genres = Genre.fake()
        .manyGenres(2)
        .addCategoryId(categories[0].categoryId)
        .build();
      await genreRepo.bulkInsert(genres);

      const castMembers = CastMember.fake().manyCastMembers(2).build();
      await castMemberRepo.bulkInsert(castMembers);

      const videos = [
        Video.fake()
          .oneVideoWithoutMedias()
          .withTitle('test')
          .addCategoryId(categories[0].categoryId)
          .addGenreId(genres[0].genreId)
          .addCastMemberId(castMembers[0].castMemberId)
          .build(),
        Video.fake()
          .oneVideoWithoutMedias()
          .withTitle('other title')
          .addCategoryId(categories[0].categoryId)
          .addGenreId(genres[0].genreId)
          .addCastMemberId(castMembers[0].castMemberId)
          .build(),
        Video.fake()
          .oneVideoWithoutMedias()
          .withTitle('test')
          .addCategoryId(categories[1].categoryId)
          .addGenreId(genres[0].genreId)
          .addCastMemberId(castMembers[0].castMemberId)
          .build(),
        Video.fake()
          .oneVideoWithoutMedias()
          .withTitle('test')
          .addCategoryId(categories[0].categoryId)
          .addGenreId(genres[1].genreId)
          .addCastMemberId(castMembers[0].castMemberId)
          .build(),
        Video.fake()
          .oneVideoWithoutMedias()
          .withTitle('test')
          .addCategoryId(categories[0].categoryId)
          .addGenreId(genres[0].genreId)
          .addCastMemberId(castMembers[1].castMemberId)
          .build(),
      ];
      await videoRepo.bulkInsert(videos);

      const searchOutput = await videoRepo.search(
        new VideoSearchParams({
          filter: {
            title: 'test',
            categoryIds: [new CategoryId(categories[0].categoryId.id)],
            genreIds: [new GenreId(genres[0].genreId.id)],
            castMemberIds: [new CastMemberId(castMembers[0].castMemberId.id)],
          },
        }),
      );

      expect(searchOutput.items).toHaveLength(1);
      expect(searchOutput.total).toBe(1);
    });

    it('should apply sort', async () => {
      expect(genreRepo.sortableFields).toStrictEqual(['name', 'createdAt']);

      const { category, genre, castMember } = await createVideoRelations(
        categoryRepo,
        genreRepo,
        castMemberRepo,
      );

      const videos = [
        Video.fake()
          .oneVideoWithoutMedias()
          .withTitle('c')
          .addCategoryId(category.categoryId)
          .addGenreId(genre.genreId)
          .addCastMemberId(castMember.castMemberId)
          .build(),
        Video.fake()
          .oneVideoWithoutMedias()
          .withTitle('a')
          .addCategoryId(category.categoryId)
          .addGenreId(genre.genreId)
          .addCastMemberId(castMember.castMemberId)
          .build(),
        Video.fake()
          .oneVideoWithoutMedias()
          .withTitle('b')
          .addCategoryId(category.categoryId)
          .addGenreId(genre.genreId)
          .addCastMemberId(castMember.castMemberId)
          .build(),
      ];
      await videoRepo.bulkInsert(videos);

      const searchOutput = await videoRepo.search(
        new VideoSearchParams({
          sort: 'title',
          sortDirection: SortDirection.ASC,
        }),
      );

      expect(searchOutput.items.map((it) => it.title)).toEqual(
        [videos[1], videos[2], videos[0]].map((it) => it.title),
      );
    });

    it('should apply paginate, sort and filter', async () => {
      expect(genreRepo.sortableFields).toStrictEqual(['name', 'createdAt']);

      const { category, genre, castMember } = await createVideoRelations(
        categoryRepo,
        genreRepo,
        castMemberRepo,
      );

      const videos = [
        Video.fake()
          .oneVideoWithoutMedias()
          .withTitle('other name')
          .withCreatedAt(new Date(new Date().getTime() + 100))
          .addCategoryId(category.categoryId)
          .addGenreId(genre.genreId)
          .addCastMemberId(castMember.castMemberId)
          .build(),
        Video.fake()
          .oneVideoWithoutMedias()
          .withTitle('test a')
          .withCreatedAt(new Date(new Date().getTime() + 200))
          .addCategoryId(category.categoryId)
          .addGenreId(genre.genreId)
          .addCastMemberId(castMember.castMemberId)
          .build(),
        Video.fake()
          .oneVideoWithoutMedias()
          .withTitle('test b')
          .withCreatedAt(new Date(new Date().getTime() + 300))
          .addCategoryId(category.categoryId)
          .addGenreId(genre.genreId)
          .addCastMemberId(castMember.castMemberId)
          .build(),
        Video.fake()
          .oneVideoWithoutMedias()
          .withTitle('test c')
          .withCreatedAt(new Date(new Date().getTime() + 400))
          .addCategoryId(category.categoryId)
          .addGenreId(genre.genreId)
          .addCastMemberId(castMember.castMemberId)
          .build(),
      ];
      await videoRepo.bulkInsert(videos);

      const searchOutput = await videoRepo.search(
        new VideoSearchParams({
          page: 1,
          perPage: 2,
          sort: 'createdAt',
          sortDirection: SortDirection.ASC,
          filter: {
            title: 'test',
          },
        }),
      );

      expect(searchOutput).toMatchObject({
        total: 3,
        currentPage: 1,
        perPage: 2,
        lastPage: 2,
      });
      expect(searchOutput.items.map((it) => it.title)).toEqual(
        [videos[1], videos[2]].map((it) => it.title),
      );
    });
  });

  describe('transaction mode', () => {
    describe('insert method', () => {
      it('should insert a video', async () => {
        const { category, genre, castMember } = await createVideoRelations(
          categoryRepo,
          genreRepo,
          castMemberRepo,
        );

        const video = Video.fake()
          .oneVideoWithAllMedias()
          .addCategoryId(category.categoryId)
          .addGenreId(genre.genreId)
          .addCastMemberId(castMember.castMemberId)
          .build();

        uow.start();
        await videoRepo.insert(video);
        await uow.commit();

        const videoCreated = await videoRepo.findById(video.videoId);
        expect(video.videoId).toBeValueObject(videoCreated!.videoId);
      });

      it('rollback the insertion', async () => {
        const { category, genre, castMember } = await createVideoRelations(
          categoryRepo,
          genreRepo,
          castMemberRepo,
        );

        const video = Video.fake()
          .oneVideoWithAllMedias()
          .addCategoryId(category.categoryId)
          .addGenreId(genre.genreId)
          .addCastMemberId(castMember.castMemberId)
          .build();

        await uow.start();
        await videoRepo.insert(video);
        await uow.rollback();

        await expect(videoRepo.findById(video.videoId)).resolves.toBeNull();
        await expect(VideoCategoryModel.count()).resolves.toBe(0);
        await expect(VideoGenreModel.count()).resolves.toBe(0);
        await expect(VideoCastMemberModel.count()).resolves.toBe(0);
        await expect(ImageMediaModel.count()).resolves.toBe(0);
        await expect(AudioVideoMediaModel.count()).resolves.toBe(0);
      });
    });

    describe('bulkInsert method', () => {
      it('should insert a list of videos', async () => {
        const { category, genre, castMember } = await createVideoRelations(
          categoryRepo,
          genreRepo,
          castMemberRepo,
        );

        const videos = Video.fake()
          .manyVideosWithAllMedias(2)
          .addCategoryId(category.categoryId)
          .addGenreId(genre.genreId)
          .addCastMemberId(castMember.castMemberId)
          .build();

        await uow.start();
        await videoRepo.bulkInsert(videos);
        await uow.commit();

        const [video1, video2] = await Promise.all([
          videoRepo.findById(videos[0].videoId),
          videoRepo.findById(videos[1].videoId),
        ]);

        expect(video1!.videoId).toBeValueObject(videos[0].videoId);
        expect(video2!.videoId).toBeValueObject(videos[1].videoId);
      });

      it('rollback the bulk insertion', async () => {
        const { category, genre, castMember } = await createVideoRelations(
          categoryRepo,
          genreRepo,
          castMemberRepo,
        );

        const videos = Video.fake()
          .manyVideosWithAllMedias(2)
          .addCategoryId(category.categoryId)
          .addGenreId(genre.genreId)
          .addCastMemberId(castMember.castMemberId)
          .build();

        await uow.start();
        await videoRepo.bulkInsert(videos);
        await uow.rollback();

        await expect(videoRepo.findById(videos[0].videoId)).resolves.toBeNull();
        await expect(videoRepo.findById(videos[1].videoId)).resolves.toBeNull();
        await expect(VideoCategoryModel.count()).resolves.toBe(0);
        await expect(VideoGenreModel.count()).resolves.toBe(0);
        await expect(VideoCastMemberModel.count()).resolves.toBe(0);
        await expect(ImageMediaModel.count()).resolves.toBe(0);
        await expect(AudioVideoMediaModel.count()).resolves.toBe(0);
      });
    });

    describe('findById method', () => {
      it('should return a video', async () => {
        const { category, genre, castMember } = await createVideoRelations(
          categoryRepo,
          genreRepo,
          castMemberRepo,
        );

        const video = Video.fake()
          .oneVideoWithAllMedias()
          .addCategoryId(category.categoryId)
          .addGenreId(genre.genreId)
          .addCastMemberId(castMember.castMemberId)
          .build();

        await uow.start();
        await videoRepo.insert(video);
        const result = await videoRepo.findById(video.videoId);

        expect(result!.videoId).toBeValueObject(video.videoId);
        await uow.commit();
      });
    });

    describe('findAll method', () => {
      it('should return a list of videos', async () => {
        const { category, genre, castMember } = await createVideoRelations(
          categoryRepo,
          genreRepo,
          castMemberRepo,
        );

        const videos = Video.fake()
          .manyVideosWithAllMedias(2)
          .addCategoryId(category.categoryId)
          .addGenreId(genre.genreId)
          .addCastMemberId(castMember.castMemberId)
          .build();

        await uow.start();
        await videoRepo.bulkInsert(videos);
        const result = await videoRepo.findAll();

        expect(result.length).toBe(2);
        await uow.commit();
      });
    });

    describe('findByIds method', () => {
      it('should return a list of videos', async () => {
        const { category, genre, castMember } = await createVideoRelations(
          categoryRepo,
          genreRepo,
          castMemberRepo,
        );

        const videos = Video.fake()
          .manyVideosWithAllMedias(2)
          .addCategoryId(category.categoryId)
          .addGenreId(genre.genreId)
          .addCastMemberId(castMember.castMemberId)
          .build();

        await uow.start();
        await videoRepo.bulkInsert(videos);
        const result = await videoRepo.findByIds(videos.map((v) => v.videoId));

        expect(result.length).toBe(2);
        await uow.commit();
      });
    });

    describe('existsById method', () => {
      it('should return true if the video exists', async () => {
        const { category, genre, castMember } = await createVideoRelations(
          categoryRepo,
          genreRepo,
          castMemberRepo,
        );

        const video = Video.fake()
          .oneVideoWithAllMedias()
          .addCategoryId(category.categoryId)
          .addGenreId(genre.genreId)
          .addCastMemberId(castMember.castMemberId)
          .build();

        await uow.start();
        await videoRepo.insert(video);
        const existsResult = await videoRepo.existsById([video.videoId]);

        expect(existsResult.exists[0]).toBeValueObject(video.videoId);
        await uow.commit();
      });
    });

    describe('update method', () => {
      it('should update a video', async () => {
        const { category, genre, castMember } = await createVideoRelations(
          categoryRepo,
          genreRepo,
          castMemberRepo,
        );

        const video = Video.fake()
          .oneVideoWithAllMedias()
          .addCategoryId(category.categoryId)
          .addGenreId(genre.genreId)
          .addCastMemberId(castMember.castMemberId)
          .build();

        await videoRepo.insert(video);
        await uow.start();
        video.changeTitle('new title');
        await videoRepo.update(video);
        await uow.commit();

        const result = await videoRepo.findById(video.videoId);
        expect(result!.title).toBe(video.title);
      });

      it('rollback the update', async () => {
        const { category, genre, castMember } = await createVideoRelations(
          categoryRepo,
          genreRepo,
          castMemberRepo,
        );

        const video = Video.fake()
          .oneVideoWithAllMedias()
          .addCategoryId(category.categoryId)
          .addGenreId(genre.genreId)
          .addCastMemberId(castMember.castMemberId)
          .build();

        await videoRepo.insert(video);
        await uow.start();
        video.changeTitle('new title');
        await videoRepo.update(video);
        await uow.rollback();

        const notChangeVideo = await videoRepo.findById(video.videoId);
        expect(notChangeVideo!.title).not.toBe(video.title);
      });
    });

    describe('delete method', () => {
      it('should delete a video', async () => {
        const { category, genre, castMember } = await createVideoRelations(
          categoryRepo,
          genreRepo,
          castMemberRepo,
        );

        const video = Video.fake()
          .oneVideoWithAllMedias()
          .addCategoryId(category.categoryId)
          .addGenreId(genre.genreId)
          .addCastMemberId(castMember.castMemberId)
          .build();

        await videoRepo.insert(video);
        await uow.start();
        await videoRepo.delete(video.videoId);
        await uow.commit();

        await expect(videoRepo.findById(video.videoId)).resolves.toBeNull();
        await expect(VideoCategoryModel.count()).resolves.toBe(0);
        await expect(VideoGenreModel.count()).resolves.toBe(0);
        await expect(VideoCastMemberModel.count()).resolves.toBe(0);
        await expect(ImageMediaModel.count()).resolves.toBe(0);
        await expect(AudioVideoMediaModel.count()).resolves.toBe(0);
      });

      it('rollback the deletion', async () => {
        const { category, genre, castMember } = await createVideoRelations(
          categoryRepo,
          genreRepo,
          castMemberRepo,
        );

        const video = Video.fake()
          .oneVideoWithAllMedias()
          .addCategoryId(category.categoryId)
          .addGenreId(genre.genreId)
          .addCastMemberId(castMember.castMemberId)
          .build();

        await videoRepo.insert(video);
        await uow.start();
        await videoRepo.delete(video.videoId);
        await uow.rollback();

        const result = await videoRepo.findById(video.videoId);
        expect(result!.videoId).toBeValueObject(video.videoId);
        await expect(VideoCategoryModel.count()).resolves.toBe(1);
        await expect(VideoGenreModel.count()).resolves.toBe(1);
        await expect(VideoCastMemberModel.count()).resolves.toBe(1);
        await expect(ImageMediaModel.count()).resolves.toBe(3);
        await expect(AudioVideoMediaModel.count()).resolves.toBe(2);
      });
    });

    describe('search method', () => {
      it('should return a list of genres', async () => {
        const { category, genre, castMember } = await createVideoRelations(
          categoryRepo,
          genreRepo,
          castMemberRepo,
        );

        const genres = Video.fake()
          .manyVideosWithAllMedias(2)
          .withTitle('movie')
          .addCategoryId(category.categoryId)
          .addGenreId(genre.genreId)
          .addCastMemberId(castMember.castMemberId)
          .build();

        await uow.start();
        await videoRepo.bulkInsert(genres);

        const searchParams = new VideoSearchParams({
          filter: { title: 'movie' },
        });
        const result = await videoRepo.search(searchParams);

        expect(result.items.length).toBe(2);
        expect(result.total).toBe(2);
        await uow.commit();
      });
    });
  });
});
