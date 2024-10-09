import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { ProcessAudioVideoMediasInput } from '../use-cases/process-audio-video-medias/process-audio-video-medias.input';
import { AudioVideoMediaStatus } from '@core/shared/domain/value-objects/audio-video-media.vo';
import { Injectable, UseFilters, ValidationPipe } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { ProcessAudioVideoMediasUseCase } from '../use-cases/process-audio-video-medias/process-audio-video-medias.use-case';
import { RabbitmqConsumeErrorFilter } from 'src/nest-modules/rabbitmq/filters/rabbitmq-consume-error.filter';

@UseFilters(RabbitmqConsumeErrorFilter)
@Injectable()
export class VideoMediaConvertedConsumer {
  // Me must use moduleRef.resolve because the use case has a dependency that is scoped request. It works for SCOPED and TRANSIENT.
  constructor(private moduleRef: ModuleRef) {}

  @RabbitSubscribe({
    exchange: 'direct.delayed',
    routingKey: 'videos.convert',
    queue: 'video-converted',
    allowNonJsonMessages: true,
    queueOptions: {
      deadLetterExchange: 'dlx.exchange',
      deadLetterRoutingKey: 'videos.convert',
    },
  })
  async onProcessVideo(msg: {
    video: {
      resourceId: string;
      encodedVideoFolder: string;
      status: 'completed' | 'failed';
    };
  }) {
    const resourceId = `${msg.video?.resourceId}`;
    const [videoId, field] = resourceId.split('.');

    const input = new ProcessAudioVideoMediasInput({
      videoId,
      field: field as 'trailer' | 'video',
      encodedLocation: msg.video?.encodedVideoFolder,
      status: msg.video?.status as AudioVideoMediaStatus,
    });

    await new ValidationPipe({
      errorHttpStatusCode: 422,
    }).transform(input, {
      metatype: ProcessAudioVideoMediasInput,
      type: 'body',
    });

    const useCase = await this.moduleRef.resolve(
      ProcessAudioVideoMediasUseCase,
    );
    await useCase.execute(input);
  }
}
