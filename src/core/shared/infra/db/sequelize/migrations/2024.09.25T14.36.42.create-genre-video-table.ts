import { MigrationFn } from 'umzug';
import { Sequelize, DataTypes } from 'sequelize';

export const up: MigrationFn<Sequelize> = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().createTable('genre_video', {
    videoId: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
    },
    genreId: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
    },
  });

  await sequelize.getQueryInterface().addConstraint('genre_video', {
    fields: ['videoId'],
    type: 'foreign key',
    name: 'genre_video_videoId',
    references: {
      table: 'videos',
      field: 'videoId',
    },
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
  });

  await sequelize.getQueryInterface().addConstraint('genre_video', {
    fields: ['genreId'],
    type: 'foreign key',
    name: 'genre_video_genreId',
    references: {
      table: 'genres',
      field: 'genreId',
    },
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
  });
};
export const down: MigrationFn<Sequelize> = async ({ context: sequelize }) => {
  await sequelize
    .getQueryInterface()
    .removeConstraint('genre_video', 'genre_video_videoId');

  await sequelize
    .getQueryInterface()
    .removeConstraint('genre_video', 'genre_video_genreId');

  await sequelize.getQueryInterface().dropTable('genre_video');
};
