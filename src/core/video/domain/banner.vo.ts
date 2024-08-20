import { MediaFileValidator } from '@core/shared/domain/validators/media-file.validator';
import { ImageMedia } from '../../shared/domain/value-objects/image-media.vo';
import { VideoId } from './video.aggregate';

export class Banner extends ImageMedia {
  static maxSize = 1024 * 1024 * 2; // 2MB
  static mimeTypes = ['image/jpeg', 'image/png', 'image/gif'];

  static createFromFile({
    rawName,
    mimeType,
    size,
    videoId,
  }: {
    rawName: string;
    mimeType: string;
    size: number;
    videoId: VideoId;
  }) {
    const mediaFileValidator = new MediaFileValidator(
      Banner.maxSize,
      Banner.mimeTypes,
    );

    const { name } = mediaFileValidator.validate({
      rawName,
      mimeType,
      size,
    });

    return new Banner({
      name: `${videoId.id}-${name}`,
      location: `videos/${videoId.id}/images`,
    });
  }
}
