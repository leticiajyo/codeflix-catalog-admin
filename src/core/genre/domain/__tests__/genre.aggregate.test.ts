import { CategoryId } from '@core/category/domain/category.aggregate';
import { Genre, GenreCreateCommand, GenreId } from '../genre.aggregate';

describe('Genre Entity', () => {
  let validateSpy: jest.SpyInstance;

  beforeEach(() => {
    validateSpy = jest.spyOn(Genre.prototype as any, 'validate');
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should validate entity', () => {
      Genre.create({
        name: 'name',
        categoryIds: [new CategoryId()],
      });

      expect(validateSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('create', () => {
    it('should create genre with default parameters', () => {
      const command: GenreCreateCommand = {
        name: 'name',
      };

      const genre = Genre.create(command);

      expect(genre.genreId).toBeInstanceOf(GenreId);
      expect(genre.name).toBe(command.name);
      expect(genre.categoryIds).toEqual(new Map());
      expect(genre.isActive).toBeTruthy();
      expect(genre.createdAt).toBeInstanceOf(Date);

      expect(validateSpy).toHaveBeenCalledTimes(1);
    });

    it('should create genre with given params', () => {
      const categoryId = new CategoryId();
      const command: GenreCreateCommand = {
        name: 'name',
        categoryIds: [categoryId],
        isActive: false,
      };

      const genre = Genre.create(command);

      expect(genre.genreId).toBeInstanceOf(GenreId);
      expect(genre.name).toBe(command.name);
      expect(genre.categoryIds).toEqual(new Map([[categoryId.id, categoryId]]));
      expect(genre.isActive).toBeFalsy();
      expect(genre.createdAt).toBeInstanceOf(Date);

      expect(validateSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('changeName', () => {
    it('should change genre name', () => {
      const genre = Genre.create({ name: 'name' });
      const newName = 'other name';

      genre.changeName(newName);

      expect(genre.name).toBe(newName);

      expect(validateSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('addCategoryId', () => {
    it('should add category id', () => {
      const genre = Genre.create({ name: 'name' });
      const categoryId = new CategoryId();

      genre.addCategoryId(categoryId);

      expect(genre.categoryIds).toEqual(new Map([[categoryId.id, categoryId]]));

      expect(validateSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('removeCategoryId', () => {
    it('should remove category id', () => {
      const categoryId = new CategoryId();
      const genre = Genre.create({ name: 'name', categoryIds: [categoryId] });

      genre.removeCategoryId(categoryId);

      expect(genre.categoryIds).toEqual(new Map());

      expect(validateSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('syncCategoryIds', () => {
    it('should sync category ids', () => {
      const genre = Genre.create({
        name: 'name',
        categoryIds: [new CategoryId(), new CategoryId()],
      });
      const newCategoryId = new CategoryId();

      genre.syncCategoryIds([newCategoryId]);

      expect(genre.categoryIds).toEqual(
        new Map([[newCategoryId.id, newCategoryId]]),
      );

      expect(validateSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('activate', () => {
    it('should activate genre', () => {
      const genre = Genre.create({ name: 'name', isActive: false });

      genre.activate();

      expect(genre.isActive).toBeTruthy();
    });
  });

  describe('deactivate', () => {
    it('should deactivate genre', () => {
      const genre = Genre.create({ name: 'name', isActive: true });

      genre.deactivate();

      expect(genre.isActive).toBeFalsy();
    });
  });
});
