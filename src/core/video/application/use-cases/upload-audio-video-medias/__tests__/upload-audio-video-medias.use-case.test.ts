import { CastMemberSequelizeRepository } from '@core/cast-member/infra/db/sequelize/cast-member-sequelize.repository';
import { CastMemberModel } from '@core/cast-member/infra/db/sequelize/cast-member.model';
import { CategorySequelizeRepository } from '@core/category/infra/db/sequelize/category-sequelize.repository';
import { CategoryModel } from '@core/category/infra/db/sequelize/category.model';
import { GenreSequelizeRepository } from '@core/genre/infra/db/sequelize/genre-sequelize.repository';
import { GenreModel } from '@core/genre/infra/db/sequelize/genre.model';
import { IStorage } from '@core/shared/application/storage.interface';
import { EntityValidationError } from '@core/shared/domain/validators/validation.error';
import { UnitOfWorkSequelize } from '@core/shared/infra/db/sequelize/unit-of-work-sequelize';
import { InMemoryStorage } from '@core/shared/infra/storage/in-memory.storage';
import { Video } from '@core/video/domain/video.aggregate';
import { IVideoRepository } from '@core/video/domain/video.repository';
import {
  createVideoRelations,
  setupSequelizeForVideo,
} from '@core/video/infra/db/sequelize/testing/video-sequelize.helper';
import { VideoSequelizeRepository } from '@core/video/infra/db/sequelize/video-sequelize.repository';
import { VideoModel } from '@core/video/infra/db/sequelize/video.model';
import { NotFoundError } from '@core/shared/domain/errors/not-found.error';
import { UploadAudioVideoMediasUseCase } from '../upload-audio-video-medias.use-case';
import EventEmitter2 from 'eventemitter2';
import { ApplicationService } from '@core/shared/application/application.service';
import { DomainEventMediator } from '@core/shared/domain/events/domain-event-mediator';

describe('Upload Audio Video Medias Use Case', () => {
  let uploadAudioVideoMediasUseCase: UploadAudioVideoMediasUseCase;
  let videoRepo: IVideoRepository;
  let categoryRepo: CategorySequelizeRepository;
  let genreRepo: GenreSequelizeRepository;
  let castMemberRepo: CastMemberSequelizeRepository;
  let uow: UnitOfWorkSequelize;
  let storageService: IStorage;
  let domainEventMediator: DomainEventMediator;
  let applicationService: ApplicationService;
  const sequelizeHelper = setupSequelizeForVideo();

  beforeEach(() => {
    const eventEmitter = new EventEmitter2();
    domainEventMediator = new DomainEventMediator(eventEmitter);
    applicationService = new ApplicationService(uow, domainEventMediator);
    uow = new UnitOfWorkSequelize(sequelizeHelper.sequelize);
    categoryRepo = new CategorySequelizeRepository(CategoryModel);
    genreRepo = new GenreSequelizeRepository(GenreModel, uow);
    castMemberRepo = new CastMemberSequelizeRepository(CastMemberModel);
    videoRepo = new VideoSequelizeRepository(VideoModel, uow);
    storageService = new InMemoryStorage();

    uploadAudioVideoMediasUseCase = new UploadAudioVideoMediasUseCase(
      applicationService,
      videoRepo,
      storageService,
    );
  });

  describe('execute', () => {
    it('should throw error when video is not found', async () => {
      await expect(
        uploadAudioVideoMediasUseCase.execute({
          videoId: '4e9e2e4e-4b4a-4b4a-8b8b-8b8b8b8b8b8b',
          field: 'trailer',
          file: {
            rawName: 'trailer.mp4',
            data: Buffer.from(''),
            mimeType: 'image/jpg',
            size: 100,
          },
        }),
      ).rejects.toThrow(
        new NotFoundError('4e9e2e4e-4b4a-4b4a-8b8b-8b8b8b8b8b8b', Video),
      );
    });

    it('should throw error when video is invalid', async () => {
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

      try {
        await uploadAudioVideoMediasUseCase.execute({
          videoId: video.videoId.id,
          field: 'trailer',
          file: {
            rawName: 'trailer.mp3',
            data: Buffer.from(''),
            mimeType: 'video/mp3',
            size: 100,
          },
        });
      } catch (error) {
        expect(error).toBeInstanceOf(EntityValidationError);
        expect(error.errors).toEqual([
          {
            trailer: [
              'Invalid media file mime type: video/mp3 not in video/mp4',
            ],
          },
        ]);
      }
    });

    it('should upload trailer image', async () => {
      const storeSpy = jest.spyOn(storageService, 'store');

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

      await uploadAudioVideoMediasUseCase.execute({
        videoId: video.videoId.id,
        field: 'trailer',
        file: {
          rawName: 'trailer.mp4',
          data: Buffer.from('test data'),
          mimeType: 'video/mp4',
          size: 100,
        },
      });

      const videoUpdated = await videoRepo.findById(video.videoId);

      expect(videoUpdated.trailer.name.includes('.mp4')).toBeTruthy();
      expect(videoUpdated.trailer.rawLocation).toBe(
        `videos/${videoUpdated.videoId.id}/videos`,
      );
      expect(storeSpy).toHaveBeenCalledWith({
        data: Buffer.from('test data'),
        id: videoUpdated.trailer.rawUrl,
        mimeType: 'video/mp4',
      });
    });
  });
});
