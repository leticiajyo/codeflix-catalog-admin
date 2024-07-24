import { CategoryId } from '@core/category/domain/category.aggregate';
import { GenreFakeBuilder } from '../genre-fake.builder';
import { GenreId } from '../genre.aggregate';

describe('Genre Faker Builder', () => {
  describe('oneGenre', () => {
    it('should create genre with random values', () => {
      const faker = GenreFakeBuilder.oneGenre();

      const genre = faker.build();

      expect(genre.genreId).toBeInstanceOf(GenreId);
      expect(typeof genre.name === 'string').toBeTruthy();
      expect(genre.categoryIds.size).toBe(1);
      expect([...genre.categoryIds.values()][0]).toBeInstanceOf(CategoryId);
      expect(genre.isActive).toBe(true);
      expect(genre.createdAt).toBeInstanceOf(Date);
    });

    it('should create genre with given values', () => {
      const faker = GenreFakeBuilder.oneGenre();

      const categoryId = new CategoryId();
      const genreId = new GenreId();
      const name = 'name test';
      const isActive = false;
      const createdAt = new Date('2024-06-07T08:00:00');

      const genre = faker
        .withGenreId(genreId)
        .withName(name)
        .addCategoryId(categoryId)
        .withIsActive(isActive)
        .withCreatedAt(createdAt)
        .build();

      expect(genre.genreId).toBe(genreId);
      expect(genre.name).toBe(name);
      expect(genre.categoryIds.size).toBe(1);
      expect([...genre.categoryIds.values()][0]).toEqual(categoryId);
      expect(genre.isActive).toBe(false);
      expect(genre.createdAt).toBe(createdAt);
    });
  });

  describe('manyGenres', () => {
    it('should create genres with random values', () => {
      const faker = GenreFakeBuilder.manyGenres(2);

      const genres = faker.build();

      genres.forEach((genre) => {
        expect(genre.genreId).toBeInstanceOf(GenreId);
        expect(typeof genre.name === 'string').toBeTruthy();
        expect(genre.categoryIds.size).toBe(1);
        expect([...genre.categoryIds.values()][0]).toBeInstanceOf(CategoryId);
        expect(genre.isActive).toBe(true);
        expect(genre.createdAt).toBeInstanceOf(Date);
      });
    });

    it('should create genres with given factories', () => {
      const count = 2;
      const faker = GenreFakeBuilder.manyGenres(count);

      const categoryId = new CategoryId();
      const genreId = new GenreId();
      const name = 'name test';
      const isActive = false;
      const createdAt = new Date('2024-06-07T08:00:00');

      const mockGenreIdFactory = jest.fn(() => genreId);
      const mockNameFactory = jest.fn(() => name);
      const mockCategoryIdsFactory = jest.fn(() => categoryId);
      const mockIsActiveFactory = jest.fn(() => isActive);
      const mockCreatedAtFactory = jest.fn(() => createdAt);

      const genres = faker
        .withGenreId(mockGenreIdFactory)
        .withName(mockNameFactory)
        .addCategoryId(mockCategoryIdsFactory)
        .withIsActive(mockIsActiveFactory)
        .withCreatedAt(mockCreatedAtFactory)
        .build();

      expect(mockGenreIdFactory).toHaveBeenCalledTimes(count);
      expect(mockNameFactory).toHaveBeenCalledTimes(count);
      expect(mockCategoryIdsFactory).toHaveBeenCalledTimes(count);
      expect(mockIsActiveFactory).toHaveBeenCalledTimes(count);
      expect(mockCreatedAtFactory).toHaveBeenCalledTimes(count);

      genres.forEach((genre) => {
        expect(genre.genreId).toBe(genreId);
        expect(genre.name).toBe(name);
        expect(genre.categoryIds.size).toBe(1);
        expect([...genre.categoryIds.values()][0]).toEqual(categoryId);
        expect(genre.isActive).toBe(false);
        expect(genre.createdAt).toBe(createdAt);
      });
    });
  });
});
