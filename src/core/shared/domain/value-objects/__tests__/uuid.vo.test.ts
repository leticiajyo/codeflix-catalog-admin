import { InvalidUuidError, Uuid } from '../uuid.vo';
import { validate as uuidValidate } from 'uuid';

describe('Uuid Value Object', () => {
  describe('constructor', () => {
    it('should generate uuid value when no value is given', () => {
      const uuid = new Uuid();

      expect(uuid.id).toBeDefined();
      expect(uuidValidate(uuid.id)).toBeTruthy();
    });

    it('should create uuid when valid value is given', () => {
      const uuid = new Uuid('7301aa7b-0d7a-4bfc-bfc0-d8c234dc6351');

      expect(uuid.id).toBe('7301aa7b-0d7a-4bfc-bfc0-d8c234dc6351');
    });

    it('should throw error when invalid value is given', () => {
      expect(() => new Uuid('invalid uuid')).toThrow(InvalidUuidError);
    });
  });
});
