import { Op } from 'sequelize';
import { NotFoundError } from '../../../../shared/domain/errors/not-found.error';
import { Category, CategoryId } from '../../../domain/category.aggregate';
import {
  CategorySearchParams,
  CategorySearchResult,
  ICategoryRepository,
} from '../../../domain/category.repository';
import { CategoryModel } from './category.model';
import { CategoryModelMapper } from './category.mapper';
import { InvalidArgumentError } from '@core/shared/domain/errors/invalid-argument.error';

export class CategorySequelizeRepository implements ICategoryRepository {
  sortableFields: string[] = ['name', 'createdAt'];

  constructor(private categoryModel: typeof CategoryModel) {}

  async insert(entity: Category): Promise<void> {
    const model = CategoryModelMapper.toModel(entity).toJSON();
    await this.categoryModel.create(model);
  }

  async bulkInsert(entities: Category[]): Promise<void> {
    const models = entities.map((entity) =>
      CategoryModelMapper.toModel(entity).toJSON(),
    );
    await this.categoryModel.bulkCreate(models);
  }

  async update(entity: Category): Promise<void> {
    const id = entity.categoryId.id;

    const modelProps = CategoryModelMapper.toModel(entity);
    const [affectedRows] = await this.categoryModel.update(
      modelProps.toJSON(),
      {
        where: { categoryId: entity.categoryId.id },
      },
    );

    if (affectedRows !== 1) {
      throw new NotFoundError(id, this.getEntity());
    }
  }

  async delete(entityId: CategoryId): Promise<void> {
    const id = entityId.id;

    const affectedRows = await this.categoryModel.destroy({
      where: { categoryId: id },
    });

    if (affectedRows !== 1) {
      throw new NotFoundError(id, this.getEntity());
    }
  }

  async findById(entityId: CategoryId): Promise<Category | null> {
    const model = await this.categoryModel.findByPk(entityId.id);
    return model ? CategoryModelMapper.toEntity(model) : null;
  }

  async findAll(): Promise<Category[]> {
    const models = await this.categoryModel.findAll();
    return models.map((model) => {
      return CategoryModelMapper.toEntity(model);
    });
  }

  async findByIds(ids: CategoryId[]): Promise<Category[]> {
    const models = await this.categoryModel.findAll({
      where: {
        categoryId: {
          [Op.in]: ids.map((id) => id.id),
        },
      },
    });
    return models.map((m) => CategoryModelMapper.toEntity(m));
  }

  async existsById(
    ids: CategoryId[],
  ): Promise<{ exists: CategoryId[]; notExists: CategoryId[] }> {
    if (!ids.length) {
      throw new InvalidArgumentError(
        'ids must be an array with at least one element',
      );
    }

    const existsCategoryModels = await this.categoryModel.findAll({
      attributes: ['categoryId'],
      where: {
        categoryId: {
          [Op.in]: ids.map((id) => id.id),
        },
      },
    });
    const existsCategoryIds = existsCategoryModels.map(
      (m) => new CategoryId(m.categoryId),
    );
    const notExistsCategoryIds = ids.filter(
      (id) => !existsCategoryIds.some((e) => e.equals(id)),
    );
    return {
      exists: existsCategoryIds,
      notExists: notExistsCategoryIds,
    };
  }

  async search(props: CategorySearchParams): Promise<CategorySearchResult> {
    const offset = (props.page - 1) * props.perPage;
    const limit = props.perPage;

    const { rows: models, count } = await this.categoryModel.findAndCountAll({
      ...(props.filter && {
        where: {
          name: { [Op.like]: `%${props.filter}%` },
        },
      }),
      ...(props.sort &&
      props.sortDirection &&
      this.sortableFields.includes(props.sort)
        ? { order: [[props.sort, props.sortDirection]] }
        : { order: [['createdAt', 'DESC']] }),
      offset,
      limit,
    });

    return new CategorySearchResult({
      items: models.map((model) => {
        return CategoryModelMapper.toEntity(model);
      }),
      currentPage: props.page,
      perPage: props.perPage,
      total: count,
    });
  }

  getEntity(): new (...args: any[]) => Category {
    return Category;
  }
}
