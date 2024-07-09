import { CategoryOutput } from '@core/category/application/common/category.output';
import { Transform } from 'class-transformer';

export class CategoryPresenter {
  id: string;
  name: string;
  description: string | null;
  @Transform(({ value }: { value: Date }) => value.toISOString())
  createdAt: Date;

  constructor(output: CategoryOutput) {
    this.id = output.id;
    this.name = output.name;
    this.description = output.description;
    this.createdAt = output.createdAt;
  }
}
