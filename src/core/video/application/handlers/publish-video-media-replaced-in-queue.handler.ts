import { IDomainEventHandler } from '@core/shared/application/domain-event-handler.interface';
import { AudioVideoMediaReplaced } from '@core/video/domain/events/video-audio-media-replaced.event';
import { OnEvent } from '@nestjs/event-emitter';

export class PublishVideoMediaReplacedInQueueHandler
  implements IDomainEventHandler
{
  @OnEvent(AudioVideoMediaReplaced.name)
  async handle(event: AudioVideoMediaReplaced): Promise<void> {
    console.log(event);
  }
}
