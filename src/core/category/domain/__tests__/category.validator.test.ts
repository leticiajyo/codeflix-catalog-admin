import { Category } from '../category.entity';

describe('Category Validator', () => {
  it('should validate category name', () => {
    const category = Category.create({ name: 't'.repeat(101) });

    expect(category.notification.hasErrors()).toBe(true);
    expect(category.notification).notificationContainsErrorMessages([
      {
        name: ['name must be shorter than or equal to 100 characters'],
      },
    ]);
  });
});
