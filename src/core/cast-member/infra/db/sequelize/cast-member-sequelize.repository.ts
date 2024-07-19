import { literal, Op } from 'sequelize';
import {
  CastMember,
  CastMemberId,
} from '../../../domain/cast-member.aggregate';
import { SortDirection } from '../../../../shared/domain/repository/search-params';
import { NotFoundError } from '../../../../shared/domain/errors/not-found.error';
import {
  ICastMemberRepository,
  CastMemberSearchParams,
  CastMemberSearchResult,
} from '../../../domain/cast-member.repository';
import { CastMemberModel } from './cast-member.model';
import { CastMemberModelMapper } from './cast-member.mapper';
import { InvalidArgumentError } from '@core/shared/domain/errors/invalid-argument.error';

export class CastMemberSequelizeRepository implements ICastMemberRepository {
  sortableFields: string[] = ['name', 'createdAt'];
  orderBy = {
    mysql: {
      name: (sortDirection: SortDirection) =>
        literal(`binary name ${sortDirection}`),
    },
  };
  constructor(private castMemberModel: typeof CastMemberModel) {}

  async insert(entity: CastMember): Promise<void> {
    const model = CastMemberModelMapper.toModel(entity).toJSON();
    await this.castMemberModel.create(model);
  }

  async bulkInsert(entities: CastMember[]): Promise<void> {
    const models = entities.map((entity) =>
      CastMemberModelMapper.toModel(entity).toJSON(),
    );
    await this.castMemberModel.bulkCreate(models);
  }

  async findById(entityId: CastMemberId): Promise<CastMember | null> {
    const model = await this.castMemberModel.findByPk(entityId.id);
    return model ? CastMemberModelMapper.toEntity(model) : null;
  }

  async findAll(): Promise<CastMember[]> {
    const models = await this.castMemberModel.findAll();
    return models.map((model) => {
      return CastMemberModelMapper.toEntity(model);
    });
  }

  async findByIds(ids: CastMemberId[]): Promise<CastMember[]> {
    const models = await this.castMemberModel.findAll({
      where: {
        castMemberId: {
          [Op.in]: ids.map((id) => id.id),
        },
      },
    });
    return models.map((model) => CastMemberModelMapper.toEntity(model));
  }

  async existsById(
    ids: CastMemberId[],
  ): Promise<{ exists: CastMemberId[]; notExists: CastMemberId[] }> {
    if (!ids.length) {
      throw new InvalidArgumentError(
        'ids must be an array with at least one element',
      );
    }

    const existsCastMemberModels = await this.castMemberModel.findAll({
      attributes: ['castMemberId'],
      where: {
        castMemberId: {
          [Op.in]: ids.map((id) => id.id),
        },
      },
    });
    const existsCastMemberIds = existsCastMemberModels.map(
      (model) => new CastMemberId(model.castMemberId),
    );
    const notExistsCastMemberIds = ids.filter(
      (id) => !existsCastMemberIds.some((e) => e.equals(id)),
    );
    return {
      exists: existsCastMemberIds,
      notExists: notExistsCastMemberIds,
    };
  }

  async update(entity: CastMember): Promise<void> {
    const id = entity.castMemberId.id;

    const modelProps = CastMemberModelMapper.toModel(entity);
    const [affectedRows] = await this.castMemberModel.update(
      modelProps.toJSON(),
      {
        where: { castMemberId: entity.castMemberId.id },
      },
    );

    if (affectedRows !== 1) {
      throw new NotFoundError(id, this.getEntity());
    }
  }

  async delete(entityId: CastMemberId): Promise<void> {
    const id = entityId.id;

    const affectedRows = await this.castMemberModel.destroy({
      where: { castMemberId: id },
    });

    if (affectedRows !== 1) {
      throw new NotFoundError(id, this.getEntity());
    }
  }

  async search(props: CastMemberSearchParams): Promise<CastMemberSearchResult> {
    const offset = (props.page - 1) * props.perPage;
    const limit = props.perPage;

    const where = {};

    if (props.filter && (props.filter.name || props.filter.type)) {
      if (props.filter.name) {
        where['name'] = { [Op.like]: `%${props.filter.name}%` };
      }

      if (props.filter.type) {
        where['type'] = props.filter.type;
      }
    }

    const { rows: models, count } = await this.castMemberModel.findAndCountAll({
      ...(props.filter && {
        where,
      }),
      ...(props.sort &&
      props.sortDirection &&
      this.sortableFields.includes(props.sort)
        ? { order: this.formatSort(props.sort, props.sortDirection) }
        : { order: [['createdAt', 'DESC']] }),
      offset,
      limit,
    });
    return new CastMemberSearchResult({
      items: models.map((model) => CastMemberModelMapper.toEntity(model)),
      currentPage: props.page,
      perPage: props.perPage,
      total: count,
    });
  }

  private formatSort(sort: string, sortDirection: SortDirection) {
    const dialect = this.castMemberModel.sequelize.getDialect() as 'mysql';
    if (this.orderBy[dialect] && this.orderBy[dialect][sort]) {
      return this.orderBy[dialect][sort](sortDirection);
    }
    return [[sort, sortDirection]];
  }

  getEntity(): new (...args: any[]) => CastMember {
    return CastMember;
  }
}
