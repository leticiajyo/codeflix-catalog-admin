import { IIntegrationEventHandler } from '@core/shared/application/event-handler.interface';
import { AudioVideoMediaUploadedIntegrationEvent } from '@core/video/domain/events/audio-video-media-replaced.event';
import { OnEvent } from '@nestjs/event-emitter';

export class PublishVideoMediaReplacedInQueueHandler
  implements IIntegrationEventHandler
{
  @OnEvent(AudioVideoMediaUploadedIntegrationEvent.name)
  async handle(event: AudioVideoMediaUploadedIntegrationEvent): Promise<void> {
    console.log(event);
  }
}
