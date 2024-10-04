import { Uuid } from '@core/shared/domain/value-objects/uuid.vo';
import {
  IDomainEvent,
  IIntegrationEvent,
} from '../../../shared/domain/events/event.interface';
import { Trailer } from '../trailer.vo';
import { VideoMedia } from '../video-media.vo';
import { VideoId } from '../video.aggregate';

type AudioVideoMediaReplacedProps = {
  aggregateId: VideoId;
  media: Trailer | VideoMedia;
  mediaType: 'trailer' | 'video';
};

export class AudioVideoMediaReplaced implements IDomainEvent {
  aggregateId: Uuid;
  occurredOn: Date;
  eventVersion: number;

  readonly media: Trailer | VideoMedia;
  readonly mediaType: 'trailer' | 'video';

  constructor(props: AudioVideoMediaReplacedProps) {
    this.aggregateId = props.aggregateId;
    this.media = props.media;
    this.mediaType = props.mediaType;
    this.occurredOn = new Date();
    this.eventVersion = 1;
  }

  getIntegrationEvent(): AudioVideoMediaUploadedIntegrationEvent {
    return new AudioVideoMediaUploadedIntegrationEvent(this);
  }
}

export class AudioVideoMediaUploadedIntegrationEvent
  implements IIntegrationEvent
{
  occurredOn: Date;
  eventVersion: number;
  eventName: string;
  payload: any;

  constructor(event: AudioVideoMediaReplaced) {
    this.occurredOn = event.occurredOn;
    this.eventVersion = event.eventVersion;
    this.eventName = this.constructor.name;
    this.payload = {
      resourceId: `${event.aggregateId.id}.${event.mediaType}`,
      filePath: event.media.rawUrl,
    };
  }
}
