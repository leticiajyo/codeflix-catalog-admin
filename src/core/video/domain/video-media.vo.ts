import { MediaFileValidator } from '../../shared/domain/validators/media-file.validator';
import {
  VideoAudioMedia as VideoAudioMedia,
  VideoAudioMediaStatus,
} from '../../shared/domain/value-objects/audio-video-media.vo';
import { VideoId } from './video.aggregate';

export class VideoMedia extends VideoAudioMedia {
  static maxSize = 1024 * 1024 * 1024 * 50; // 50GB
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
      VideoMedia.maxSize,
      VideoMedia.mimeTypes,
    );

    const { name } = mediaFileValidator.validate({
      rawName,
      mimeType,
      size,
    });

    return VideoMedia.create({
      name: `${videoId.id}-${name}`,
      rawLocation: `videos/${videoId.id}/videos`,
    });
  }

  static create({ name, rawLocation }) {
    return new VideoMedia({
      name,
      rawLocation,
      status: VideoAudioMediaStatus.PENDING,
    });
  }

  process() {
    return new VideoMedia({
      name: this.name,
      rawLocation: this.rawLocation,
      encodedLocation: this.encodedLocation!,
      status: VideoAudioMediaStatus.PROCESSING,
    });
  }

  complete(encodedLocation: string) {
    return new VideoMedia({
      name: this.name,
      rawLocation: this.rawLocation,
      encodedLocation,
      status: VideoAudioMediaStatus.COMPLETED,
    });
  }

  fail() {
    return new VideoMedia({
      name: this.name,
      rawLocation: this.rawLocation,
      encodedLocation: this.encodedLocation!,
      status: VideoAudioMediaStatus.FAILED,
    });
  }
}
