import { IUseCase } from '../../../../shared/application/use-case.interface';
import { NotFoundError } from '../../../../shared/domain/errors/not-found.error';
import { Category } from '../../../domain/category.aggregate';
import { CategoryId } from '@core/category/domain/category.aggregate';
import { ICategoryRepository } from '../../../domain/category.repository';
import {
  CategoryOutput,
  CategoryOutputMapper,
} from '../../common/category.output';

export type GetCategoryInput = {
  id: string;
};

export type GetCategoryOutput = CategoryOutput;

export class GetCategoryUseCase
  implements IUseCase<GetCategoryInput, GetCategoryOutput>
{
  constructor(private categoryRepository: ICategoryRepository) {}

  async execute(input: GetCategoryInput): Promise<GetCategoryOutput> {
    const categoryId = new CategoryId(input.id);
    const category = await this.categoryRepository.findById(categoryId);

    if (!category) {
      throw new NotFoundError(input.id, Category);
    }

    return CategoryOutputMapper.toOutput(category);
  }
}
