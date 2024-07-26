import { Op, literal } from 'sequelize';
import { Genre, GenreId } from '../../../domain/genre.aggregate';
import {
  GenreSearchParams,
  GenreSearchResult,
  IGenreRepository,
} from '../../../domain/genre.repository';
import { GenreModel } from './genre-model';
import { InvalidArgumentError } from '../../../../shared/domain/errors/invalid-argument.error';
import { NotFoundError } from '../../../../shared/domain/errors/not-found.error';
import { GenreModelMapper } from './genre-mapper';

export class GenreSequelizeRepository implements IGenreRepository {
  sortableFields: string[] = ['name', 'createdAt'];
  constructor(private genreModel: typeof GenreModel) {}

  async insert(entity: Genre): Promise<void> {
    const model = GenreModelMapper.toModelProps(entity);
    await this.genreModel.create(model, {
      include: ['categoryIds'],
    });
  }

  async bulkInsert(entities: Genre[]): Promise<void> {
    const models = entities.map((e) => GenreModelMapper.toModelProps(e));
    await this.genreModel.bulkCreate(models, {
      include: ['categoryIds'],
    });
  }

  async findById(entityId: GenreId): Promise<Genre | null> {
    const model = await this.genreModel.findByPk(entityId.id, {
      include: ['categoryIds'],
    });
    return model ? GenreModelMapper.toEntity(model) : null;
  }

  async findAll(): Promise<Genre[]> {
    const models = await this.genreModel.findAll({
      include: ['categoryIds'],
    });
    return models.map((model) => GenreModelMapper.toEntity(model));
  }

  async findByIds(ids: GenreId[]): Promise<Genre[]> {
    const models = await this.genreModel.findAll({
      where: {
        genreId: {
          [Op.in]: ids.map((id) => id.id),
        },
      },
      include: ['categoryIds'],
    });
    return models.map((model) => GenreModelMapper.toEntity(model));
  }

  async existsById(
    ids: GenreId[],
  ): Promise<{ exists: GenreId[]; notExists: GenreId[] }> {
    if (!ids.length) {
      throw new InvalidArgumentError(
        'ids must be an array with at least one element',
      );
    }

    const existsGenreModels = await this.genreModel.findAll({
      attributes: ['genreId'],
      where: {
        genreId: {
          [Op.in]: ids.map((id) => id.id),
        },
      },
    });
    const existsGenreIds = existsGenreModels.map(
      (model) => new GenreId(model.genreId),
    );
    const notExistsGenreIds = ids.filter(
      (id) => !existsGenreIds.some((e) => e.equals(id)),
    );
    return {
      exists: existsGenreIds,
      notExists: notExistsGenreIds,
    };
  }

  async update(entity: Genre): Promise<void> {
    const model = await this.genreModel.findByPk(entity.genreId.id, {
      include: ['categoryIds'],
    });

    if (!model) {
      throw new NotFoundError(entity.genreId.id, this.getEntity());
    }

    await model.$remove(
      'categories',
      model.categoryIds.map((c) => c.categoryId),
    );

    const { categoryIds, ...props } = GenreModelMapper.toModelProps(entity);
    await this.genreModel.update(props, {
      where: { genreId: entity.genreId.id },
    });
    await model.$add(
      'categories',
      categoryIds.map((c) => c.categoryId),
    );
  }

  async delete(id: GenreId): Promise<void> {
    const genreCategoryRelation =
      this.genreModel.associations.categoryIds.target;
    await genreCategoryRelation.destroy({
      where: { genreId: id.id },
    });
    const affectedRows = await this.genreModel.destroy({
      where: { genreId: id.id },
    });

    if (affectedRows !== 1) {
      throw new NotFoundError(id.id, this.getEntity());
    }
  }

  async search(props: GenreSearchParams): Promise<GenreSearchResult> {
    const offset = (props.page - 1) * props.perPage;
    const limit = props.perPage;

    const wheres: any[] = [];

    const genreCategoryRelation =
      this.genreModel.associations.categoryIds.target;
    const genreTableName = this.genreModel.getTableName();
    const genreCategoryTableName = genreCategoryRelation.getTableName();
    const genreAlias = this.genreModel.name;

    if (props.filter && (props.filter.name || props.filter.categoryIds)) {
      if (props.filter.name) {
        wheres.push({
          field: 'name',
          value: `%${props.filter.name}%`,
          get condition() {
            return {
              [this.field]: {
                [Op.like]: this.value,
              },
            };
          },
          rawCondition: `${genreAlias}.name LIKE :name`,
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
          rawCondition: `${genreCategoryTableName}.categoryId IN (:categoryIds)`,
        });
      }
    }

    const orderBy =
      props.sort && this.sortableFields.includes(props.sort)
        ? `${this.genreModel.name}.\`${props.sort}\` ${props.sortDirection}`
        : `${genreAlias}.\`createdAt\` DESC`;

    const count: number = await this.genreModel.count({
      distinct: true,
      include: [props.filter?.categoryIds && 'categoryIds'].filter((i) => i),
      where: wheres.length ? { [Op.and]: wheres.map((w) => w.condition) } : {},
    });

    const columnOrder = orderBy.replace('binary', '').trim().split(' ')[0];

    const query = [
      'SELECT',
      `DISTINCT ${genreAlias}.\`genreId\`,${columnOrder} FROM ${genreTableName} as ${genreAlias}`,
      props.filter?.categoryIds
        ? `INNER JOIN ${genreCategoryTableName} ON ${genreAlias}.\`genreId\` = ${genreCategoryTableName}.\`genreId\``
        : '',
      wheres.length
        ? `WHERE ${wheres.map((w) => w.rawCondition).join(' AND ')}`
        : '',
      `ORDER BY ${orderBy}`,
      `LIMIT ${limit}`,
      `OFFSET ${offset}`,
    ];

    const [idsResult] = await this.genreModel.sequelize!.query(
      query.join(' '),
      {
        replacements: wheres.reduce(
          (acc, w) => ({ ...acc, [w.field]: w.value }),
          {},
        ),
      },
    );

    const models = await this.genreModel.findAll({
      where: {
        genreId: {
          [Op.in]: idsResult.map(
            (id: { genreId: string }) => id.genreId,
          ) as string[],
        },
      },
      include: ['categoryIds'],
      order: literal(orderBy),
    });

    return new GenreSearchResult({
      items: models.map((model) => GenreModelMapper.toEntity(model)),
      currentPage: props.page,
      perPage: props.perPage,
      total: count,
    });
  }

  getEntity(): new (...args: any[]) => Genre {
    return Genre;
  }
}
