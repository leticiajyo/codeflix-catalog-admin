import { SortDirection } from '@core/shared/domain/repository/search-params';
import { GenresController } from '../genres.controller';
import { GenreCollectionPresenter, GenrePresenter } from '../genres.presenter';
import { CreateGenreDto } from '../dto/create-genre.dto';
import { UpdateGenreDto } from '../dto/update-genre.dto';
import { CreateGenreOutput } from '../../../core/genre/application/use-cases/create-genre/create-genre.use-case';
import { UpdateGenreOutput } from '../../../core/genre/application/use-cases/update-genre/update-genre.use-case';
import { GetGenreOutput } from '../../../core/genre/application/use-cases/get-genre/get-genre.use-case';
import { ListGenresOutput } from '../../../core/genre/application/use-cases/list-genres/list-genres.use-case';

describe('Genres Controller', () => {
  let controller: GenresController;

  beforeEach(async () => {
    controller = new GenresController();
  });

  describe('create', () => {
    it('should execute use case', async () => {
      const output: CreateGenreOutput = {
        id: '9366b7dc-2d71-4799-b91c-c64adb205104',
        name: 'action',
        categories: [
          {
            id: '8d0b0c9e-9b1a-4e8a-9e1a-3b2c1d7c6b5a',
            name: 'category',
            createdAt: new Date(),
          },
        ],
        isActive: true,
        categoryIds: ['8d0b0c9e-9b1a-4e8a-9e1a-3b2c1d7c6b5a'],
        createdAt: new Date(),
      };
      const mockCreateUseCase = {
        execute: jest.fn().mockReturnValue(Promise.resolve(output)),
      };
      controller['createUseCase'] = mockCreateUseCase as any;

      const input: CreateGenreDto = {
        name: 'action',
        categoryIds: ['8d0b0c9e-9b1a-4e8a-9e1a-3b2c1d7c6b5a'],
      };

      const presenter = await controller.create(input);

      expect(mockCreateUseCase.execute).toHaveBeenCalledWith(input);
      expect(presenter).toBeInstanceOf(GenrePresenter);
      expect(presenter).toStrictEqual(new GenrePresenter(output));
    });
  });

  describe('update', () => {
    it('should execute use case', async () => {
      const id = '9366b7dc-2d71-4799-b91c-c64adb205104';
      const output: UpdateGenreOutput = {
        id,
        name: 'action',
        categories: [
          {
            id: '8d0b0c9e-9b1a-4e8a-9e1a-3b2c1d7c6b5a',
            name: 'category',
            createdAt: new Date(),
          },
        ],
        isActive: true,
        categoryIds: ['8d0b0c9e-9b1a-4e8a-9e1a-3b2c1d7c6b5a'],
        createdAt: new Date(),
      };
      const mockUpdateUseCase = {
        execute: jest.fn().mockReturnValue(Promise.resolve(output)),
      };
      controller['updateUseCase'] = mockUpdateUseCase as any;
      const input: UpdateGenreDto = {
        name: 'action',
        categoryIds: ['8d0b0c9e-9b1a-4e8a-9e1a-3b2c1d7c6b5a'],
      };

      const presenter = await controller.update(id, input);

      expect(mockUpdateUseCase.execute).toHaveBeenCalledWith({ id, ...input });
      expect(presenter).toBeInstanceOf(GenrePresenter);
      expect(presenter).toStrictEqual(new GenrePresenter(output));
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
      const output: GetGenreOutput = {
        id,
        name: 'action',
        categories: [
          {
            id: '8d0b0c9e-9b1a-4e8a-9e1a-3b2c1d7c6b5a',
            name: 'category',
            createdAt: new Date(),
          },
        ],
        isActive: true,
        categoryIds: ['8d0b0c9e-9b1a-4e8a-9e1a-3b2c1d7c6b5a'],
        createdAt: new Date(),
      };
      const mockGetUseCase = {
        execute: jest.fn().mockReturnValue(Promise.resolve(output)),
      };
      controller['getUseCase'] = mockGetUseCase as any;

      const presenter = await controller.findOne(id);

      expect(mockGetUseCase.execute).toHaveBeenCalledWith({ id });
      expect(presenter).toBeInstanceOf(GenrePresenter);
      expect(presenter).toStrictEqual(new GenrePresenter(output));
    });
  });

  describe('search', () => {
    it('should execute use case', async () => {
      const output: ListGenresOutput = {
        items: [
          {
            id: '9366b7dc-2d71-4799-b91c-c64adb205104',
            name: 'action',
            categories: [
              {
                id: '8d0b0c9e-9b1a-4e8a-9e1a-3b2c1d7c6b5a',
                name: 'category',
                createdAt: new Date(),
              },
            ],
            isActive: true,
            categoryIds: ['8d0b0c9e-9b1a-4e8a-9e1a-3b2c1d7c6b5a'],
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
        per_page: 2,
        sort: 'name',
        sortDirection: 'desc' as SortDirection,
        filter: { name: 'actor test' },
      };

      const presenter = await controller.search(searchParams);

      expect(presenter).toBeInstanceOf(GenreCollectionPresenter);
      expect(mockListUseCase.execute).toHaveBeenCalledWith(searchParams);
      expect(presenter).toEqual(new GenreCollectionPresenter(output));
    });
  });
});
