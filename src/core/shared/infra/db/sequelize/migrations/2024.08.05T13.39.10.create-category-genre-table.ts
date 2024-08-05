import { MigrationFn } from 'umzug';
import { Sequelize, DataTypes } from 'sequelize';

export const up: MigrationFn<Sequelize> = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().createTable('category_genre', {
    genreId: {
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

  await sequelize.getQueryInterface().addConstraint('category_genre', {
    fields: ['genreId'],
    type: 'foreign key',
    name: 'category_genre_genreId',
    references: {
      table: 'genres',
      field: 'genreId',
    },
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
  });

  await sequelize.getQueryInterface().addConstraint('category_genre', {
    fields: ['categoryId'],
    type: 'foreign key',
    name: 'category_genre_categoryId',
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
    .removeConstraint('category_genre', 'category_genre_genreId');

  await sequelize
    .getQueryInterface()
    .removeConstraint('category_genre', 'category_genre_categoryId');

  await sequelize.getQueryInterface().dropTable('category_genre');
};
