import { IUseCase } from '@core/shared/application/use-case.interface';
import { IUnitOfWork } from '@core/shared/domain/repository/unit-of-work.interface';
import { EntityValidationError } from '@core/shared/domain/validators/validation.error';
import { Banner } from '@core/video/domain/banner.vo';
import { ThumbnailHalf } from '@core/video/domain/thumbnail-half.vo';
import { Thumbnail } from '@core/video/domain/thumbnail.vo';
import { VideoId, Video } from '@core/video/domain/video.aggregate';
import { IVideoRepository } from '@core/video/domain/video.repository';
import { UploadImageMediasInput } from './upload-image-medias.input';
import { NotFoundError } from '@core/shared/domain/errors/not-found.error';
import {
  InvalidMediaFileMimeTypeError,
  InvalidMediaFileSizeError,
} from '@core/shared/domain/validators/media-file.validator';
import { IStorage } from '@core/shared/application/storage.interface';

export type UploadImageMediasOutput = void;

export class UploadImageMediasUseCase
  implements IUseCase<UploadImageMediasInput, UploadImageMediasOutput>
{
  constructor(
    private uow: IUnitOfWork,
    private videoRepo: IVideoRepository,
    private storage: IStorage,
  ) {}

  async execute(
    input: UploadImageMediasInput,
  ): Promise<UploadImageMediasOutput> {
    const videoId = new VideoId(input.videoId);
    const video = await this.videoRepo.findById(videoId);

    if (!video) {
      throw new NotFoundError(input.videoId, Video);
    }

    const imagesMap = {
      banner: Banner,
      thumbnail: Thumbnail,
      thumbnail_half: ThumbnailHalf,
    };

    try {
      const image = imagesMap[input.field].createFromFile({
        ...input.file,
        videoId: videoId,
      });

      image instanceof Banner && video.replaceBanner(image);
      image instanceof Thumbnail && video.replaceThumbnail(image);
      image instanceof ThumbnailHalf && video.replaceThumbnailHalf(image);

      await this.storage.store({
        data: input.file.data,
        mimeType: input.file.mimeType,
        id: image.url,
      });

      await this.uow.do(async () => {
        await this.videoRepo.update(video);
      });
    } catch (error) {
      if (
        error instanceof InvalidMediaFileSizeError ||
        error instanceof InvalidMediaFileMimeTypeError
      ) {
        throw new EntityValidationError([{ [input.field]: [error.message] }]);
      }

      throw error;
    }
  }
}
