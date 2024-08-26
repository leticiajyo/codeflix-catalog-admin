import { MediaFileValidator } from '../../shared/domain/validators/media-file.validator';
import {
  VideoAudioMedia,
  VideoAudioMediaStatus,
} from '../../shared/domain/value-objects/audio-video-media.vo';
import { VideoId } from './video.aggregate';

export class Trailer extends VideoAudioMedia {
  static maxSize = 1024 * 1024 * 500; // 50MB
  static mimeTypes = ['video/mp4'];

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
      Trailer.maxSize,
      Trailer.mimeTypes,
    );

    const { name } = mediaFileValidator.validate({
      rawName,
      mimeType,
      size,
    });

    return Trailer.create({
      name: `${videoId.id}-${name}`,
      rawLocation: `videos/${videoId.id}/videos`,
    });
  }

  static create({ name, rawLocation }) {
    return new Trailer({
      name,
      rawLocation,
      status: VideoAudioMediaStatus.PENDING,
    });
  }

  process() {
    return new Trailer({
      name: this.name,
      rawLocation: this.rawLocation,
      encodedLocation: this.encodedLocation!,
      status: VideoAudioMediaStatus.PROCESSING,
    });
  }

  complete(encodedLocation: string) {
    return new Trailer({
      name: this.name,
      rawLocation: this.rawLocation,
      encodedLocation,
      status: VideoAudioMediaStatus.COMPLETED,
    });
  }

  fail() {
    return new Trailer({
      name: this.name,
      rawLocation: this.rawLocation,
      encodedLocation: this.encodedLocation!,
      status: VideoAudioMediaStatus.FAILED,
    });
  }
}
