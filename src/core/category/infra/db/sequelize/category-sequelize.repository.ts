import { Op } from "sequelize";
import { NotFoundError } from "../../../../shared/domain/errors/not-found.error";
import { Uuid } from "../../../../shared/domain/value-objects/uuid.vo";
import { Category } from "../../../domain/category.entity";
import {
  CategorySearchParams,
  CategorySearchResult,
  ICategoryRepository,
} from "../../../domain/category.repository";
import { CategoryModel } from "./category.model";
import { CategoryModelMapper } from "./category.mapper";

export class CategorySequelizeRepository implements ICategoryRepository {
  sortableFields: string[] = ["name", "createdAt"];

  constructor(private categoryModel: typeof CategoryModel) {}

  async insert(entity: Category): Promise<void> {
    const model = CategoryModelMapper.toModel(entity).toJSON();
    await this.categoryModel.create(model);
  }

  async bulkInsert(entities: Category[]): Promise<void> {
    const models = entities.map((entity) =>
      CategoryModelMapper.toModel(entity).toJSON()
    );
    await this.categoryModel.bulkCreate(models);
  }

  async update(entity: Category): Promise<void> {
    const id = entity.categoryId.id;

    const model = await this._get(id);
    if (!model) {
      throw new NotFoundError(id, this.getEntity());
    }

    const updatedModel = CategoryModelMapper.toModel(entity).toJSON();
    await this.categoryModel.update(updatedModel, {
      where: { categoryId: id },
    });
  }

  async delete(entityId: Uuid): Promise<void> {
    const id = entityId.id;
    const model = await this._get(id);

    if (!model) {
      throw new NotFoundError(id, this.getEntity());
    }

    await this.categoryModel.destroy({ where: { categoryId: id } });
  }

  async findById(entityId: Uuid): Promise<Category | null> {
    const model = await this._get(entityId.id);

    if (!model) {
      return null;
    }

    return CategoryModelMapper.toEntity(model);
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
        : { order: [["createdAt", "desc"]] }),
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

  private async _get(id: string) {
    return await this.categoryModel.findByPk(id);
  }
}
