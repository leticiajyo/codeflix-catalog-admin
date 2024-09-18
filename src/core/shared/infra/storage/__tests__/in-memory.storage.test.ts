import { InMemoryStorage } from '../in-memory.storage';

describe('In Memory Storage', () => {
  let storage: InMemoryStorage;

  beforeEach(() => {
    storage = new InMemoryStorage();
  });

  describe('store and get', () => {
    it('should store and retrieve data from the storage', async () => {
      const data = Buffer.from('test data');
      const id = 'test-id';
      const mimeType = 'text/plain';

      await storage.store({ data, id, mimeType });

      const result = await storage.get(id);
      expect(result).toEqual({ data, mimeType });
    });
  });
});
