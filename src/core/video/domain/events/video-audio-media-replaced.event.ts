import { Uuid } from '@core/shared/domain/value-objects/uuid.vo';
import { IDomainEvent } from '../../../shared/domain/events/domain-event.interface';
import { Trailer } from '../trailer.vo';
import { VideoMedia } from '../video-media.vo';
import { VideoId } from '../video.aggregate';

type VideoAudioMediaReplacedProps = {
  aggregateId: VideoId;
  media: Trailer | VideoMedia;
  mediaType: 'trailer' | 'video';
};

export class VideoAudioMediaReplaced implements IDomainEvent {
  aggregateId: Uuid;
  occurredOn: Date;
  eventVersion: number;

  readonly media: Trailer | VideoMedia;
  readonly mediaType: 'trailer' | 'video';

  constructor(props: VideoAudioMediaReplacedProps) {
    this.aggregateId = props.aggregateId;
    this.media = props.media;
    this.mediaType = props.mediaType;
    this.occurredOn = new Date();
    this.eventVersion = 1;
  }
}
