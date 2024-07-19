import { CastMemberType } from '@core/cast-member/domain/cast-member.aggregate';
import {
  Table,
  PrimaryKey,
  Column,
  DataType,
  Model,
} from 'sequelize-typescript';

export type CastMemberModelProps = {
  castMemberId: string;
  name: string;
  type: CastMemberType;
  createdAt: Date;
};

@Table({ tableName: 'cast_members', timestamps: false })
export class CastMemberModel extends Model<CastMemberModelProps> {
  @PrimaryKey
  @Column({ type: DataType.UUID })
  declare castMemberId: string;

  @Column({ allowNull: false, type: DataType.STRING(255) })
  declare name: string;

  @Column({
    allowNull: false,
    type: DataType.SMALLINT,
  })
  declare type: CastMemberType;

  @Column({ allowNull: false, type: DataType.DATE(3) })
  declare createdAt: Date;
}
