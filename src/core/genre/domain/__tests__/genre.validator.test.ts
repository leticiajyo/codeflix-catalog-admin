import { CategoryId } from '@core/category/domain/category.aggregate';
import { Genre } from '../genre.aggregate';

describe('Genre Validator', () => {
  it('should validate genre name', () => {
    const genre = Genre.create({
      name: 't'.repeat(101),
      categoryIds: [new CategoryId()],
    });

    expect(genre.notification.hasErrors()).toBe(true);
    expect(genre.notification).notificationContainsErrorMessages([
      {
        name: ['name must be shorter than or equal to 100 characters'],
      },
    ]);
  });
});
