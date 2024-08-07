import {
  IGenreRepository,
  GenreSearchParams,
  GenreSearchResult,
} from '../../../domain/genre.repository';
import { ICategoryRepository } from '../../../../category/domain/category.repository';
import { ListGenresInput } from './list-genres.input';
import { IUseCase } from '../../../../shared/application/use-case.interface';
import { CategoryId } from '../../../../category/domain/category.aggregate';
import {
  PaginationOutput,
  PaginationOutputMapper,
} from '@core/shared/application/pagination.output';
import { GenreOutput, GenreOutputMapper } from '../../common/genre.output';

export type ListGenresOutput = PaginationOutput<GenreOutput>;

export class ListGenresUseCase
  implements IUseCase<ListGenresInput, ListGenresOutput>
{
  constructor(
    private genreRepo: IGenreRepository,
    private categoryRepo: ICategoryRepository,
  ) {}

  async execute(input: ListGenresInput): Promise<ListGenresOutput> {
    const params = new GenreSearchParams({
      ...input,
      filter: {
        name: input.filter?.name,
        categoryIds: input.filter?.categoryIds?.map((c) => new CategoryId(c)),
      },
    });

    const searchResult = await this.genreRepo.search(params);

    return this.toOutput(searchResult);
  }

  private async toOutput(
    searchResult: GenreSearchResult,
  ): Promise<ListGenresOutput> {
    const { items: _items } = searchResult;

    const relatedCategories = searchResult.items.reduce<CategoryId[]>(
      (acc, item) => {
        return acc.concat([...item.categoryIds.values()]);
      },
      [],
    );

    const uniqueCategories = this.filterUniqueCategoryIds(relatedCategories);

    const categoriesRelated =
      await this.categoryRepo.findByIds(uniqueCategories);

    const items = _items.map((i) => {
      const categoriesOfGenre = categoriesRelated.filter((c) =>
        i.categoryIds.has(c.categoryId.id),
      );
      return GenreOutputMapper.toOutput(i, categoriesOfGenre);
    });

    return PaginationOutputMapper.toOutput(items, searchResult);
  }

  private filterUniqueCategoryIds(categoryIds: CategoryId[]): CategoryId[] {
    const seenIds = new Set<string>();
    return categoryIds.filter((categoryId) => {
      if (seenIds.has(categoryId.id)) {
        return false;
      } else {
        seenIds.add(categoryId.id);
        return true;
      }
    });
  }
}
