import { AudioVideoMediaReplaced } from '@core/video/domain/events/video-audio-media-replaced.event';

export type RabbitMQEventsConfig = {
  [key: string]: {
    exchange: string;
    routingKey: string;
  };
};

export const RABBITMQ_EVENTS_CONFIG: RabbitMQEventsConfig = {
  [AudioVideoMediaReplaced.name]: {
    exchange: 'amq.direct',
    routingKey: AudioVideoMediaReplaced.name,
  },
};
