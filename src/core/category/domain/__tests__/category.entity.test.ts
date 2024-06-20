import { Uuid } from '../../../shared/domain/value-objects/uuid.vo';
import { Category, CategoryCreateCommand } from '../category.entity';

describe('Category Entity', () => {
  let validateSpy: jest.SpyInstance;

  beforeEach(() => {
    validateSpy = jest.spyOn(Category.prototype as any, 'validate');
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should validate entity', () => {
      Category.create({ name: 'movie' });

      expect(validateSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('create', () => {
    it('should create category with default parameters', () => {
      const command: CategoryCreateCommand = { name: 'movie' };

      const category = Category.create(command);

      expect(category.categoryId).toBeInstanceOf(Uuid);
      expect(category.name).toBe(command.name);
      expect(category.description).toBeNull();
      expect(category.isActive).toBeTruthy();
      expect(category.createdAt).toBeInstanceOf(Date);

      expect(validateSpy).toHaveBeenCalledTimes(1);
    });

    it('should create category with given params', () => {
      const command: CategoryCreateCommand = {
        name: 'movie',
        description: 'movie description',
        isActive: false,
      };

      const category = Category.create(command);

      expect(category.categoryId).toBeInstanceOf(Uuid);
      expect(category.name).toBe(command.name);
      expect(category.description).toBe(command.description);
      expect(category.isActive).toBeFalsy();
      expect(category.createdAt).toBeInstanceOf(Date);

      expect(validateSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('changeName', () => {
    it('should change category name', () => {
      const category = Category.create({ name: 'movie' });
      const newName = 'other name';

      category.changeName(newName);

      expect(category.name).toBe(newName);

      expect(validateSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('changeDescription', () => {
    it('should change category description', () => {
      const category = Category.create({ name: 'movie' });
      const newDescription = 'other description';

      category.changeDescription(newDescription);

      expect(category.description).toBe(newDescription);
    });
  });

  describe('activate', () => {
    it('should activate category', () => {
      const category = Category.create({ name: 'movie', isActive: false });

      category.activate();

      expect(category.isActive).toBeTruthy();
    });
  });

  describe('deactivate', () => {
    it('should deactivate category', () => {
      const category = Category.create({ name: 'movie', isActive: true });

      category.deactivate();

      expect(category.isActive).toBeFalsy();
    });
  });
});
