import { MigrationFn } from 'umzug';
import { Sequelize, DataTypes } from 'sequelize';

export const up: MigrationFn<Sequelize> = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().createTable('category_video', {
    videoId: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
    },
    categoryId: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
    },
  });

  await sequelize.getQueryInterface().addConstraint('category_video', {
    fields: ['videoId'],
    type: 'foreign key',
    name: 'category_video_videoId',
    references: {
      table: 'videos',
      field: 'videoId',
    },
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
  });

  await sequelize.getQueryInterface().addConstraint('category_video', {
    fields: ['categoryId'],
    type: 'foreign key',
    name: 'category_video_categoryId',
    references: {
      table: 'categories',
      field: 'categoryId',
    },
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
  });
};

export const down: MigrationFn<Sequelize> = async ({ context: sequelize }) => {
  await sequelize
    .getQueryInterface()
    .removeConstraint('category_video', 'category_video_videoId');

  await sequelize
    .getQueryInterface()
    .removeConstraint('category_video', 'category_video_categoryId');

  await sequelize.getQueryInterface().dropTable('category_video');
};
