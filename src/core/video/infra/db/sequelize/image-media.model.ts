import {
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { Uuid } from '../../../../shared/domain/value-objects/uuid.vo';
import { VideoModel } from './video.model';

export enum ImageMediaRelatedField {
  BANNER = 'banner',
  THUMBNAIL = 'thumbnail',
  THUMBNAIL_HALF = 'thumbnail_half',
}

export type ImageMediaModelProps = {
  imageMediaId: string;
  name: string;
  location: string;
  videoId: string;
  videoRelatedField: ImageMediaRelatedField;
};

@Table({
  tableName: 'image_medias',
  timestamps: false,
  indexes: [{ fields: ['videoId', 'videoRelatedField'], unique: true }],
})
export class ImageMediaModel extends Model<ImageMediaModelProps> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: () => new Uuid().id })
  declare imageMediaId: string;

  @Column({ allowNull: false, type: DataType.STRING(255) })
  declare name: string;

  @Column({ allowNull: false, type: DataType.STRING(255) })
  declare location: string;

  @ForeignKey(() => VideoModel)
  @Column({ allowNull: false, type: DataType.UUID })
  declare videoId: string;

  @Column({ allowNull: false, type: DataType.STRING(20) })
  declare videoRelatedField: ImageMediaRelatedField;
}
