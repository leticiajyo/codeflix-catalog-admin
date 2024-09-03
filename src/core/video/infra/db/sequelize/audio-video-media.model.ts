import {
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { AudioVideoMediaStatus } from '../../../../shared/domain/value-objects/audio-video-media.vo';
import { Uuid } from '../../../../shared/domain/value-objects/uuid.vo';
import { VideoModel } from './video.model';

export enum AudioVideoMediaRelatedField {
  TRAILER = 'trailer',
  VIDEO = 'video',
}

export class AudioVideoMediaModelProps {
  audioVideoMediaId: string;
  name: string;
  rawLocation: string;
  encodedLocation: string | null;
  status: AudioVideoMediaStatus;
  videoId: string;
  videoRelatedField: AudioVideoMediaRelatedField;
}

@Table({
  tableName: 'audio_video_medias',
  timestamps: false,
  indexes: [{ fields: ['videoId', 'videoRelatedField'], unique: true }],
})
export class AudioVideoMediaModel extends Model<AudioVideoMediaModelProps> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: () => new Uuid().id })
  declare audioVideoMediaId: string;

  @Column({ allowNull: false, type: DataType.STRING(255) })
  declare name: string;

  @Column({ allowNull: false, type: DataType.STRING(255) })
  declare rawLocation: string;

  @Column({ allowNull: true, type: DataType.STRING(255) })
  declare encodedLocation: string | null;

  @Column({
    allowNull: false,
    type: DataType.ENUM(
      AudioVideoMediaStatus.PENDING,
      AudioVideoMediaStatus.PROCESSING,
      AudioVideoMediaStatus.COMPLETED,
      AudioVideoMediaStatus.FAILED,
    ),
  })
  declare status: AudioVideoMediaStatus;

  @ForeignKey(() => VideoModel)
  @Column({ allowNull: false, type: DataType.UUID })
  declare videoId: string;

  @Column({ allowNull: false, type: DataType.STRING(20) })
  declare videoRelatedField: AudioVideoMediaRelatedField;
}
