import { MediaFileValidator } from '../../shared/domain/validators/media-file.validator';
import { ImageMedia } from '../../shared/domain/value-objects/image-media.vo';
import { VideoId } from './video.aggregate';

export class Thumbnail extends ImageMedia {
  static maxSize = 1024 * 1024 * 2;
  static mimeTypes = ['image/jpeg', 'image/png'];

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
      Thumbnail.maxSize,
      Thumbnail.mimeTypes,
    );

    const { name } = mediaFileValidator.validate({
      rawName,
      mimeType,
      size,
    });

    return new Thumbnail({
      name: `${videoId.id}-${name}`,
      location: `videos/${videoId.id}/images`,
    });
  }
}
