import {
  BelongsToMany,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { CategoryModel } from '../../../../category/infra/db/sequelize/category.model';
import { GenreModel } from '../../../../genre/infra/db/sequelize/genre.model';
import { ImageMediaModel } from './image-media.model';
import { AudioVideoMediaModel } from './audio-video-media.model';
import { Rating } from '@core/video/domain/video.aggregate';
import { CastMemberModel } from '@core/cast-member/infra/db/sequelize/cast-member.model';

export type VideoModelProps = {
  videoId: string;
  title: string;
  description: string;
  yearLaunched: number;
  duration: number;
  rating: Rating;
  isOpened: boolean;
  isPublished: boolean;
  createdAt: Date;

  imageMedias: ImageMediaModel[];
  audioVideoMedias: AudioVideoMediaModel[];

  categoryIds?: VideoCategoryModel[];
  categories?: CategoryModel[];
  genreIds?: VideoGenreModel[];
  genres?: CategoryModel[];
  castMemberIds?: VideoCastMemberModel[];
  castMembers?: CastMemberModel[];
};

@Table({ tableName: 'videos', timestamps: false })
export class VideoModel extends Model<VideoModelProps> {
  @PrimaryKey
  @Column({ type: DataType.UUID })
  declare videoId: string;

  @Column({ allowNull: false, type: DataType.STRING(255) })
  declare title: string;

  @Column({ allowNull: false, type: DataType.TEXT })
  declare description: string;

  @Column({ allowNull: false, type: DataType.SMALLINT })
  declare yearLaunched: number;

  @Column({ allowNull: false, type: DataType.SMALLINT })
  declare duration: number;

  @Column({
    allowNull: false,
    type: DataType.ENUM(...Object.values(Rating)),
  })
  declare rating: Rating;

  @Column({ allowNull: false, type: DataType.BOOLEAN })
  declare isOpened: boolean;

  @Column({ allowNull: false, type: DataType.BOOLEAN })
  declare isPublished: boolean;

  @Column({ allowNull: false, type: DataType.DATE(6) })
  declare createdAt: Date;

  @HasMany(() => ImageMediaModel, 'videoId')
  declare imageMedias: ImageMediaModel[];

  @HasMany(() => AudioVideoMediaModel, 'videoId')
  declare audioVideoMedias: AudioVideoMediaModel[];

  @HasMany(() => VideoCategoryModel, 'videoId')
  declare categoryIds: VideoCategoryModel[];

  @BelongsToMany(() => CategoryModel, () => VideoCategoryModel)
  declare categories: CategoryModel[];

  @HasMany(() => VideoGenreModel, 'videoId')
  declare genreIds: VideoGenreModel[];

  @BelongsToMany(() => GenreModel, () => VideoGenreModel)
  declare genres: GenreModel[];

  @HasMany(() => VideoCastMemberModel, 'videoId')
  declare castMemberIds: VideoCastMemberModel[];

  @BelongsToMany(() => CastMemberModel, () => VideoCastMemberModel)
  declare castMembers: CastMemberModel[];
}

export type VideoCategoryModelProps = {
  videoId: string;
  categoryId: string;
};

@Table({ tableName: 'category_video', timestamps: false })
export class VideoCategoryModel extends Model<VideoCategoryModelProps> {
  @PrimaryKey
  @ForeignKey(() => VideoModel)
  @Column({ type: DataType.UUID })
  declare videoId: string;

  @PrimaryKey
  @ForeignKey(() => CategoryModel)
  @Column({ type: DataType.UUID })
  declare categoryId: string;
}

export type VideoGenreModelProps = {
  videoId: string;
  genreId: string;
};

@Table({ tableName: 'genre_video', timestamps: false })
export class VideoGenreModel extends Model<VideoGenreModelProps> {
  @PrimaryKey
  @ForeignKey(() => VideoModel)
  @Column({ type: DataType.UUID })
  declare videoId: string;

  @PrimaryKey
  @ForeignKey(() => GenreModel)
  @Column({ type: DataType.UUID })
  declare genreId: string;
}

export type VideoCastMemberModelProps = {
  videoId: string;
  castMemberId: string;
};

@Table({ tableName: 'cast_member_video', timestamps: false })
export class VideoCastMemberModel extends Model<VideoCastMemberModelProps> {
  @PrimaryKey
  @ForeignKey(() => VideoModel)
  @Column({ type: DataType.UUID })
  declare videoId: string;

  @PrimaryKey
  @ForeignKey(() => CastMemberModel)
  @Column({ type: DataType.UUID })
  declare castMemberId: string;
}
