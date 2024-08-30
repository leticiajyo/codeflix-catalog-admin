import { Video } from '@core/video/domain/video.aggregate';
import { VideoInMemoryRepository } from '../video-in-memory.repository';
import {
  SearchParams,
  SortDirection,
} from '@core/shared/domain/repository/search-params';
import { CategoryId } from '@core/category/domain/category.aggregate';
import { GenreId } from '@core/genre/domain/genre.aggregate';
import { CastMemberId } from '@core/cast-member/domain/cast-member.aggregate';

describe('Video In Memory Repository', () => {
  let repository: VideoInMemoryRepository;

  beforeEach(() => (repository = new VideoInMemoryRepository()));

  it('should not filter items when filter object is null', async () => {
    const items = Video.fake().manyVideosWithoutMedias(2).build();
    repository.items = items;

    const searchResult = await repository.search(new SearchParams());

    expect(searchResult.items).toEqual(items);
  });

  it('should filter items by title', async () => {
    const entity1 = Video.fake()
      .oneVideoWithoutMedias()
      .withTitle('title')
      .build();
    const entity2 = Video.fake()
      .oneVideoWithoutMedias()
      .withTitle('TITLE')
      .build();
    const entity3 = Video.fake()
      .oneVideoWithoutMedias()
      .withTitle('other')
      .build();
    repository.items = [entity1, entity2, entity3];

    const searchResult = await repository.search(
      new SearchParams({ filter: { title: 'title' } }),
    );

    expect(searchResult.items).toStrictEqual(
      expect.arrayContaining([entity1, entity2]),
    );
  });

  it('should filter items by category id', async () => {
    const categoryId1 = new CategoryId();
    const categoryId2 = new CategoryId();
    const categoryId3 = new CategoryId();
    const entity1 = Video.fake()
      .oneVideoWithoutMedias()
      .addCategoryId(categoryId1)
      .build();
    const entity2 = Video.fake()
      .oneVideoWithoutMedias()
      .addCategoryId(categoryId1)
      .addCategoryId(categoryId2)
      .build();
    const entity3 = Video.fake()
      .oneVideoWithoutMedias()
      .addCategoryId(categoryId3)
      .build();
    repository.items = [entity1, entity2, entity3];

    const searchResult = await repository.search(
      new SearchParams({ filter: { categoryIds: [categoryId1] } }),
    );

    expect(searchResult.items).toEqual(
      expect.arrayContaining([entity1, entity2]),
    );
  });

  it('should filter items by genre id', async () => {
    const genreId1 = new GenreId();
    const genreId2 = new GenreId();
    const genreId3 = new GenreId();
    const entity1 = Video.fake()
      .oneVideoWithoutMedias()
      .addGenreId(genreId1)
      .build();
    const entity2 = Video.fake()
      .oneVideoWithoutMedias()
      .addGenreId(genreId1)
      .addGenreId(genreId2)
      .build();
    const entity3 = Video.fake()
      .oneVideoWithoutMedias()
      .addGenreId(genreId3)
      .build();
    repository.items = [entity1, entity2, entity3];

    const searchResult = await repository.search(
      new SearchParams({ filter: { genreIds: [genreId1] } }),
    );

    expect(searchResult.items).toEqual(
      expect.arrayContaining([entity1, entity2]),
    );
  });

  it('should filter items by cast member id', async () => {
    const castMemberId1 = new CastMemberId();
    const castMemberId2 = new CastMemberId();
    const castMemberId3 = new CastMemberId();
    const entity1 = Video.fake()
      .oneVideoWithoutMedias()
      .addCastMemberId(castMemberId1)
      .build();
    const entity2 = Video.fake()
      .oneVideoWithoutMedias()
      .addCastMemberId(castMemberId1)
      .addCastMemberId(castMemberId2)
      .build();
    const entity3 = Video.fake()
      .oneVideoWithoutMedias()
      .addCastMemberId(castMemberId3)
      .build();
    repository.items = [entity1, entity2, entity3];

    const searchResult = await repository.search(
      new SearchParams({ filter: { castMemberIds: [castMemberId1] } }),
    );

    expect(searchResult.items).toEqual(
      expect.arrayContaining([entity1, entity2]),
    );
  });

  it('should sort items based on given params', async () => {
    const entity1 = Video.fake()
      .oneVideoWithoutMedias()
      .withTitle('title 1')
      .build();
    const entity2 = Video.fake()
      .oneVideoWithoutMedias()
      .withTitle('title 2')
      .build();
    repository.items = [entity1, entity2];

    const searchResult = await repository.search(
      new SearchParams({ sort: 'title', sortDirection: SortDirection.DESC }),
    );

    expect(searchResult.items).toEqual([entity2, entity1]);
  });

  it('should sort by createdAt when sort param is null', async () => {
    const entity1 = Video.fake()
      .oneVideoWithoutMedias()
      .withTitle('title 1')
      .withCreatedAt(new Date('2024-06-06T08:00:00'))
      .build();
    const entity2 = Video.fake()
      .oneVideoWithoutMedias()
      .withTitle('title 2')
      .withCreatedAt(new Date('2024-07-06T08:00:00'))
      .build();

    repository.items = [entity1, entity2];

    const searchResult = await repository.search(new SearchParams());

    expect(searchResult.items).toEqual([entity2, entity1]);
  });
});
