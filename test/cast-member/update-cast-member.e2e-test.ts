import request from 'supertest';
import { instanceToPlain } from 'class-transformer';
import { CastMember } from '../../src/core/cast-member/domain/cast-member.aggregate';
import { ICastMemberRepository } from '../../src/core/cast-member/domain/cast-member.repository';
import { Uuid } from '../../src/core/shared/domain/value-objects/uuid.vo';
import { CastMemberOutputMapper } from '@core/cast-member/application/common/cast-member.output';
import { UpdateCastMemberFixture } from 'src/nest-modules/cast-members/__tests__/cast-member-fixtures';
import { CastMembersController } from 'src/nest-modules/cast-members/cast-members.controller';
import { CAST_MEMBERS_PROVIDERS } from 'src/nest-modules/cast-members/cast-members.providers';
import { startApp } from 'test/e2e.helper';

describe('E2E Cast Members Controller', () => {
  const uuid = '9366b7dc-2d71-4799-b91c-c64adb205104';

  describe('/cast-members/:id (PATCH)', () => {
    describe('should a response error when id is invalid or not found', () => {
      const nestApp = startApp();
      const faker = CastMember.fake().oneActor().build();
      const arrange = [
        {
          id: '88ff2587-ce5a-4769-a8c6-1d63d29c5f7a',
          sendData: { name: faker.name },
          expected: {
            message:
              'CastMember Not Found using ID 88ff2587-ce5a-4769-a8c6-1d63d29c5f7a',
            statusCode: 404,
            error: 'Not Found',
          },
        },
        {
          id: 'fake id',
          sendData: { name: faker.name },
          expected: {
            statusCode: 400,
            message: 'Validation failed (uuid is expected)',
            error: 'Bad Request',
          },
        },
      ];

      test.each(arrange)(
        'when id is $id',
        async ({ id, sendData, expected }) => {
          return request(nestApp.app.getHttpServer())
            .patch(`/cast-members/${id}`)
            .send(sendData)
            .expect(expected.statusCode)
            .expect(expected);
        },
      );
    });

    describe('should a response error with 400 when request body is invalid', () => {
      const app = startApp();
      const invalidRequest = UpdateCastMemberFixture.arrangeInvalidRequest();
      const arrange = Object.keys(invalidRequest).map((key) => ({
        label: key,
        value: invalidRequest[key],
      }));

      test.each(arrange)('when body is $label', ({ value }) => {
        return request(app.app.getHttpServer())
          .patch(`/cast-members/${uuid}`)
          .send(value.sendData)
          .expect(400)
          .expect(value.expected);
      });
    });

    describe('should a response error with 422 when throw EntityValidationError', () => {
      const app = startApp();
      const validationError =
        UpdateCastMemberFixture.arrangeForEntityValidationError();
      const arrange = Object.keys(validationError).map((key) => ({
        label: key,
        value: validationError[key],
      }));
      let castMemberRepo: ICastMemberRepository;

      beforeEach(() => {
        castMemberRepo = app.app.get<ICastMemberRepository>(
          CAST_MEMBERS_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide,
        );
      });

      test.each(arrange)('when body is $label', async ({ value }) => {
        const castMember = CastMember.fake().oneActor().build();
        await castMemberRepo.insert(castMember);
        return request(app.app.getHttpServer())
          .patch(`/cast-members/${castMember.castMemberId.id}`)
          .send(value.sendData)
          .expect(422)
          .expect(value.expected);
      });
    });

    describe('should update a cast member', () => {
      const app = startApp();
      const arrange = UpdateCastMemberFixture.arrangeForUpdate();
      let castMemberRepo: ICastMemberRepository;

      beforeEach(async () => {
        castMemberRepo = app.app.get<ICastMemberRepository>(
          CAST_MEMBERS_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide,
        );
      });

      test.each(arrange)(
        'when body is $sendData',
        async ({ sendData, expected }) => {
          const castMemberCreated = CastMember.fake().oneActor().build();
          await castMemberRepo.insert(castMemberCreated);

          const res = await request(app.app.getHttpServer())
            .patch(`/cast-members/${castMemberCreated.castMemberId.id}`)
            .send(sendData)
            .expect(200);

          const keyInResponse = UpdateCastMemberFixture.keysInResponse;
          expect(Object.keys(res.body)).toStrictEqual(['data']);
          expect(Object.keys(res.body.data)).toStrictEqual(keyInResponse);

          const id = res.body.data.id;
          const castMemberUpdated = await castMemberRepo.findById(new Uuid(id));
          const presenter = CastMembersController.serialize(
            CastMemberOutputMapper.toOutput(castMemberUpdated),
          );
          const serialized = instanceToPlain(presenter);
          expect(res.body.data).toStrictEqual({
            id: serialized.id,
            createdAt: serialized.createdAt,
            name: expected.name ?? castMemberCreated.name,
            type: expected.type ?? castMemberCreated.type,
          });
        },
      );
    });
  });
});
