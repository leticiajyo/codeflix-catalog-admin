import { CreateCategoryOutput } from '@core/category/application/use-cases/create-category/create-category.use-case';
import { GetCategoryOutput } from '@core/category/application/use-cases/get-category/get-category.use-case';
import { ListCategoriesOutput } from '@core/category/application/use-cases/list-categories/list-categories.use-case';
import { UpdateCategoryInput } from '@core/category/application/use-cases/update-category/update-category.input';
import { UpdateCategoryOutput } from '@core/category/application/use-cases/update-category/update-category.use-case';
import { SortDirection } from '@core/shared/domain/repository/search-params';
import { CategoriesController } from '../categories.controller';
import {
  CategoryPresenter,
  CategoryCollectionPresenter,
} from '../categories.presenter';
import { CreateCategoryDto } from '../dto/create-category.dto';

describe('Categories Controller', () => {
  let controller: CategoriesController;

  beforeEach(async () => {
    controller = new CategoriesController();
  });

  describe('create', () => {
    it('should execute use case', async () => {
      const output: CreateCategoryOutput = {
        id: '9366b7dc-2d71-4799-b91c-c64adb205104',
        name: 'Movie',
        description: 'some description',
        isActive: true,
        createdAt: new Date(),
      };
      const mockCreateUseCase = {
        execute: jest.fn().mockReturnValue(Promise.resolve(output)),
      };
      controller['createUseCase'] = mockCreateUseCase as any;

      const input: CreateCategoryDto = {
        name: 'Movie',
        description: 'some description',
        isActive: true,
      };

      const presenter = await controller.create(input);

      expect(mockCreateUseCase.execute).toHaveBeenCalledWith(input);
      expect(presenter).toBeInstanceOf(CategoryPresenter);
      expect(presenter).toStrictEqual(new CategoryPresenter(output));
    });
  });

  describe('update', () => {
    it('should execute use case', async () => {
      const id = '9366b7dc-2d71-4799-b91c-c64adb205104';
      const output: UpdateCategoryOutput = {
        id,
        name: 'Movie',
        description: 'some description',
        isActive: true,
        createdAt: new Date(),
      };
      const mockUpdateUseCase = {
        execute: jest.fn().mockReturnValue(Promise.resolve(output)),
      };
      controller['updateUseCase'] = mockUpdateUseCase as any;

      const input: Omit<UpdateCategoryInput, 'id'> = {
        name: 'Movie',
        description: 'some description',
        isActive: true,
      };

      const presenter = await controller.update(id, input);

      expect(mockUpdateUseCase.execute).toHaveBeenCalledWith({ id, ...input });
      expect(presenter).toBeInstanceOf(CategoryPresenter);
      expect(presenter).toStrictEqual(new CategoryPresenter(output));
    });
  });

  describe('remove', () => {
    it('should execute use case', async () => {
      const expectedOutput = undefined;
      const mockDeleteUseCase = {
        execute: jest.fn().mockReturnValue(Promise.resolve(expectedOutput)),
      };
      controller['deleteUseCase'] = mockDeleteUseCase as any;

      const id = '9366b7dc-2d71-4799-b91c-c64adb205104';

      const output = await controller.remove(id);

      expect(mockDeleteUseCase.execute).toHaveBeenCalledWith({ id });
      expect(expectedOutput).toStrictEqual(output);
    });
  });

  describe('findOne', () => {
    it('should execute use case', async () => {
      const id = '9366b7dc-2d71-4799-b91c-c64adb205104';
      const output: GetCategoryOutput = {
        id,
        name: 'Movie',
        description: 'some description',
        isActive: true,
        createdAt: new Date(),
      };
      const mockGetUseCase = {
        execute: jest.fn().mockReturnValue(Promise.resolve(output)),
      };
      controller['getUseCase'] = mockGetUseCase as any;

      const presenter = await controller.findOne(id);

      expect(mockGetUseCase.execute).toHaveBeenCalledWith({ id });
      expect(presenter).toBeInstanceOf(CategoryPresenter);
      expect(presenter).toStrictEqual(new CategoryPresenter(output));
    });
  });

  describe('search', () => {
    it('should execute use case', async () => {
      const output: ListCategoriesOutput = {
        items: [
          {
            id: '9366b7dc-2d71-4799-b91c-c64adb205104',
            name: 'Movie',
            description: 'some description',
            isActive: true,
            createdAt: new Date(),
          },
        ],
        currentPage: 1,
        lastPage: 1,
        perPage: 1,
        total: 1,
      };
      const mockListUseCase = {
        execute: jest.fn().mockReturnValue(Promise.resolve(output)),
      };
      controller['listUseCase'] = mockListUseCase as any;
      const searchParams = {
        page: 1,
        perPage: 2,
        sort: 'name',
        sortDirection: 'desc' as SortDirection,
        filter: 'test',
      };

      const presenter = await controller.search(searchParams);

      expect(presenter).toBeInstanceOf(CategoryCollectionPresenter);
      expect(mockListUseCase.execute).toHaveBeenCalledWith(searchParams);
      expect(presenter).toEqual(new CategoryCollectionPresenter(output));
    });
  });
});
