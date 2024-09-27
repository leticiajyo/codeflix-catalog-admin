import { VideoOutput } from '@core/video/application/common/video.output';
import { CreateVideoDto } from '../dto/create-video.dto';
import { VideosController } from '../videos.controller';
import { VideoPresenter } from '../videos.presenter';
import { Rating } from '@core/video/domain/video.aggregate';
import { UpdateVideoDto } from '../dto/update-video.dto';

const videoOutput: VideoOutput = {
  id: 'f1b7d16b-411b-4705-8c9f-812c1d4f93fd',
  title: 'Video 1',
  description: 'Description 1',
  yearLaunched: 2020,
  duration: 90,
  rating: Rating.R10,
  isOpened: false,
  isPublished: false,
  categoryIds: ['799c528c-fe0f-4ed4-b2f9-c45a4c79246b'],
  categories: [
    {
      id: '799c528c-fe0f-4ed4-b2f9-c45a4c79246b',
      name: 'Category 1',
      createdAt: new Date(),
    },
  ],
  genreIds: ['d063f6f2-6e08-4f94-b7ec-d21c93d45993'],
  genres: [
    {
      id: 'd063f6f2-6e08-4f94-b7ec-d21c93d45993',
      name: 'Genre 1',
      categoryIds: ['799c528c-fe0f-4ed4-b2f9-c45a4c79246b'],
      categories: [
        {
          id: '799c528c-fe0f-4ed4-b2f9-c45a4c79246b',
          name: 'Category 1',
          createdAt: new Date(),
        },
      ],
      isActive: true,
      createdAt: new Date(),
    },
  ],
  castMemberIds: ['e250c6ce-8b24-481d-8b4b-677bece6246a'],
  castMembers: [
    {
      id: 'e250c6ce-8b24-481d-8b4b-677bece6246a',
      name: 'Cast Member 1',
      type: 1,
      createdAt: new Date(),
    },
  ],
  createdAt: new Date(),
};

describe('Videos Controller', () => {
  let controller: VideosController;

  beforeEach(async () => {
    controller = new VideosController();
  });

  describe('create', () => {
    it('should execute use case', async () => {
      const mockCreateUseCase = {
        execute: jest
          .fn()
          .mockReturnValue(Promise.resolve({ id: videoOutput.id })),
      };
      controller['createUseCase'] = mockCreateUseCase as any;

      const mockGetUseCase = {
        execute: jest.fn().mockReturnValue(Promise.resolve(videoOutput)),
      };
      controller['getUseCase'] = mockGetUseCase as any;

      const input: CreateVideoDto = {
        title: 'Video 1',
        description: 'Description 1',
        yearLaunched: 2020,
        isOpened: false,
        rating: Rating.R10,
        duration: 90,
        categoryIds: ['categoryId'],
        genreIds: ['genreId'],
        castMemberIds: ['castMemberId'],
      };

      const presenter = await controller.create(input);

      expect(mockCreateUseCase.execute).toHaveBeenCalledWith(input);
      expect(mockGetUseCase.execute).toHaveBeenCalledWith({
        id: videoOutput.id,
      });
      expect(presenter).toBeInstanceOf(VideoPresenter);
      expect(presenter).toStrictEqual(new VideoPresenter(videoOutput));
    });
  });

  describe('findOne', () => {
    it('should execute use case', async () => {
      const id = '9366b7dc-2d71-4799-b91c-c64adb205104';

      const mockGetUseCase = {
        execute: jest.fn().mockReturnValue(Promise.resolve(videoOutput)),
      };
      controller['getUseCase'] = mockGetUseCase as any;

      const presenter = await controller.findOne(id);

      expect(mockGetUseCase.execute).toHaveBeenCalledWith({ id });
      expect(presenter).toBeInstanceOf(VideoPresenter);
      expect(presenter).toStrictEqual(new VideoPresenter(videoOutput));
    });
  });

  describe('update', () => {
    it('should execute use case to update video', async () => {
      const id = '9366b7dc-2d71-4799-b91c-c64adb205104';

      const mockUpdateUseCase = {
        execute: jest.fn().mockReturnValue(Promise.resolve({ id })),
      };
      controller['updateUseCase'] = mockUpdateUseCase as any;

      const mockGetUseCase = {
        execute: jest.fn().mockReturnValue(Promise.resolve(videoOutput)),
      };
      controller['getUseCase'] = mockGetUseCase as any;

      const input: UpdateVideoDto = {
        title: 'other title',
        categoryIds: ['8d0b0c9e-9b1a-4e8a-9e1a-3b2c1d7c6b5a'],
      };

      const presenter = await controller.update(id, input, undefined);

      expect(mockUpdateUseCase.execute).toHaveBeenCalledWith({ id, ...input });
      expect(mockGetUseCase.execute).toHaveBeenCalledWith({ id });
      expect(presenter).toBeInstanceOf(VideoPresenter);
      expect(presenter).toStrictEqual(new VideoPresenter(videoOutput));
    });

    it('should throw error when trying to update video and upload files at the same time', async () => {
      const id = '9366b7dc-2d71-4799-b91c-c64adb205104';
      const files = {
        video: [
          {
            fieldname: 'video',
            originalname: 'video.mp4',
            encoding: '7bit',
            mimetype: 'video/mp4',
            buffer: Buffer.from('data'),
            size: 4,
          },
        ] as Express.Multer.File[],
      };
      const input: UpdateVideoDto = {
        title: 'other title',
        categoryIds: ['8d0b0c9e-9b1a-4e8a-9e1a-3b2c1d7c6b5a'],
      };

      await expect(() => controller.update(id, input, files)).rejects.toThrow(
        'Files and data cannot be sent together',
      );
    });

    it('should throw error when trying to upload more than one file', async () => {
      const id = '9366b7dc-2d71-4799-b91c-c64adb205104';
      const files = {
        video: [
          {
            fieldname: 'video',
            originalname: 'vide.mp4',
            encoding: '7bit',
            mimetype: 'video/mp4',
            buffer: Buffer.from('data'),
            size: 4,
          },
        ] as Express.Multer.File[],
        trailer: [
          {
            fieldname: 'trailer',
            originalname: 'trailer.mp4',
            encoding: '7bit',
            mimetype: 'video/mp4',
            buffer: Buffer.from('data'),
            size: 4,
          },
        ] as Express.Multer.File[],
      };

      await expect(() => controller.update(id, {}, files)).rejects.toThrow(
        'Only one file can be sent at a time',
      );
    });
  });
});
