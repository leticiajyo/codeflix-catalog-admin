import { Uuid } from "../../../../shared/domain/value-objects/uuid.vo";
import { Category } from "../../../domain/category.entity";
import { CategoryModel } from "./category.model";

export class CategoryModelMapper {
  static toModel(entity: Category): CategoryModel {
    return CategoryModel.build({
      categoryId: entity.categoryId.id,
      name: entity.name,
      description: entity.description,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
    });
  }

  static toEntity(model: CategoryModel): Category {
    return new Category({
      categoryId: new Uuid(model.categoryId),
      name: model.name,
      description: model.description,
      isActive: model.isActive,
      createdAt: model.createdAt,
    });
  }
}
