import { MigrationFn } from 'umzug';
import { Sequelize, DataTypes } from 'sequelize';
import { AudioVideoMediaStatus } from '@core/shared/domain/value-objects/audio-video-media.vo';

export const up: MigrationFn<Sequelize> = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().createTable('audio_video_medias', {
    audioVideoMediaId: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    rawLocation: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    encodedLocation: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(AudioVideoMediaStatus)),
      allowNull: false,
    },
    videoId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    videoRelatedField: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
  });

  await sequelize.getQueryInterface().addConstraint('audio_video_medias', {
    fields: ['videoId'],
    type: 'foreign key',
    name: 'audio_video_medias_videoId',
    references: {
      table: 'videos',
      field: 'videoId',
    },
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
  });
};
export const down: MigrationFn<Sequelize> = async ({ context: sequelize }) => {
  await sequelize
    .getQueryInterface()
    .removeConstraint('audio_video_medias', 'audio_video_medias_videoId');

  await sequelize.getQueryInterface().dropTable('audio_video_medias');
};
