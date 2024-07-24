import { Genre } from '@core/genre/domain/genre.aggregate';
import {
  SearchParams,
  SortDirection,
} from '@core/shared/domain/repository/search-params';
import { GenreInMemoryRepository } from '../genre-in-memory.repository';
import { CategoryId } from '@core/category/domain/category.aggregate';

describe('Genre In Memory Repository', () => {
  let repository: GenreInMemoryRepository;

  beforeEach(() => {
    repository = new GenreInMemoryRepository();
  });

  describe('search', () => {
    it('should filter items by name', async () => {
      const entity1 = Genre.fake().oneGenre().withName('name').build();
      const entity2 = Genre.fake().oneGenre().withName('NAME').build();
      const entity3 = Genre.fake().oneGenre().withName('other').build();
      repository.items = [entity1, entity2, entity3];

      const searchResult = await repository.search(
        new SearchParams({ filter: { name: 'name' } }),
      );

      expect(searchResult.items).toEqual([entity2, entity1]);
    });

    it('should filter items by category id', async () => {
      const categoryId1 = new CategoryId();
      const categoryId2 = new CategoryId();
      const categoryId3 = new CategoryId();
      const entity1 = Genre.fake()
        .oneGenre()
        .addCategoryId(categoryId1)
        .build();
      const entity2 = Genre.fake()
        .oneGenre()
        .addCategoryId(categoryId1)
        .addCategoryId(categoryId2)
        .build();
      const entity3 = Genre.fake()
        .oneGenre()
        .addCategoryId(categoryId3)
        .build();
      repository.items = [entity1, entity2, entity3];

      const searchResult = await repository.search(
        new SearchParams({ filter: { categoryIds: [categoryId1] } }),
      );

      expect(searchResult.items).toEqual([entity1, entity2]);
    });

    it('should filter items by name and type', async () => {
      const categoryId1 = new CategoryId();
      const categoryId2 = new CategoryId();
      const entity1 = Genre.fake()
        .oneGenre()
        .withName('name')
        .addCategoryId(categoryId1)
        .build();
      const entity2 = Genre.fake()
        .oneGenre()
        .withName('Name')
        .addCategoryId(categoryId2)
        .build();
      const entity3 = Genre.fake()
        .oneGenre()
        .withName('other')
        .addCategoryId(categoryId1)
        .build();
      repository.items = [entity1, entity2, entity3];

      const searchResult = await repository.search(
        new SearchParams({
          filter: { name: 'name', categoryIds: [categoryId1] },
        }),
      );

      expect(searchResult.items).toEqual([entity1]);
    });

    it('should sort items based on given params', async () => {
      const entity1 = Genre.fake().oneGenre().withName('name 1').build();
      const entity2 = Genre.fake().oneGenre().withName('name 2').build();
      repository.items = [entity1, entity2];

      const searchResult = await repository.search(
        new SearchParams({ sort: 'name', sortDirection: SortDirection.DESC }),
      );

      expect(searchResult.items).toEqual([entity2, entity1]);
    });

    it('should sort by createdAt when sort param is null', async () => {
      const entity1 = Genre.fake()
        .oneGenre()
        .withName('name 1')
        .withCreatedAt(new Date('2024-06-06T08:00:00'))
        .build();
      const entity2 = Genre.fake()
        .oneGenre()
        .withName('name 2')
        .withCreatedAt(new Date('2024-07-06T08:00:00'))
        .build();

      repository.items = [entity1, entity2];

      const searchResult = await repository.search(new SearchParams());

      expect(searchResult.items).toEqual([entity2, entity1]);
    });
  });
});
