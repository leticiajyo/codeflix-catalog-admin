import request from 'supertest';

import { startApp } from 'test/e2e.helper';

describe('E2E Categories Controller', () => {
  const appHelper = startApp();

  describe('unauthenticated', () => {
    test('should return 401 when not authenticated', () => {
      return request(appHelper.app.getHttpServer())
        .post('/categories')
        .send({})
        .expect(401);
    });

    test('should return 403 when not authenticated as admin', () => {
      return request(appHelper.app.getHttpServer())
        .post('/categories')
        .authenticate(appHelper.app, false)
        .send({})
        .expect(403);
    });
  });
});
