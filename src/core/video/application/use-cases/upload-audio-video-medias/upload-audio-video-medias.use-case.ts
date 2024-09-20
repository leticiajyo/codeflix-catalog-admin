import { IStorage } from '@core/shared/application/storage.interface';
import { IUseCase } from '@core/shared/application/use-case.interface';
import { IUnitOfWork } from '@core/shared/domain/repository/unit-of-work.interface';
import { EntityValidationError } from '@core/shared/domain/validators/validation.error';
import { Trailer } from '@core/video/domain/trailer.vo';
import { VideoMedia } from '@core/video/domain/video-media.vo';
import { VideoId, Video } from '@core/video/domain/video.aggregate';
import { IVideoRepository } from '@core/video/domain/video.repository';
import { UploadAudioVideoMediaInput } from './upload-audio-video-medias.input';
import { NotFoundError } from '@core/shared/domain/errors/not-found.error';
import {
  InvalidMediaFileSizeError,
  InvalidMediaFileMimeTypeError,
} from '@core/shared/domain/validators/media-file.validator';

export type UploadAudioVideoMediaOutput = void;

export class UploadAudioVideoMediasUseCase
  implements IUseCase<UploadAudioVideoMediaInput, UploadAudioVideoMediaOutput>
{
  constructor(
    private uow: IUnitOfWork,
    private videoRepo: IVideoRepository,
    private storage: IStorage,
  ) {}

  async execute(
    input: UploadAudioVideoMediaInput,
  ): Promise<UploadAudioVideoMediaOutput> {
    const video = await this.videoRepo.findById(new VideoId(input.videoId));

    if (!video) {
      throw new NotFoundError(input.videoId, Video);
    }

    const audioVideoMediaMap = {
      trailer: Trailer,
      video: VideoMedia,
    };

    try {
      const audioVideoMedia = audioVideoMediaMap[input.field].createFromFile({
        ...input.file,
        videoId: video.videoId,
      });

      audioVideoMedia instanceof Trailer &&
        video.replaceTrailer(audioVideoMedia);
      audioVideoMedia instanceof VideoMedia &&
        video.replaceVideo(audioVideoMedia);

      await this.storage.store({
        data: input.file.data,
        id: audioVideoMedia.rawUrl,
        mimeType: input.file.mimeType,
      });

      await this.uow.do(async () => {
        return this.videoRepo.update(video);
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
