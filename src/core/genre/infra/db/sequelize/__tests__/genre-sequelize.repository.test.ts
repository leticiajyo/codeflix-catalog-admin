import { Genre, GenreId } from '@core/genre/domain/genre.aggregate';
import { GenreSearchParams } from '@core/genre/domain/genre.repository';
import { NotFoundError } from '../../../../../shared/domain/errors/not-found.error';
import { SortDirection } from '../../../../../shared/domain/repository/search-params';
import { setupSequelize } from '../../../../../shared/infra/testing/sequelize.helper';
import { GenreCategoryModel, GenreModel } from '../genre.model';
import { GenreSequelizeRepository } from '../genre-sequelize.repository';
import { CategoryModel } from '@core/category/infra/db/sequelize/category.model';
import { CategorySequelizeRepository } from '@core/category/infra/db/sequelize/category-sequelize.repository';
import { Category, CategoryId } from '@core/category/domain/category.aggregate';
import { UnitOfWorkSequelize } from '@core/shared/infra/db/sequelize/unit-of-work-sequelize';

describe('Cast Member Sequelize Repository', () => {
  let genreRepo: GenreSequelizeRepository;
  let categoryRepo: CategorySequelizeRepository;
  let uow: UnitOfWorkSequelize;

  const sequelizeHelper = setupSequelize({
    models: [GenreModel, GenreCategoryModel, CategoryModel],
  });

  beforeEach(async () => {
    uow = new UnitOfWorkSequelize(sequelizeHelper.sequelize);
    genreRepo = new GenreSequelizeRepository(GenreModel, uow);
    categoryRepo = new CategorySequelizeRepository(CategoryModel);
  });

  describe('insert', () => {
    it('should insert a new entity', async () => {
      const category = Category.fake().oneCategory().build();
      await categoryRepo.insert(category);

      const genre = Genre.fake()
        .oneGenre()
        .addCategoryId(category.categoryId)
        .build();
      await genreRepo.insert(genre);

      const entity = await genreRepo.findById(genre.genreId);

      expect(entity.toJSON()).toStrictEqual(genre.toJSON());
      await expect(GenreCategoryModel.count()).resolves.toBe(1);
    });
  });

  describe('bulkInsert', () => {
    it('should insert new entities', async () => {
      const categories = Category.fake().manyCategories(3).build();
      await categoryRepo.bulkInsert(categories);

      const genres = Genre.fake()
        .manyGenres(2)
        .addCategoryId(categories[0].categoryId)
        .addCategoryId(categories[1].categoryId)
        .addCategoryId(categories[2].categoryId)
        .build();
      await genreRepo.bulkInsert(genres);

      const entities = await genreRepo.findAll();

      for (const entity of entities) {
        const genre = genres.find(
          (genre) => genre.genreId.id == entity.genreId.id,
        );

        expect(entity.toJSON()).toStrictEqual({
          ...genre.toJSON(),
          categoryIds: expect.arrayContaining([
            categories[0].categoryId.id,
            categories[1].categoryId.id,
            categories[2].categoryId.id,
          ]),
        });
      }
    });
  });

  describe('findById', () => {
    it('should return null if entity is not found', async () => {
      const entity = await genreRepo.findById(new GenreId());
      expect(entity).toBeNull();
    });
  });

  describe('findByIds', () => {
    it('should return entities for the given ids', async () => {
      const category = Category.fake().oneCategory().build();
      await categoryRepo.insert(category);

      const genres = Genre.fake()
        .manyGenres(2)
        .addCategoryId(category.categoryId)
        .build();
      await genreRepo.bulkInsert(genres);

      const entities = await genreRepo.findByIds([
        genres[0].genreId,
        genres[1].genreId,
      ]);

      for (const entity of entities) {
        const genre = genres.find(
          (genre) => genre.genreId.id == entity.genreId.id,
        );

        expect(entity.toJSON()).toStrictEqual(genre.toJSON());
      }
    });
  });

  describe('existsById', () => {
    it('should return entities separated in existing or not existing', async () => {
      const notExistId = new GenreId();

      const category = Category.fake().oneCategory().build();
      await categoryRepo.insert(category);

      const genre = Genre.fake()
        .oneGenre()
        .addCategoryId(category.categoryId)
        .build();
      await genreRepo.insert(genre);

      const result = await genreRepo.existsById([genre.genreId, notExistId]);

      expect(result).toEqual({
        exists: [genre.genreId],
        notExists: [notExistId],
      });
    });
  });

  describe('update', () => {
    it('should update an entity', async () => {
      const categories = Category.fake().manyCategories(2).build();
      await categoryRepo.bulkInsert(categories);

      const genre = Genre.fake()
        .oneGenre()
        .addCategoryId(categories[0].categoryId)
        .build();
      await genreRepo.insert(genre);

      genre.changeName('another ctegory');
      genre.addCategoryId(categories[1].categoryId);
      genre.deactivate();

      await genreRepo.update(genre);

      const entityFound = await genreRepo.findById(genre.genreId);
      expect(genre.toJSON()).toStrictEqual({
        ...entityFound!.toJSON(),
        categoryIds: expect.arrayContaining([
          categories[0].categoryId.id,
          categories[1].categoryId.id,
        ]),
      });
    });

    it('should throw error when entity is not found', async () => {
      const entity = Genre.fake().oneGenre().build();

      await expect(genreRepo.update(entity)).rejects.toThrow(
        new NotFoundError(entity.genreId.id, Genre),
      );
    });
  });

  describe('delete', () => {
    it('should delete an entity', async () => {
      const categories = Category.fake().manyCategories(2).build();
      await categoryRepo.bulkInsert(categories);

      const genre = Genre.fake()
        .oneGenre()
        .addCategoryId(categories[0].categoryId)
        .build();
      await genreRepo.insert(genre);

      await genreRepo.delete(genre.genreId);

      const entity = await genreRepo.findById(genre.genreId);
      expect(entity).toBeNull();
      await expect(GenreCategoryModel.count()).resolves.toBe(0);
    });

    it('should throw error when entity is not found', async () => {
      const entity = Genre.fake().oneGenre().build();

      await expect(genreRepo.delete(entity.genreId)).rejects.toThrow(
        new NotFoundError(entity.genreId.id, Genre),
      );
    });
  });

  describe('search', () => {
    it('should apply default paginate when search params are null', async () => {
      const categories = Category.fake().manyCategories(3).build();
      await categoryRepo.bulkInsert(categories);

      const genres = Genre.fake()
        .manyGenres(16)
        .withCreatedAt((index) => new Date(new Date().getTime() + 100 + index))
        .addCategoryId(categories[0].categoryId)
        .addCategoryId(categories[1].categoryId)
        .addCategoryId(categories[2].categoryId)
        .build();
      await genreRepo.bulkInsert(genres);

      const searchOutput = await genreRepo.search(new GenreSearchParams());

      expect(searchOutput).toMatchObject({
        total: 16,
        currentPage: 1,
        lastPage: 2,
        perPage: 15,
      });
      expect(searchOutput.items).toHaveLength(15);
    });

    it('should order by createdAt DESC when search params are null', async () => {
      const categories = Category.fake().manyCategories(3).build();
      await categoryRepo.bulkInsert(categories);

      const createdAt = new Date();
      const genres = Genre.fake()
        .manyGenres(5)
        .addCategoryId(categories[0].categoryId)
        .addCategoryId(categories[1].categoryId)
        .addCategoryId(categories[2].categoryId)
        .withName((index) => `Name ${index}`)
        .withCreatedAt((index) => new Date(createdAt.getTime() + index))
        .build();
      await genreRepo.bulkInsert(genres);

      const searchOutput = await genreRepo.search(new GenreSearchParams());

      searchOutput.items.reverse().forEach((_, index) => {
        expect(`Name ${index}`).toBe(`${genres[index].name}`);
      });
    });

    it('should apply filter', async () => {
      const categories = Category.fake().manyCategories(3).build();
      await categoryRepo.bulkInsert(categories);

      const genres = [
        Genre.fake()
          .oneGenre()
          .withName('test')
          .addCategoryId(categories[0].categoryId)
          .build(),
        Genre.fake()
          .oneGenre()
          .withName('a')
          .addCategoryId(categories[1].categoryId)
          .build(),
        Genre.fake()
          .oneGenre()
          .withName('TEST')
          .addCategoryId(categories[2].categoryId)
          .build(),
        Genre.fake()
          .oneGenre()
          .withName('TeSt')
          .addCategoryId(categories[1].categoryId)
          .build(),
      ];
      await genreRepo.bulkInsert(genres);

      const searchOutput = await genreRepo.search(
        new GenreSearchParams({
          filter: {
            name: 'test',
            categoryIds: [
              new CategoryId(categories[0].categoryId.id),
              new CategoryId(categories[2].categoryId.id),
            ],
          },
        }),
      );

      expect(searchOutput.items).toHaveLength(2);
      expect(searchOutput.total).toBe(2);
    });

    it('should apply sort', async () => {
      expect(genreRepo.sortableFields).toStrictEqual(['name', 'createdAt']);

      const category = Category.fake().oneCategory().build();
      await categoryRepo.insert(category);

      const genres = [
        Genre.fake()
          .oneGenre()
          .withName('b')
          .addCategoryId(category.categoryId)
          .build(),
        Genre.fake()
          .oneGenre()
          .withName('a')
          .addCategoryId(category.categoryId)
          .build(),
        Genre.fake()
          .oneGenre()
          .withName('d')
          .addCategoryId(category.categoryId)
          .build(),
        Genre.fake()
          .oneGenre()
          .withName('e')
          .addCategoryId(category.categoryId)
          .build(),
        Genre.fake()
          .oneGenre()
          .withName('c')
          .addCategoryId(category.categoryId)
          .build(),
      ];
      await genreRepo.bulkInsert(genres);

      const searchOutput = await genreRepo.search(
        new GenreSearchParams({
          sort: 'name',
          sortDirection: SortDirection.ASC,
        }),
      );

      expect(searchOutput.items).toEqual([
        genres[1],
        genres[0],
        genres[4],
        genres[2],
        genres[3],
      ]);
    });

    it('should apply paginate, sort and filter', async () => {
      const categories = Category.fake().manyCategories(2).build();
      await categoryRepo.bulkInsert(categories);

      const genres = [
        Genre.fake()
          .oneGenre()
          .withName('test')
          .addCategoryId(categories[0].categoryId)
          .withCreatedAt(new Date(new Date().getTime() + 100))
          .build(),
        Genre.fake()
          .oneGenre()
          .withName('a')
          .addCategoryId(categories[0].categoryId)
          .withCreatedAt(new Date(new Date().getTime() + 200))
          .build(),
        Genre.fake()
          .oneGenre()
          .withName('TEST')
          .addCategoryId(categories[1].categoryId)
          .withCreatedAt(new Date(new Date().getTime() + 300))
          .build(),
        Genre.fake()
          .oneGenre()
          .withName('TeSt')
          .addCategoryId(categories[0].categoryId)
          .withCreatedAt(new Date(new Date().getTime() + 400))
          .build(),
        Genre.fake()
          .oneGenre()
          .withName('test 2')
          .addCategoryId(categories[0].categoryId)
          .withCreatedAt(new Date(new Date().getTime() + 500))
          .build(),
        Genre.fake()
          .oneGenre()
          .withName('Test 3')
          .addCategoryId(categories[0].categoryId)
          .withCreatedAt(new Date(new Date().getTime() + 600))
          .build(),
      ];
      await genreRepo.bulkInsert(genres);

      const searchOutput = await genreRepo.search(
        new GenreSearchParams({
          page: 1,
          perPage: 2,
          sort: 'createdAt',
          sortDirection: SortDirection.ASC,
          filter: {
            name: 'test',
            categoryIds: [new CategoryId(categories[0].categoryId.id)],
          },
        }),
      );

      expect(searchOutput).toMatchObject({
        items: [genres[0], genres[3]],
        total: 4,
        currentPage: 1,
        perPage: 2,
        lastPage: 2,
      });
    });
  });

  describe('transaction mode', () => {
    describe('insert method', () => {
      it('should insert a genre', async () => {
        const category = Category.fake().oneCategory().build();
        await categoryRepo.insert(category);
        const genre = Genre.fake()
          .oneGenre()
          .addCategoryId(category.categoryId)
          .build();

        await uow.start();
        await genreRepo.insert(genre);
        await uow.commit();

        const result = await genreRepo.findById(genre.genreId);
        expect(genre.genreId).toBeValueObject(result!.genreId);
      });

      it('rollback the insertion', async () => {
        const category = Category.fake().oneCategory().build();
        await categoryRepo.insert(category);
        const genre = Genre.fake()
          .oneGenre()
          .addCategoryId(category.categoryId)
          .build();

        await uow.start();
        await genreRepo.insert(genre);
        await uow.rollback();

        await expect(genreRepo.findById(genre.genreId)).resolves.toBeNull();
      });
    });

    describe('bulkInsert method', () => {
      it('should insert a list of genres', async () => {
        const category = Category.fake().oneCategory().build();
        await categoryRepo.insert(category);
        const genres = Genre.fake()
          .manyGenres(2)
          .addCategoryId(category.categoryId)
          .build();

        await uow.start();
        await genreRepo.bulkInsert(genres);
        await uow.commit();

        const [genre1, genre2] = await Promise.all([
          genreRepo.findById(genres[0].genreId),
          genreRepo.findById(genres[1].genreId),
        ]);
        expect(genre1!.genreId).toBeValueObject(genres[0].genreId);
        expect(genre2!.genreId).toBeValueObject(genres[1].genreId);
      });

      it('rollback the bulk insertion', async () => {
        const category = Category.fake().oneCategory().build();
        await categoryRepo.insert(category);
        const genres = Genre.fake()
          .manyGenres(2)
          .addCategoryId(category.categoryId)
          .build();

        await uow.start();
        await genreRepo.bulkInsert(genres);
        await uow.rollback();

        await expect(genreRepo.findById(genres[0].genreId)).resolves.toBeNull();
        await expect(genreRepo.findById(genres[1].genreId)).resolves.toBeNull();
      });
    });

    describe('findById method', () => {
      it('should return a genre', async () => {
        const category = Category.fake().oneCategory().build();
        await categoryRepo.insert(category);
        const genre = Genre.fake()
          .oneGenre()
          .addCategoryId(category.categoryId)
          .build();

        await uow.start();
        await genreRepo.insert(genre);
        const result = await genreRepo.findById(genre.genreId);
        expect(result!.genreId).toBeValueObject(genre.genreId);
        await uow.commit();
      });
    });

    describe('findAll method', () => {
      it('should return a list of genres', async () => {
        const category = Category.fake().oneCategory().build();
        await categoryRepo.insert(category);
        const genres = Genre.fake()
          .manyGenres(2)
          .addCategoryId(category.categoryId)
          .build();

        await uow.start();
        await genreRepo.bulkInsert(genres);
        const result = await genreRepo.findAll();
        expect(result.length).toBe(2);
        await uow.commit();
      });
    });

    describe('findByIds method', () => {
      it('should return a list of genres', async () => {
        const category = Category.fake().oneCategory().build();
        await categoryRepo.insert(category);
        const genres = Genre.fake()
          .manyGenres(2)
          .addCategoryId(category.categoryId)
          .build();

        await uow.start();
        await genreRepo.bulkInsert(genres);
        const result = await genreRepo.findByIds(genres.map((g) => g.genreId));
        expect(result.length).toBe(2);
        await uow.commit();
      });
    });

    describe('existsById method', () => {
      it('should return true if the genre exists', async () => {
        const category = Category.fake().oneCategory().build();
        await categoryRepo.insert(category);
        const genre = Genre.fake()
          .oneGenre()
          .addCategoryId(category.categoryId)
          .build();

        await uow.start();
        await genreRepo.insert(genre);
        const existsResult = await genreRepo.existsById([genre.genreId]);
        expect(existsResult.exists[0]).toBeValueObject(genre.genreId);
        await uow.commit();
      });
    });

    describe('update method', () => {
      it('should update a genre', async () => {
        const category = Category.fake().oneCategory().build();
        await categoryRepo.insert(category);
        const genre = Genre.fake()
          .oneGenre()
          .addCategoryId(category.categoryId)
          .build();
        await genreRepo.insert(genre);

        await uow.start();
        genre.changeName('new name');
        await genreRepo.update(genre);
        await uow.commit();

        const result = await genreRepo.findById(genre.genreId);
        expect(result!.name).toBe(genre.name);
      });

      it('rollback the update', async () => {
        const category = Category.fake().oneCategory().build();
        await categoryRepo.insert(category);
        const genre = Genre.fake()
          .oneGenre()
          .addCategoryId(category.categoryId)
          .build();
        await genreRepo.insert(genre);
        await uow.start();
        genre.changeName('new name');
        await genreRepo.update(genre);
        await uow.rollback();
        const notChangeGenre = await genreRepo.findById(genre.genreId);
        expect(notChangeGenre!.name).not.toBe(genre.name);
      });
    });

    describe('delete method', () => {
      it('should delete a genre', async () => {
        const category = Category.fake().oneCategory().build();
        await categoryRepo.insert(category);
        const genre = Genre.fake()
          .oneGenre()
          .addCategoryId(category.categoryId)
          .build();
        await genreRepo.insert(genre);

        await uow.start();
        await genreRepo.delete(genre.genreId);
        await uow.commit();

        await expect(genreRepo.findById(genre.genreId)).resolves.toBeNull();
      });

      it('rollback the deletion', async () => {
        const category = Category.fake().oneCategory().build();
        await categoryRepo.insert(category);
        const genre = Genre.fake()
          .oneGenre()
          .addCategoryId(category.categoryId)
          .build();
        await genreRepo.insert(genre);

        await uow.start();
        await genreRepo.delete(genre.genreId);
        await uow.rollback();

        const result = await genreRepo.findById(genre.genreId);
        expect(result!.genreId).toBeValueObject(genre.genreId);
        expect(result?.categoryIds.size).toBe(1);
      });
    });

    describe('search method', () => {
      it('should return a list of genres', async () => {
        const category = Category.fake().oneCategory().build();
        await categoryRepo.insert(category);
        const genres = Genre.fake()
          .manyGenres(2)
          .withName('genre')
          .addCategoryId(category.categoryId)
          .build();

        await uow.start();
        await genreRepo.bulkInsert(genres);
        const searchParams = new GenreSearchParams({
          filter: { name: 'genre' },
        });
        const result = await genreRepo.search(searchParams);
        expect(result.items.length).toBe(2);
        expect(result.total).toBe(2);
        await uow.commit();
      });
    });
  });
});
