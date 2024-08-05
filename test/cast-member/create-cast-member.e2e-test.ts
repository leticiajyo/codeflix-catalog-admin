import request from 'supertest';
import { instanceToPlain } from 'class-transformer';
import { ICastMemberRepository } from '../../src/core/cast-member/domain/cast-member.repository';
import { CastMemberId } from '../../src/core/cast-member/domain/cast-member.aggregate';
import { CastMemberOutputMapper } from '@core/cast-member/application/common/cast-member.output';
import { CreateCastMemberFixture } from 'src/nest-modules/cast-members/__tests__/cast-member-fixtures';
import { CastMembersController } from 'src/nest-modules/cast-members/cast-members.controller';
import { CAST_MEMBERS_PROVIDERS } from 'src/nest-modules/cast-members/cast-members.providers';
import { startApp } from 'test/e2e.helper';

describe('E2E Cast Members Controller', () => {
  describe('/cast-members (POST)', () => {
    describe('should a response error with 400 when request body is invalid', () => {
      const app = startApp();
      const invalidRequest = CreateCastMemberFixture.arrangeInvalidRequest();
      const arrange = Object.keys(invalidRequest).map((key) => ({
        label: key,
        value: invalidRequest[key],
      }));

      test.each(arrange)('when body is $label', ({ value }) => {
        return request(app.app.getHttpServer())
          .post('/cast-members')
          .send(value.sendData)
          .expect(400)
          .expect(value.expected);
      });
    });

    describe('should a response error with 422 when throw EntityValidationError', () => {
      const app = startApp();
      const validationError =
        CreateCastMemberFixture.arrangeForEntityValidationError();
      const arrange = Object.keys(validationError).map((key) => ({
        label: key,
        value: validationError[key],
      }));

      test.each(arrange)('when body is $label', ({ value }) => {
        return request(app.app.getHttpServer())
          .post('/cast-members')
          .send(value.sendData)
          .expect(422)
          .expect(value.expected);
      });
    });

    describe('should create a cast member', () => {
      const app = startApp();
      const arrange = CreateCastMemberFixture.arrangeForCreate();
      let castMemberRepo: ICastMemberRepository;

      beforeEach(async () => {
        castMemberRepo = app.app.get<ICastMemberRepository>(
          CAST_MEMBERS_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide,
        );
      });

      test.each(arrange)(
        'when body is $sendData',
        async ({ sendData, expected }) => {
          const res = await request(app.app.getHttpServer())
            .post('/cast-members')
            .send(sendData)
            .expect(201);

          const keyInResponse = CreateCastMemberFixture.keysInResponse;
          expect(Object.keys(res.body)).toStrictEqual(['data']);
          expect(Object.keys(res.body.data)).toStrictEqual(keyInResponse);

          const id = res.body.data.id;
          const castMemberCreated = await castMemberRepo.findById(
            new CastMemberId(id),
          );
          const presenter = CastMembersController.serialize(
            CastMemberOutputMapper.toOutput(castMemberCreated),
          );
          const serialized = instanceToPlain(presenter);
          expect(res.body.data).toStrictEqual({
            id: serialized.id,
            createdAt: serialized.createdAt,
            ...expected,
          });
        },
      );
    });
  });
});
