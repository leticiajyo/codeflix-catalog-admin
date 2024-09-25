import { MigrationFn } from 'umzug';
import { Sequelize, DataTypes } from 'sequelize';
import { Rating } from '@core/video/domain/video.aggregate';

export const up: MigrationFn<Sequelize> = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().createTable('videos', {
    videoId: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    yearLaunched: {
      type: DataTypes.SMALLINT,
      allowNull: false,
    },
    duration: {
      type: DataTypes.SMALLINT,
      allowNull: false,
    },
    rating: {
      type: DataTypes.ENUM(...Object.values(Rating)),
      allowNull: false,
    },
    isOpened: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    isPublished: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE(3),
      allowNull: false,
    },
  });
};

export const down: MigrationFn<Sequelize> = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().dropTable('videos');
};
