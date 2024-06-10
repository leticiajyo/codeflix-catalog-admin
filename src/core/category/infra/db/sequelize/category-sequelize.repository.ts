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

export class CategorySequelizeRepository implements ICategoryRepository {
  sortableFields: string[] = ["name", "createdAt"];

  constructor(private categoryModel: typeof CategoryModel) {}

  async insert(entity: Category): Promise<void> {
    await this.categoryModel.create({
      categoryId: entity.categoryId.id,
      name: entity.name,
      description: entity.description,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
    });
  }

  async bulkInsert(entities: Category[]): Promise<void> {
    await this.categoryModel.bulkCreate(
      entities.map((entity) => ({
        categoryId: entity.categoryId.id,
        name: entity.name,
        description: entity.description,
        isActive: entity.isActive,
        createdAt: entity.createdAt,
      }))
    );
  }

  async update(entity: Category): Promise<void> {
    const id = entity.categoryId.id;
    const model = await this._get(id);

    if (!model) {
      throw new NotFoundError(id, this.getEntity());
    }

    await this.categoryModel.update(
      {
        categoryId: entity.categoryId.id,
        name: entity.name,
        description: entity.description,
        isActive: entity.isActive,
        createdAt: entity.createdAt,
      },
      { where: { categoryId: id } }
    );
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

    return new Category({
      categoryId: new Uuid(model.categoryId),
      name: model.name,
      description: model.description,
      isActive: model.isActive,
      createdAt: model.createdAt,
    });
  }

  async findAll(): Promise<Category[]> {
    const models = await this.categoryModel.findAll();
    return models.map((model) => {
      return new Category({
        categoryId: new Uuid(model.categoryId),
        name: model.name,
        description: model.description,
        isActive: model.isActive,
        createdAt: model.createdAt,
      });
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
        return new Category({
          categoryId: new Uuid(model.categoryId),
          name: model.name,
          description: model.description,
          isActive: model.isActive,
          createdAt: model.createdAt,
        });
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
