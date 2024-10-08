import { AudioVideoMediaUploadedIntegrationEvent } from '@core/video/domain/events/audio-video-media-replaced.event';

export type RabbitMQEventsConfig = {
  [key: string]: {
    exchange: string;
    routingKey: string;
  };
};

export const RABBITMQ_EVENTS_CONFIG: RabbitMQEventsConfig = {
  [AudioVideoMediaUploadedIntegrationEvent.name]: {
    exchange: 'amq.direct',
    routingKey: 'videos.upload',
  },
};
