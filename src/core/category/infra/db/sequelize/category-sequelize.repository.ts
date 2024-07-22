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
