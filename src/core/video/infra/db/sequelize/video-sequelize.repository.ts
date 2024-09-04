import { InvalidArgumentError } from '../../../../shared/domain/errors/invalid-argument.error';
import { NotFoundError } from '../../../../shared/domain/errors/not-found.error';
import { UnitOfWorkSequelize } from '../../../../shared/infra/db/sequelize/unit-of-work-sequelize';
import { Video, VideoId } from '../../../domain/video.aggregate';
import {
  IVideoRepository,
  VideoSearchParams,
  VideoSearchResult,
} from '../../../domain/video.repository';
import { VideoModel } from './video.model';
import { literal, Op } from 'sequelize';
import { VideoModelMapper } from './video.mapper';

export class VideoSequelizeRepository implements IVideoRepository {
  sortableFields: string[] = ['title', 'createdAt'];

  relationsInclude = [
    'categoryIds',
    'genreIds',
    'castMemberIds',
    'imageMedias',
    'audioVideoMedias',
  ];

  constructor(
    private videoModel: typeof VideoModel,
    private uow: UnitOfWorkSequelize,
  ) {}

  async insert(entity: Video): Promise<void> {
    const model = VideoModelMapper.toModelProps(entity);
    await this.videoModel.create(model, {
      include: this.relationsInclude,
      transaction: this.uow.getTransaction(),
    });
  }

  async bulkInsert(entities: Video[]): Promise<void> {
    const models = entities.map((e) => VideoModelMapper.toModelProps(e));
    await this.videoModel.bulkCreate(models, {
      include: this.relationsInclude,
      transaction: this.uow.getTransaction(),
    });
  }

  async findById(entityId: VideoId): Promise<Video | null> {
    const model = await this.videoModel.findByPk(entityId.id, {
      include: this.relationsInclude,
      transaction: this.uow.getTransaction(),
    });
    return model ? VideoModelMapper.toEntity(model) : null;
  }

  async findAll(): Promise<Video[]> {
    const models = await this.videoModel.findAll({
      include: this.relationsInclude,
      transaction: this.uow.getTransaction(),
    });
    return models.map((m) => VideoModelMapper.toEntity(m));
  }

  async findByIds(ids: VideoId[]): Promise<Video[]> {
    const models = await this.videoModel.findAll({
      where: {
        videoId: {
          [Op.in]: ids.map((id) => id.id),
        },
      },
      include: this.relationsInclude,
      transaction: this.uow.getTransaction(),
    });
    return models.map((m) => VideoModelMapper.toEntity(m));
  }

  async existsById(
    ids: VideoId[],
  ): Promise<{ exists: VideoId[]; notExists: VideoId[] }> {
    if (!ids.length) {
      throw new InvalidArgumentError(
        'ids must be an array with at least one element',
      );
    }

    const existsVideoModels = await this.videoModel.findAll({
      attributes: ['videoId'],
      where: {
        videoId: {
          [Op.in]: ids.map((id) => id.id),
        },
      },
      transaction: this.uow.getTransaction(),
    });
    const existsVideoIds = existsVideoModels.map((m) => new VideoId(m.videoId));
    const notExistsVideoIds = ids.filter(
      (id) => !existsVideoIds.some((e) => e.equals(id)),
    );
    return {
      exists: existsVideoIds,
      notExists: notExistsVideoIds,
    };
  }

  async update(entity: Video): Promise<void> {
    const model = await this.videoModel.findByPk(entity.videoId.id, {
      include: this.relationsInclude,
      transaction: this.uow.getTransaction(),
    });

    if (!model) {
      throw new NotFoundError(entity.videoId.id, this.getEntity());
    }

    await Promise.all([
      ...model.imageMedias.map((i) =>
        i.destroy({ transaction: this.uow.getTransaction() }),
      ),
      ...model.audioVideoMedias.map((i) =>
        i.destroy({
          transaction: this.uow.getTransaction(),
        }),
      ),
      model.$remove(
        'categories',
        model.categoryIds.map((c) => c.categoryId),
        {
          transaction: this.uow.getTransaction(),
        },
      ),
      model.$remove(
        'genres',
        model.genreIds.map((c) => c.genreId),
        {
          transaction: this.uow.getTransaction(),
        },
      ),
      model.$remove(
        'castMembers',
        model.castMemberIds.map((c) => c.castMemberId),
        {
          transaction: this.uow.getTransaction(),
        },
      ),
    ]);

    const {
      categoryIds,
      genreIds,
      castMemberIds,
      imageMedias,
      audioVideoMedias,
      ...props
    } = VideoModelMapper.toModelProps(entity);
    await this.videoModel.update(props, {
      where: { videoId: entity.videoId.id },
      transaction: this.uow.getTransaction(),
    });

    await Promise.all([
      ...imageMedias.map((i) =>
        model.$create('imageMedia', i.toJSON(), {
          transaction: this.uow.getTransaction(),
        }),
      ),
      ...audioVideoMedias.map((i) =>
        model.$create('audioVideoMedia', i.toJSON(), {
          transaction: this.uow.getTransaction(),
        }),
      ),
      model.$add(
        'categories',
        categoryIds.map((c) => c.categoryId),
        {
          transaction: this.uow.getTransaction(),
        },
      ),
      model.$add(
        'genres',
        genreIds.map((c) => c.genreId),
        {
          transaction: this.uow.getTransaction(),
        },
      ),
      model.$add(
        'castMembers',
        castMemberIds.map((c) => c.castMemberId),
        {
          transaction: this.uow.getTransaction(),
        },
      ),
    ]);
  }

  async delete(id: VideoId): Promise<void> {
    const videoCategoryRelation =
      this.videoModel.associations.categoryIds.target;
    const videoGenreRelation = this.videoModel.associations.genreIds.target;
    const videoCastMemberRelation =
      this.videoModel.associations.castMemberIds.target;
    const imageMediaModel = this.videoModel.associations.imageMedias.target;
    const audioVideoMediaModel =
      this.videoModel.associations.audioVideoMedias.target;

    await Promise.all([
      videoCategoryRelation.destroy({
        where: { videoId: id.id },
        transaction: this.uow.getTransaction(),
      }),
      videoGenreRelation.destroy({
        where: { videoId: id.id },
        transaction: this.uow.getTransaction(),
      }),
      videoCastMemberRelation.destroy({
        where: { videoId: id.id },
        transaction: this.uow.getTransaction(),
      }),
      imageMediaModel.destroy({
        where: { videoId: id.id },
        transaction: this.uow.getTransaction(),
      }),
      audioVideoMediaModel.destroy({
        where: { videoId: id.id },
        transaction: this.uow.getTransaction(),
      }),
    ]);
    const affectedRows = await this.videoModel.destroy({
      where: { videoId: id.id },
      transaction: this.uow.getTransaction(),
    });

    if (affectedRows !== 1) {
      throw new NotFoundError(id.id, this.getEntity());
    }
  }

  async search(props: VideoSearchParams): Promise<VideoSearchResult> {
    const offset = (props.page - 1) * props.perPage;
    const limit = props.perPage;

    const videoTableName = this.videoModel.getTableName();
    const videoCategoryRelation =
      this.videoModel.associations.categoryIds.target;
    const videoCategoryTableName = videoCategoryRelation.getTableName();
    const videoGenreRelation = this.videoModel.associations.genreIds.target;
    const videoGenreTableName = videoGenreRelation.getTableName();
    const videoCastMemberRelation =
      this.videoModel.associations.castMemberIds.target;
    const videoCastMemberTableName = videoCastMemberRelation.getTableName();
    const videoAlias = this.videoModel.name;

    const wheres: any[] = [];

    if (
      props.filter &&
      (props.filter.title ||
        props.filter.categoryIds ||
        props.filter.genreIds ||
        props.filter.castMemberIds)
    ) {
      if (props.filter.title) {
        wheres.push({
          field: 'title',
          value: `%${props.filter.title}%`,
          get condition() {
            return {
              [this.field]: {
                [Op.like]: this.value,
              },
            };
          },
          rawCondition: `${videoAlias}.title LIKE :title`,
        });
      }

      if (props.filter.categoryIds) {
        wheres.push({
          field: 'categoryIds',
          value: props.filter.categoryIds.map((c) => c.id),
          get condition() {
            return {
              ['$categoryIds.categoryId$']: {
                [Op.in]: this.value,
              },
            };
          },
          rawCondition: `${videoCategoryTableName}.categoryId IN (:categoryIds)`,
        });
      }

      if (props.filter.genreIds) {
        wheres.push({
          field: 'genreIds',
          value: props.filter.genreIds.map((c) => c.id),
          get condition() {
            return {
              ['$genreIds.genreId$']: {
                [Op.in]: this.value,
              },
            };
          },
          rawCondition: `${videoGenreTableName}.genreId IN (:genreIds)`,
        });
      }

      if (props.filter.castMemberIds) {
        wheres.push({
          field: 'castMemberIds',
          value: props.filter.castMemberIds.map((c) => c.id),
          get condition() {
            return {
              ['$castMemberIds.castMemberId$']: {
                [Op.in]: this.value,
              },
            };
          },
          rawCondition: `${videoCastMemberTableName}.castMemberId IN (:castMemberIds)`,
        });
      }
    }

    const orderBy =
      props.sort && this.sortableFields.includes(props.sort)
        ? `${this.videoModel.name}.\`${props.sort}\` ${props.sortDirection}`
        : `${videoAlias}.\`createdAt\` DESC`;

    const count = await this.videoModel.count({
      distinct: true,
      include: [
        props.filter?.categoryIds && 'categoryIds',
        props.filter?.genreIds && 'genreIds',
        props.filter?.castMemberIds && 'castMemberIds',
      ].filter((i) => i) as string[],
      where: wheres.length ? { [Op.and]: wheres.map((w) => w.condition) } : {},
      transaction: this.uow.getTransaction(),
    });

    const columnOrder = orderBy.replace('binary', '').trim().split(' ')[0];

    const query = [
      'SELECT',
      `DISTINCT ${videoAlias}.\`videoId\`,${columnOrder} FROM ${videoTableName} as ${videoAlias}`,
      props.filter?.categoryIds
        ? `INNER JOIN ${videoCategoryTableName} ON ${videoAlias}.\`videoId\` = ${videoCategoryTableName}.\`videoId\``
        : '',
      props.filter?.genreIds
        ? `INNER JOIN ${videoGenreTableName} ON ${videoAlias}.\`videoId\` = ${videoGenreTableName}.\`videoId\``
        : '',
      props.filter?.castMemberIds
        ? `INNER JOIN ${videoCastMemberTableName} ON ${videoAlias}.\`videoId\` = ${videoCastMemberTableName}.\`videoId\``
        : '',
      wheres.length
        ? `WHERE ${wheres.map((w) => w.rawCondition).join(' AND ')}`
        : '',
      `ORDER BY ${orderBy}`,
      `LIMIT ${limit}`,
      `OFFSET ${offset}`,
    ];

    const [idsResult] = await this.videoModel.sequelize!.query(
      query.join(' '),
      {
        replacements: wheres.reduce(
          (acc, w) => ({ ...acc, [w.field]: w.value }),
          {},
        ),
        transaction: this.uow.getTransaction(),
      },
    );

    const models = await this.videoModel.findAll({
      where: {
        videoId: {
          [Op.in]: idsResult.map(
            (id: { videoId: string }) => id.videoId,
          ) as string[],
        },
      },
      include: this.relationsInclude,
      order: literal(orderBy),
      transaction: this.uow.getTransaction(),
    });

    return new VideoSearchResult({
      items: models.map((m) => VideoModelMapper.toEntity(m)),
      currentPage: props.page,
      perPage: props.perPage,
      total: count,
    });
  }

  getEntity(): new (...args: any[]) => Video {
    return Video;
  }
}
