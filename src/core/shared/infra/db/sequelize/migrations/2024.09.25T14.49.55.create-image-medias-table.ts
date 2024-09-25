import { MigrationFn } from 'umzug';
import { Sequelize, DataTypes } from 'sequelize';

export const up: MigrationFn<Sequelize> = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().createTable('image_medias', {
    imageMediaId: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING(255),
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

  await sequelize.getQueryInterface().addConstraint('image_medias', {
    fields: ['videoId'],
    type: 'foreign key',
    name: 'image_medias_videoId',
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
    .removeConstraint('image_medias', 'image_medias_videoId');

  await sequelize.getQueryInterface().dropTable('image_medias');
};
