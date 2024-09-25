import { MigrationFn } from 'umzug';
import { Sequelize, DataTypes } from 'sequelize';

export const up: MigrationFn<Sequelize> = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().createTable('cast_member_video', {
    videoId: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
    },
    castMemberId: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
    },
  });

  await sequelize.getQueryInterface().addConstraint('cast_member_video', {
    fields: ['videoId'],
    type: 'foreign key',
    name: 'cast_member_video_videoId',
    references: {
      table: 'videos',
      field: 'videoId',
    },
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
  });

  await sequelize.getQueryInterface().addConstraint('cast_member_video', {
    fields: ['castMemberId'],
    type: 'foreign key',
    name: 'cast_member_video_castMemberId',
    references: {
      table: 'cast_members',
      field: 'castMemberId',
    },
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
  });
};

export const down: MigrationFn<Sequelize> = async ({ context: sequelize }) => {
  await sequelize
    .getQueryInterface()
    .removeConstraint('cast_member_video', 'cast_member_video_videoId');

  await sequelize
    .getQueryInterface()
    .removeConstraint('cast_member_video', 'cast_member_video_castMemberId');

  await sequelize.getQueryInterface().dropTable('cast_member_video');
};
